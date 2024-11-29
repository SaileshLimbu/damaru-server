import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../../common/exceptions/CustomException';

/**
 * CustomException class implements the NestJS ExceptionFilter interface
 * to handle all uncaught exceptions in a centralized manner.
 */
@Catch()
export class ExceptionHandler implements ExceptionFilter {
  /**
   * Constructor to inject the Logger service.
   * @param logger - The logger instance from nestjs-pino.
   */
  constructor(private readonly logger: Logger) {}

  /**
   * Method to catch and handle exceptions.
   * @param exception - The caught exception.
   * @param host - ArgumentsHost to switch to HTTP context and get the response object.
   */
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode: number;
    let message: string | object = exception.message;

    if (exception instanceof CustomException) {
      statusCode = exception.statusCode;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.getResponse();
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Log the exception details
    this.logger.error(
      exception.message,
      JSON.stringify({
        statusCode,
        stack: exception.stack,
      }),
    );

    // Send the error response
    response.status(statusCode).json({
      statusCode,
      message,
      stack: exception.stack,
    });
  }
}

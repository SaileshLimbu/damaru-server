import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from '../../common/exceptions/CustomException';
import { ConfigService } from '@nestjs/config';
import { Environments } from '../../common/interfaces/environments';
import { SQLITE_CONSTRAINT } from '../constants/exceptions';

/**
 * CustomException class implements the NestJS ExceptionFilter interface
 * to handle all uncaught exceptions in a centralized manner.
 */
@Catch()
export class ExceptionHandler implements ExceptionFilter {
  /**
   * Constructor to inject the Logger service.
   * @param logger - The logger instance from nestjs-pino.
   * @param configService
   */
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {}

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
    console.log('interception exception', exception);
    if (exception instanceof CustomException) {
      statusCode = exception.statusCode;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.getResponse();
    }
    else if(exception.message.includes(SQLITE_CONSTRAINT) ){
      statusCode = HttpStatus.NOT_MODIFIED;
      message = 'Not modified due to foreign key constraint failure';
    }
    else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Log the exception details
    this.logger.error(
      exception.message,
      JSON.stringify({
        statusCode,
        stack: exception.stack
      })
    );

    const env = this.configService.get<string>('ENVIRONMENT')
    if(env == Environments.DEVELOPMENT) {
      // Send the error response
      response.status(statusCode).json({
        statusCode,
        message,
        stack: exception.stack
      });
    } else {
      // Send the error response
      response.status(statusCode).json({
        statusCode,
        message
      });
    }

  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

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
  constructor(
    private readonly logger: Logger
  ) {}

  /**
   * Method to catch and handle exceptions.
   * @param exception - The caught exception.
   */
  catch(exception: Error, host: ArgumentsHost): void {
    const message = exception.message;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the exception details
    this.logger.error(
      exception.message,
      JSON.stringify({
        stack: exception.stack
      })
    );
    response.status(HttpStatus.OK).json({
      status: false,
      message
    });
  }
}

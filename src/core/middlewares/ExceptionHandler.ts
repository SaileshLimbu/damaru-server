import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * CustomException class implements the NestJS ExceptionFilter interface
 * to handle all uncaught exceptions in a centralized manner.
 */
@Catch()
export class ExceptionHandler implements ExceptionFilter {
  /**
   * Constructor to inject the Logger service.
   */
  constructor(
  ) {}

  /**
   * Method to catch and handle exceptions.
   * @param exception - The caught exception.
   * @param host host
   */
  catch(exception: Error, host: ArgumentsHost): void {
    const message = exception.message;
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Log the exception details
    console.error(
      exception.message,
      JSON.stringify({
        stack: exception.stack
      })
    );
    response.status(HttpStatus.OK).json({
      status: false,
      message,
      stack: exception.stack
    });
  }
}

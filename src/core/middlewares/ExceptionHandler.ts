import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Environments } from '../../common/interfaces/environments';

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

    const message = exception.message;

    // Log the exception details
    this.logger.error(
      exception.message,
      JSON.stringify({
        stack: exception.stack
      })
    );

    const env = this.configService.get<string>('ENVIRONMENT')
    if(env == Environments.DEVELOPMENT) {
      // Send the error response
      response.status(HttpStatus.OK).json({
        status: false,
        message,
        stack: exception.stack
      });
    } else {
      // Send the error response
      response.status(HttpStatus.OK).json({
        status: false,
        message
      });
    }

  }
}

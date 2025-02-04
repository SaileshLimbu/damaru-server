import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { DamaruException } from '../../common/interfaces/DamaruException';

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
  catch(exception: Error): void {
    const message = exception.message;

    // Log the exception details
    this.logger.error(
      exception.message,
      JSON.stringify({
        stack: exception.stack
      })
    );
    throw new DamaruException(message, exception.stack);
  }
}

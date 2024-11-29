/**
 * The Exception interface defines properties commonly associated with exceptions.
 */
interface Exception {
  /**
   * The HTTP status code associated with the exception.
   */
  statusCode: number;

  /**
   * A descriptive message explaining the nature of the exception.
   */
  message: string;

  /**
   * An optional string representing the stack trace of the exception.
   */
  stack?: string;
}

/**
 * The CustomException class extends the built-in Error class and implements the Exception interface.
 * It is designed to represent exceptions with additional HTTP status code information.
 */
export class CustomException extends Error implements Exception {
  /**
   * The HTTP status code associated with the exception.
   */
  statusCode: number;

  /**
   * Creates a new instance of CustomException.
   * @param {number} statusCode - The HTTP status code to be associated with the exception.
   * @param {string} message - A descriptive message explaining the nature of the exception.
   * @param {string | undefined} stack - An optional string representing the stack trace of the exception.
   */
  constructor(statusCode: number, message: string, stack?: string) {
    // Call the constructor of the base Error class with the provided message.
    super(message);

    // Set the HTTP status code property.
    this.statusCode = statusCode;

    // Set the name property to identify the type of exception.
    this.name = 'CustomException';

    // Set the stack property if provided.
    this.stack = stack;
  }
}

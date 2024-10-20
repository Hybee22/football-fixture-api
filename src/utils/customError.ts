/**
 * Custom error class for application-specific errors.
 * Extends the built-in Error class with additional properties.
 */
export class AppError extends Error {
  /**
   * HTTP status code associated with the error.
   */
  statusCode: number;

  /**
   * Optional object containing detailed error information.
   */
  errors?: { [key: string]: string };

  /**
   * Creates an instance of AppError.
   * @param message - The error message.
   * @param statusCode - The HTTP status code associated with the error.
   * @param errors - Optional object containing detailed error information.
   */
  constructor(
    message: string,
    statusCode: number,
    errors?: { [key: string]: string }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

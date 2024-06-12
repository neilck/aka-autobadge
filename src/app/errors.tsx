/**
 * @file errorUtils.ts
 * @summary Utility functions for handling errors.
 */

type ErrorWithMessage = {
  message: string;
};

/**
 * Checks if the provided value is an object with a 'message' property, indicating it's an ErrorWithMessage.
 *
 * @param {unknown} error - The value to check.
 * @returns {boolean} True if the value is an ErrorWithMessage, false otherwise.
 */
function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

/**
 * Converts a value of unknown type to an ErrorWithMessage.
 * If the value is already an ErrorWithMessage, returns it unchanged.
 * If not, constructs a new ErrorWithMessage with the stringified value.
 *
 * @param {unknown} maybeError - The value to convert.
 * @returns {ErrorWithMessage} The converted ErrorWithMessage.
 */
function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

/**
 * Converts errors of different types to string.
 *
 * @param {unknown} error - The error to convert.
 * @returns {string} The error message.
 */
function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export default getErrorMessage;

import { RetryOptions } from './types';

/**
 * A decorator function that retries a function if specified exceptions are thrown.
 *
 * @param options - Retry configuration options
 */
export function retry(options: RetryOptions = {}) {
  const {
    maxAttempts = 5,
    delaySeconds = 3,
    backoffFactor = 2,
    exceptions = [Error]
  } = options;

  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = async function (this: any, ...args: any[]) {
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          attempts++;

          // Check if error is in the list of exceptions to retry on
          const shouldRetry = exceptions.some(
            ExceptionType => error instanceof ExceptionType
          );

          if (!shouldRetry || attempts === maxAttempts) {
            throw error;
          }

          const delay = delaySeconds * Math.pow(backoffFactor, attempts - 1);
          console.log(
            `Attempt ${attempts}/${maxAttempts} failed: ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay} seconds...`
          );

          await sleep(delay * 1000);
        }
      }
    } as T;

    return descriptor;
  };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function for standalone use (not as decorator)
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 5,
    delaySeconds = 3,
    backoffFactor = 2,
    exceptions = [Error]
  } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      attempts++;

      const shouldRetry = exceptions.some(
        ExceptionType => error instanceof ExceptionType
      );

      if (!shouldRetry || attempts === maxAttempts) {
        throw error;
      }

      const delay = delaySeconds * Math.pow(backoffFactor, attempts - 1);
      console.log(
        `Attempt ${attempts}/${maxAttempts} failed: ${error instanceof Error ? error.message : String(error)}. Retrying in ${delay} seconds...`
      );

      await sleep(delay * 1000);
    }
  }

  throw new Error('Max attempts exceeded');
}
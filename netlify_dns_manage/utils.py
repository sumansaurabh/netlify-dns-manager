import functools
import time

def retry(retry=5, delay_seconds=3, backoff_factor=2, exceptions=(Exception,)):
    """
    A decorator that retries a function if the specified exceptions are raised.
    
    Parameters:
        retry (int): Maximum number of attempts.
        delay_seconds (int): Initial delay between attempts in seconds.
        backoff_factor (int): Factor by which the delay is multiplied for each retry.
        exceptions (tuple): Exceptions to check for retries.
    """
    max_attempts = retry
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while attempts < max_attempts:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    attempts += 1
                    if attempts == max_attempts:
                        raise
                    delay = delay_seconds * (backoff_factor ** (attempts - 1))
                    print(f"Attempt {attempts}/{max_attempts} failed: {str(e)}. Retrying in {delay} seconds...")
                    time.sleep(delay)
        return wrapper
    return decorator
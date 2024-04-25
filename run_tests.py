# run_tests.py
import unittest

if __name__ == "__main__":
    tests = unittest.TestLoader().discover('tests', pattern='test_*.py')
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(tests)

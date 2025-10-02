
# Netlify DNS Manager

[![Python application test](https://github.com/sumansaurabh/netlify-dns-manager/actions/workflows/test.yml/badge.svg)](https://github.com/sumansaurabh/netlify-dns-manager/actions/workflows/test.yml)

The `netlify-dns-manager` is a command-line tool designed to manage DNS records for domains hosted on Netlify. It allows users to either import DNS records from a local zone file into Netlify or export Netlify DNS records to a local zone file.

## Features

- **Import DNS Records**: Upload DNS records from a local DNS zone file to Netlify.
- **Export DNS Records**: Save DNS records from Netlify to a local zone file.
- **Zone File Parsing**: Parse standard DNS zone files with support for multiple record types.
- **Retry Logic**: Built-in retry mechanism with exponential backoff for API calls.
- **Comprehensive Testing**: Full test suite with unit tests for all major components.

## Project Structure

```
netlify-dns-manager/
├── netlify_dns_manage/          # Main package directory
│   ├── __init__.py             # Package initialization
│   ├── main.py                 # CLI entry point and argument parsing
│   ├── driver.py               # Core business logic for sync and export
│   ├── parser.py               # DNS zone file parsing functionality
│   ├── netlify_api.py          # Netlify API client wrapper
│   └── utils.py                # Utility functions (retry decorator)
├── tests/                      # Test suite
│   ├── __init__.py            # Test package initialization
│   ├── test_parser.py         # Tests for zone file parsing
│   └── test_netlify_api.py    # Tests for Netlify API client
├── setup.py                   # Package setup and dependencies
├── requirements.txt           # Python dependencies
├── Pipfile                   # Pipenv configuration
├── run_tests.py             # Test runner script
├── LICENSE                  # MIT License
└── README.md               # This file
```

### Core Components

#### 1. `main.py` - CLI Interface
- Entry point for the command-line tool
- Handles argument parsing using `argparse`
- Validates required parameters based on execution type
- Routes commands to appropriate driver functions

#### 2. `driver.py` - Business Logic
- `sync_dns_records()`: Imports DNS records from zone file to Netlify
- `convert_to_zone_file()`: Exports Netlify DNS records to local zone file
- Handles record comparison, updates, and creation
- Filters out unsupported record types (SOA, NS, MX, NETLIFY)

#### 3. `parser.py` - Zone File Processing
- Parses DNS zone files using the `zonefile-parser` library
- Normalizes domain names and record data
- Handles various DNS record types (A, AAAA, CNAME, TXT, SRV, etc.)
- Converts absolute domain names to relative format for Netlify

#### 4. `netlify_api.py` - API Client
- Wrapper for Netlify DNS API endpoints
- Handles authentication with PAT (Personal Access Token)
- Methods for listing, creating, and updating DNS records
- Includes retry logic for robust API interactions

#### 5. `utils.py` - Utilities
- `@retry` decorator with configurable retry attempts and backoff
- Exponential backoff strategy for handling API rate limits
- Customizable exception handling

## Installation

### Prerequisites
- Python 3.6 or higher
- pip or pipenv for dependency management

### Install from PyPI
```bash
pip install netlify-dns-manager
```

### Install from Source
```bash
git clone https://github.com/sumansaurabh/netlify-dns-manager.git
cd netlify-dns-manager
pip install -r requirements.txt
pip install -e .
```

### Development Setup
```bash
git clone https://github.com/sumansaurabh/netlify-dns-manager.git
cd netlify-dns-manager
pipenv install --dev
pipenv shell
```

## Usage

### Command Line Interface

The tool provides two main operations: `import` and `export`.

#### Importing DNS Records

Import DNS records from a zone file to Netlify:

```bash
netlify-dns-manage import <token> -zp <path_to_zone_file> -d <domain_name>
```

**Example:**
```bash
netlify-dns-manage import nfp_your_token_here -zp ./example.com.zone -d example.com
```

#### Exporting DNS Records

Export DNS records from Netlify to a local zone file:

```bash
netlify-dns-manage export <token> -d <domain_name>
```

**Example:**
```bash
netlify-dns-manage export nfp_your_token_here -d example.com
```

This will create a file named `netlify_dns_zone_file.txt` in the current directory.

### Parameters

| Parameter | Description | Required | Notes |
|-----------|-------------|----------|-------|
| `execution_type` | Operation type (`import` or `export`) | Yes | First positional argument |
| `token` | Netlify Personal Access Token | Yes | Second positional argument |
| `-zp`, `--zone_path` | Path to DNS zone file | Yes (import only) | Must be valid file path |
| `-d`, `--domain_name` | Target domain name | Yes | Must match domain in Netlify |

### Supported DNS Record Types

#### Fully Supported (Import/Export)
- **A**: IPv4 address records
- **AAAA**: IPv6 address records
- **CNAME**: Canonical name records
- **TXT**: Text records

#### Export Only
- **All Netlify-supported record types** are exported to zone file

#### Skipped Records (Import)
- **SOA**: Start of Authority (managed by Netlify)
- **NS**: Name Server (managed by Netlify)
- **MX**: Mail Exchange (currently skipped)
- **NETLIFY**: Netlify-specific records

## Development

### Running Tests

Run the complete test suite:

```bash
# Using the test runner
python run_tests.py

# Using unittest directly
python -m unittest discover tests

# Using pytest (if installed)
pytest tests/
```

### Test Coverage

The project includes comprehensive tests for:

- **Zone File Parsing**: Various zone file formats, edge cases, malformed data
- **API Client**: Mock testing of Netlify API interactions
- **Error Handling**: Invalid inputs, network failures, authentication errors
- **Edge Cases**: Empty files, unsupported record types, case sensitivity

### Code Quality

The codebase follows Python best practices:

- **Error Handling**: Comprehensive exception handling with user-friendly messages
- **Retry Logic**: Robust retry mechanisms for API reliability
- **Logging**: Informative output for debugging and monitoring
- **Modularity**: Clear separation of concerns across modules
- **Testing**: High test coverage with mock testing for external dependencies

## Dependencies

### Runtime Dependencies
- `requests`: HTTP client for Netlify API interactions
- `dnspython`: DNS toolkit for Python
- `zonefile-parser`: DNS zone file parsing library

### Development Dependencies
- `unittest`: Testing framework (built-in)
- `unittest.mock`: Mock testing utilities (built-in)

## API Authentication

To use this tool, you need a Netlify Personal Access Token (PAT):

1. Log in to your Netlify account
2. Go to User Settings → Applications
3. Click "New access token"
4. Give it a descriptive name and generate
5. Use the token with the `netlify-dns-manage` command

**Security Note**: Keep your access token secure and never commit it to version control.

## Limitations

- MX records are currently skipped during import operations
- SOA and NS records are managed by Netlify and cannot be modified
- The tool requires the domain to already exist in your Netlify account
- Zone file export creates a single file in the current directory

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with appropriate tests
4. Run the test suite: `python run_tests.py`
5. Submit a pull request with a clear description

### Development Guidelines

- Write tests for new features
- Follow existing code style and conventions
- Update documentation for significant changes
- Ensure all tests pass before submitting PR

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify your Netlify PAT is correct and has DNS permissions
2. **Domain Not Found**: Ensure the domain exists in your Netlify account
3. **Zone File Parsing Errors**: Check zone file format and syntax
4. **API Rate Limits**: The tool includes retry logic, but may need delays for heavy usage

### Debug Mode

For verbose output, you can modify the source to enable debug logging or add print statements as needed.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter issues or have questions:

- **GitHub Issues**: [netlify-dns-manager/issues](https://github.com/sumansaurabh/netlify-dns-manager/issues)
- **Documentation**: This README and inline code comments
- **Community**: Check existing issues for common solutions

## Changelog

### Version 0.4
- Current stable release
- Core import/export functionality
- Comprehensive test suite
- Retry logic with exponential backoff
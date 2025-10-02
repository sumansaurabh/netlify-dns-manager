
# Netlify DNS Manager

[![Python application test](https://github.com/sumansaurabh/netlify-dns-manager/actions/workflows/test.yml/badge.svg)](https://github.com/sumansaurabh/netlify-dns-manager/actions/workflows/test.yml)
[![PyPI version](https://badge.fury.io/py/netlify-dns-manager.svg)](https://badge.fury.io/py/netlify-dns-manager)
[![Python Support](https://img.shields.io/pypi/pyversions/netlify-dns-manager.svg)](https://pypi.org/project/netlify-dns-manager/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The `netlify-dns-manager` is a powerful command-line tool designed to streamline DNS record management for domains hosted on Netlify. It provides bidirectional synchronization capabilities, allowing users to either import DNS records from local zone files into Netlify or export existing Netlify DNS records to local zone files.

## ✨ Features

- **🔄 Bidirectional Sync**: Import DNS records from local zone files to Netlify or export Netlify records to zone files
- **⚡ Smart Record Handling**: Automatically skips system records (SOA, NS, MX, NETLIFY) during operations
- **🔁 Retry Mechanism**: Built-in retry logic with exponential backoff for API reliability
- **🎯 Domain-Aware Parsing**: Intelligent handling of domain-specific record formatting
- **📝 Zone File Generation**: Creates properly formatted DNS zone files compatible with standard DNS tools
- **🛡️ Error Handling**: Comprehensive error handling and informative logging
- **🧪 Well Tested**: Comprehensive test suite ensuring reliability

## 📦 Installation

### Requirements

- Python 3.6 or higher
- Valid Netlify account with API access

### Install from PyPI

```bash
pip install netlify-dns-manager
```

### Install from Source

```bash
git clone https://github.com/sumansaurabh/netlify-dns-manager.git
cd netlify-dns-manager
pip install -e .
```

### Development Installation

```bash
git clone https://github.com/sumansaurabh/netlify-dns-manager.git
cd netlify-dns-manager
pip install -r requirements.txt
```

## 🚀 Usage

### Command Line Interface

The tool provides a simple command-line interface with two main operations:

#### 📤 Importing DNS Records

Import DNS records from a local zone file to Netlify:

```bash
netlify-dns-manage import <netlify_token> -zp <zone_file_path> -d <domain_name>
```

**Example:**
```bash
netlify-dns-manage import nfp_your_token_here -zp ./example.zone -d example.com
```

#### 📥 Exporting DNS Records

Export DNS records from Netlify to a local zone file:

```bash
netlify-dns-manage export <netlify_token> -d <domain_name>
```

**Example:**
```bash
netlify-dns-manage export nfp_your_token_here -d example.com
```

This will create a file named `netlify_dns_zone_file.txt` in the current directory.

### 🔧 Command Line Arguments

| Argument | Description | Required | Notes |
|----------|-------------|----------|-------|
| `execution_type` | Operation type: `import` or `export` | ✅ | Must be first argument |
| `token` | Netlify Personal Access Token | ✅ | Generate from Netlify dashboard |
| `-d, --domain_name` | Target domain name | ✅ | Must be configured in Netlify |
| `-zp, --zone_path` | Path to zone file | ⚠️ | Required only for `import` |

### 🔑 Getting a Netlify Token

1. Log in to your [Netlify account](https://app.netlify.com)
2. Go to **User Settings** → **Applications**
3. Click **New access token**
4. Give it a descriptive name and click **Generate token**
5. Copy the token (it starts with `nfp_`)

## 📁 Project Structure

```
netlify-dns-manager/
├── netlify_dns_manage/          # Main package directory
│   ├── __init__.py             # Package initialization
│   ├── main.py                 # CLI entry point and argument parsing
│   ├── driver.py               # Core sync logic and operations
│   ├── netlify_api.py          # Netlify API client wrapper
│   ├── parser.py               # DNS zone file parsing utilities
│   └── utils.py                # Utility functions (retry decorator)
├── tests/                      # Test suite
│   ├── test_netlify_api.py     # API client tests
│   └── test_parser.py          # Parser functionality tests
├── .github/workflows/          # CI/CD automation
│   ├── test.yml               # Automated testing
│   └── pypi.yml               # PyPI publishing
├── requirements.txt            # Package dependencies
├── setup.py                   # Package configuration
├── run_tests.py               # Local test runner
└── README.md                  # This file
```

## 🏗️ Architecture

### Core Components

1. **CLI Interface (`main.py`)**: Handles command-line argument parsing and validation
2. **Driver Module (`driver.py`)**: Contains the core business logic for import/export operations
3. **Netlify API Client (`netlify_api.py`)**: Wrapper for Netlify's REST API with retry logic
4. **Zone File Parser (`parser.py`)**: Handles parsing and formatting of DNS zone files
5. **Utilities (`utils.py`)**: Common utilities including the retry decorator

### Data Flow

```
Zone File → Parser → Driver ← Netlify API ← Netlify
                       ↓
                   Local Records ↔ Remote Records
                       ↓
                   Sync Operations (Create/Update)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python run_tests.py

# Run specific test files
python -m unittest tests.test_parser
python -m unittest tests.test_netlify_api

# Run with coverage (if installed)
python -m coverage run run_tests.py
python -m coverage report
```

### Test Structure

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **Mock Tests**: Test API interactions without making real requests

## 🔄 Supported DNS Record Types

### Import Operation
- ✅ **A Records**: IPv4 address records
- ✅ **AAAA Records**: IPv6 address records  
- ✅ **CNAME Records**: Canonical name records
- ✅ **TXT Records**: Text records
- ❌ **SOA Records**: Skipped (managed by Netlify)
- ❌ **NS Records**: Skipped (managed by Netlify)
- ❌ **MX Records**: Skipped (currently not supported)

### Export Operation
- ✅ All record types except `NETLIFY` system records

## ⚠️ Important Notes

- **Backup First**: Always backup your existing DNS configuration before performing import operations
- **Zone File Format**: Ensure your zone files follow standard DNS zone file format
- **Domain Ownership**: The domain must be already configured in your Netlify account
- **API Limits**: The tool includes retry logic to handle API rate limits
- **Record Conflicts**: Import operation will update existing records with matching name and type

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/netlify-dns-manager.git
   cd netlify-dns-manager
   ```
3. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
5. **Run tests** to ensure everything works:
   ```bash
   python run_tests.py
   ```

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** and add tests
3. **Run tests** to ensure nothing breaks:
   ```bash
   python run_tests.py
   ```
4. **Commit your changes**:
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub

### Contribution Guidelines

- **Code Style**: Follow PEP 8 python style guidelines
- **Tests**: Add tests for new functionality
- **Documentation**: Update documentation for new features
- **Commit Messages**: Use clear, descriptive commit messages
- **Issues First**: For major changes, open an issue first to discuss

## 📋 Changelog

### Version 0.4 (Latest)
- Improved error handling and logging
- Enhanced retry mechanism with exponential backoff
- Better zone file parsing with domain-aware formatting
- Comprehensive test coverage

### Previous Versions
- See [GitHub Releases](https://github.com/sumansaurabh/netlify-dns-manager/releases) for detailed changelog

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Distribution  
- ✅ Modification
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 🆘 Support & Troubleshooting

### Common Issues

**Issue**: `Failed to fetch DNS zones`
- **Solution**: Verify your Netlify token has the correct permissions

**Issue**: `No records found in the zone file`  
- **Solution**: Check zone file format and ensure it contains valid DNS records

**Issue**: `Domain not found in Netlify`
- **Solution**: Ensure the domain is added to your Netlify account first

### Getting Help

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/sumansaurabh/netlify-dns-manager/issues)
- 💡 **Feature Requests**: [GitHub Issues](https://github.com/sumansaurabh/netlify-dns-manager/issues)  
- 📖 **Documentation**: This README and inline code comments
- 💬 **Discussions**: [GitHub Discussions](https://github.com/sumansaurabh/netlify-dns-manager/discussions)

### Performance Tips

- For large zone files, consider splitting into smaller batches
- Use the export function to backup your DNS configuration regularly
- Monitor API rate limits during bulk operations

---

<div align="center">

**Made with ❤️ by the community**

[⭐ Star this project](https://github.com/sumansaurabh/netlify-dns-manager) if you find it useful!

</div>
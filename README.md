
# Netlify DNS Manager

The `netlify-dns-manager` is a command-line tool designed to manage DNS records for domains hosted on Netlify. It allows users to either import DNS records from a local zone file into Netlify or export Netlify DNS records to a local zone file.

## Features

- **Import DNS Records**: Upload DNS records from a local DNS zone file to Netlify.
- **Export DNS Records**: Save DNS records from Netlify to a local zone file.

## Installation

To install `netlify-dns-manager`, you need Python 3.6 or higher. You can install this package using pip:

```bash
pip install netlify-dns-manager
```

## Usage

### Command Line Interface

`netlify-dns-manager` can be run from the command line with several options.

#### Importing DNS Records

To import DNS records from a zone file to Netlify, use the following command:

```bash
netlify-dns-manage import <token> -zp <path_to_zone_file> -d <domain_name>
```

- `<token>`: Your Netlify access token for authentication.
- `<path_to_zone_file>`: The path to your local DNS zone file.
- `<domain_name>`: The domain name for which the DNS records will be managed.

#### Exporting DNS Records

To export DNS records from Netlify to a local zone file, use the following command:

```bash
netlify-dns-manage export <token> -d <domain_name>
```

- `<token>`: Your Netlify access token for authentication.
- `<domain_name>`: The domain name for which the DNS records will be managed.

### Parameters

- `execution_type`: Specify `'import'` to upload DNS records to Netlify from a zone file, or `'export'` to save Netlify DNS records to a local zone file.
- `token`: Netlify access token for authentication.
- `zone_path`: Path to the local DNS zone file (required for import only).
- `domain_name`: Domain name details.

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

If you have any questions or encounter any issues, please open an issue on the project's [GitHub issue tracker](https://github.com/sumansaurabh/netlify-dns-manager/issues).
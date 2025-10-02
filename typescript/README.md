# Netlify DNS Manager (TypeScript SDK)

[![npm version](https://badge.fury.io/js/netlify-dns-manager.svg)](https://badge.fury.io/js/netlify-dns-manager)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The `netlify-dns-manager` is a TypeScript SDK and command-line tool designed to manage DNS records for domains hosted on Netlify. It allows users to either import DNS records from a local zone file into Netlify or export Netlify DNS records to a local zone file.

## Features

- **Import DNS Records**: Upload DNS records from a local DNS zone file to Netlify.
- **Export DNS Records**: Save DNS records from Netlify to a local zone file.
- **TypeScript Support**: Fully typed SDK with IntelliSense support.
- **Programmatic API**: Use as a library in your Node.js applications.
- **Command Line Interface**: Simple CLI for quick operations.
- **Retry Logic**: Built-in retry mechanism for robust API interactions.

## Installation

To install `netlify-dns-manager`, you need Node.js 16.0 or higher. You can install this package using npm:

```bash
npm install netlify-dns-manager
```

Or with yarn:

```bash
yarn add netlify-dns-manager
```

## Usage

### Command Line Interface

`netlify-dns-manager` can be run from the command line with several options.

#### Importing DNS Records

To import DNS records from a zone file to Netlify, use the following command:

```bash
netlify-dns-manage import <token> -zp <path_to_zone_file> -d <domain_name>
```

Or using the new subcommand syntax:

```bash
netlify-dns-manage import <token> --zone-path <path_to_zone_file> --domain-name <domain_name>
```

- `<token>`: Your Netlify access token for authentication.
- `<path_to_zone_file>`: The path to your local DNS zone file.
- `<domain_name>`: The domain name for which the DNS records will be managed.

#### Exporting DNS Records

To export DNS records from Netlify to a local zone file, use the following command:

```bash
netlify-dns-manage export <token> -d <domain_name>
```

Or using the new subcommand syntax:

```bash
netlify-dns-manage export <token> --domain-name <domain_name> --output <output_file>
```

- `<token>`: Your Netlify access token for authentication.
- `<domain_name>`: The domain name for which the DNS records will be managed.
- `<output_file>`: Optional output file path (defaults to `./netlify_dns_zone_file.txt`).

### Programmatic API

You can also use this package as a library in your Node.js applications:

```typescript
import { NetlifyDNSManager } from 'netlify-dns-manager';

// Initialize the manager with your Netlify token
const dnsManager = new NetlifyDNSManager('your-netlify-token');

// Import DNS records from a zone file
async function importRecords() {
  try {
    await dnsManager.importRecords('example.com', './path/to/zone-file.txt');
    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error.message);
  }
}

// Export DNS records to a zone file
async function exportRecords() {
  try {
    await dnsManager.exportRecords('example.com', './exported-zone-file.txt');
    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error.message);
  }
}

// Get all DNS zones
async function listZones() {
  try {
    const zones = await dnsManager.getDNSZones();
    console.log('Available zones:', zones);
  } catch (error) {
    console.error('Failed to fetch zones:', error.message);
  }
}

// Get DNS records for a specific domain
async function getRecords() {
  try {
    const records = await dnsManager.getDNSRecords('example.com');
    console.log('DNS records:', records);
  } catch (error) {
    console.error('Failed to fetch records:', error.message);
  }
}
```

### Advanced Usage

You can also use individual functions for more granular control:

```typescript
import { syncDNSRecords, convertToZoneFile, NetlifyAPI } from 'netlify-dns-manager';

// Import records using the function directly
await syncDNSRecords({
  domainName: 'example.com',
  zonePath: './zone-file.txt',
  token: 'your-netlify-token'
});

// Export records using the function directly
await convertToZoneFile({
  domainName: 'example.com',
  token: 'your-netlify-token',
  outputPath: './exported.txt'
});

// Use the Netlify API client directly
const api = new NetlifyAPI({ token: 'your-netlify-token' });
const zones = await api.getAllDNSZones();
```

## API Reference

### NetlifyDNSManager

Main class for managing DNS records.

#### Constructor

```typescript
constructor(token: string, apiUrl?: string)
```

#### Methods

- `importRecords(domainName: string, zonePath: string): Promise<void>`
- `exportRecords(domainName: string, outputPath?: string): Promise<void>`
- `getDNSZones(): Promise<NetlifyDNSZone[]>`
- `getDNSRecords(domainName: string): Promise<NetlifyDNSRecord[]>`

### Functions

- `syncDNSRecords(options: ImportOptions): Promise<void>`
- `convertToZoneFile(options: ExportOptions): Promise<void>`
- `parseZoneFile(domainName: string, zoneFilePath: string): DNSRecord[]`

## TypeScript Support

This package includes full TypeScript definitions. Import types as needed:

```typescript
import {
  NetlifyDNSManager,
  NetlifyDNSRecord,
  NetlifyDNSZone,
  DNSRecord,
  ImportOptions,
  ExportOptions
} from 'netlify-dns-manager';
```

## Error Handling

The SDK includes built-in retry logic for API calls and comprehensive error handling. All functions will throw descriptive errors that you can catch and handle appropriately:

```typescript
try {
  await dnsManager.importRecords('example.com', './zone-file.txt');
} catch (error) {
  if (error.message.includes('DNS zone not found')) {
    console.error('Domain not found in Netlify');
  } else if (error.message.includes('Zone file not found')) {
    console.error('Local zone file does not exist');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

If you have any questions or encounter any issues, please open an issue on the project's [GitHub issue tracker](https://github.com/sumansaurabh/netlify-dns-manager/issues).
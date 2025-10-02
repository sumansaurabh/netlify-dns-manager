#!/usr/bin/env node

import { Command } from 'commander';
import { syncDNSRecords, convertToZoneFile } from './driver';
import * as fs from 'fs';

const program = new Command();

program
  .name('netlify-dns-manage')
  .description('Sync DNS records from a local zone file to Netlify or export Netlify records to a zone file.')
  .version('0.4.0');

// Import command
program
  .command('import')
  .description('Upload DNS records to Netlify from a zone file')
  .argument('<token>', 'Netlify access token for authentication')
  .requiredOption('-zp, --zone-path <path>', 'Path to the local DNS zone file')
  .requiredOption('-d, --domain-name <domain>', 'Domain name details')
  .action(async (token: string, options: { zonePath: string; domainName: string }) => {
    try {
      if (!fs.existsSync(options.zonePath)) {
        console.error(`Zone file not found: ${options.zonePath}`);
        process.exit(1);
      }

      console.log(`Importing DNS records from ${options.zonePath} using token ${token.substring(0, 10)}...`);
      await syncDNSRecords({
        domainName: options.domainName,
        zonePath: options.zonePath,
        token
      });
      console.log('Import completed successfully!');
    } catch (error) {
      console.error('Import failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('Save Netlify DNS records to a local zone file')
  .argument('<token>', 'Netlify access token for authentication')
  .requiredOption('-d, --domain-name <domain>', 'Domain name details')
  .option('-o, --output <path>', 'Output file path', './netlify_dns_zone_file.txt')
  .action(async (token: string, options: { domainName: string; output: string }) => {
    try {
      console.log(`Exporting DNS records to a local zone file using token ${token.substring(0, 10)}...`);
      await convertToZoneFile({
        token,
        domainName: options.domainName,
        outputPath: options.output
      });
      console.log('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Legacy command for backwards compatibility
program
  .argument('[execution_type]', 'Specify "import" to upload DNS records to Netlify from a zone file, or "export" to save Netlify DNS records to a local zone file', '')
  .argument('[token]', 'Netlify access token for authentication', '')
  .option('-zp, --zone-path <path>', 'Path to the local DNS zone file (required for import only)')
  .option('-d, --domain-name <domain>', 'Domain name details')
  .option('-o, --output <path>', 'Output file path for export', './netlify_dns_zone_file.txt')
  .action(async (executionType: string, token: string, options: any) => {
    // Only handle if subcommands weren't used
    if (!executionType || !token) {
      return;
    }

    if (!options.domainName) {
      console.error('Domain name is required. Use -d or --domain-name option.');
      process.exit(1);
    }

    try {
      if (executionType === 'import') {
        if (!options.zonePath) {
          console.error('The --zone-path argument is required when the execution_type is "import".');
          process.exit(1);
        }

        if (!fs.existsSync(options.zonePath)) {
          console.error(`Zone file not found: ${options.zonePath}`);
          process.exit(1);
        }

        console.log(`Importing DNS records from ${options.zonePath} using token ${token.substring(0, 10)}...`);
        await syncDNSRecords({
          domainName: options.domainName,
          zonePath: options.zonePath,
          token
        });
        console.log('Import completed successfully!');
      } else if (executionType === 'export') {
        console.log(`Exporting DNS records to a local zone file using token ${token.substring(0, 10)}...`);
        await convertToZoneFile({
          token,
          domainName: options.domainName,
          outputPath: options.output
        });
        console.log('Export completed successfully!');
      } else {
        console.error('Invalid execution type. Use "import" or "export".');
        process.exit(1);
      }
    } catch (error) {
      console.error('Operation failed:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
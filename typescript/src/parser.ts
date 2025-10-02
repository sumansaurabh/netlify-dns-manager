import * as fs from 'fs';
import { DNSRecord } from './types';

/**
 * Parse a DNS zone file and return structured DNS records
 */
export function parseZoneFile(domainName: string, zoneFilePath: string): DNSRecord[] {
  const dnsRecords: DNSRecord[] = [];

  try {
    const content = fs.readFileSync(zoneFilePath, 'utf8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#')) {
        continue;
      }

      try {
        const record = parseDNSRecordLine(trimmedLine, domainName);
        if (record) {
          dnsRecords.push(record);
        }
      } catch (error) {
        console.warn(`Failed to parse line: ${trimmedLine}`, error);
      }
    }

    return dnsRecords;
  } catch (error) {
    throw new Error(`Failed to parse zone file ${zoneFilePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse a single DNS record line
 */
function parseDNSRecordLine(line: string, domainName: string): DNSRecord | null {
  // Basic zone file parsing - handles most common formats
  // Format: name [ttl] [class] type data
  const parts = line.split(/\s+/);

  if (parts.length < 3) {
    return null;
  }

  let name = parts[0];
  let ttl = 300; // default TTL
  let rclass = 'IN';
  let rtype: string;
  let rdataValue: string;
  let startIndex = 1;

  // Check if second part is TTL (numeric)
  if (/^\d+$/.test(parts[1])) {
    ttl = parseInt(parts[1], 10);
    startIndex = 2;
  }

  // Check if next part is class
  if (parts[startIndex] && /^(IN|CH|HS)$/i.test(parts[startIndex])) {
    rclass = parts[startIndex].toUpperCase();
    startIndex++;
  }

  if (parts.length <= startIndex) {
    return null;
  }

  rtype = parts[startIndex].toUpperCase();
  rdataValue = parts.slice(startIndex + 1).join(' ');

  // Normalize name relative to domain
  if (name === `${domainName}.`) {
    name = '@';
  } else if (name.endsWith(`.${domainName}.`)) {
    name = name.replace(`.${domainName}.`, '');
  }

  // Handle RDATA normalization
  if (rdataValue.includes(`.${domainName}..`)) {
    rdataValue = rdataValue.replace(`.${domainName}.`, '');
  }

  const record: DNSRecord = {
    rtype,
    name,
    rclass,
    rdata: {
      value: rdataValue
    },
    ttl
  };

  return record;
}

/**
 * Convert DNS records to zone file format
 */
export function recordsToZoneFile(records: any[], domainName: string): string {
  let zoneFileContent = '; Generated DNS Zone File\n';

  for (const record of records) {
    const hostname = record.hostname || record.name;
    const recordType = record.type || record.rtype;
    const ttl = record.ttl || 300;
    const target = record.value || record.rdata?.value;

    if (recordType === 'NETLIFY') {
      console.log(`Skipping NETLIFY record for ${hostname}, ${target}`);
      continue;
    }

    // Format the record line for the zone file
    const recordLine = `${hostname} ${ttl} IN ${recordType} ${target}\n`;
    zoneFileContent += recordLine;
  }

  return zoneFileContent;
}
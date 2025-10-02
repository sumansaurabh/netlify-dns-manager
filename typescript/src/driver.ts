import * as fs from 'fs';
import * as path from 'path';
import { parseZoneFile, recordsToZoneFile } from './parser';
import { NetlifyAPI } from './netlify-api';
import { ImportOptions, ExportOptions } from './types';

/**
 * Sync DNS records from a local zone file to Netlify
 */
export async function syncDNSRecords(options: ImportOptions): Promise<void> {
  const { domainName, zonePath, token } = options;

  // Parse local DNS zone file
  const localRecords = parseZoneFile(domainName, zonePath);
  if (!localRecords || localRecords.length === 0) {
    console.log('No records found in the zone file.');
    return;
  }

  const netlify = new NetlifyAPI({ token });

  // Fetch existing DNS records from Netlify
  const zoneId = await netlify.getDNSZone(domainName);
  if (!zoneId) {
    throw new Error(`DNS zone not found for domain: ${domainName}`);
  }

  const existingRecords = await netlify.listDNSRecords(zoneId);

  // Simple mapping of existing records for quick lookup
  const existingMap = new Map<string, any>();
  existingRecords.forEach(rec => {
    const key = `${rec.type} ${rec.hostname}`;
    existingMap.set(key, rec);
  });

  // Loop through local records and update/create on Netlify
  for (const localRecord of localRecords) {
    const name = localRecord.name;
    const recordType = localRecord.rtype;
    const recordData = localRecord.rdata;
    const ttl = localRecord.ttl;

    // Skip certain record types that shouldn't be managed
    if (['SOA', 'NS', 'MX'].includes(recordType)) {
      console.log(`Skipping ${recordType} record for ${name}, ${JSON.stringify(recordData)}`);
      continue;
    }

    // Generate the key to check if record exists in Netlify
    const recordKey = `${recordType} ${name}`;
    const existingRecord = existingMap.get(recordKey);

    if (existingRecord) {
      // Check for any changes and update if necessary
      let needsUpdate = false;
      const updateData = { ...existingRecord };

      // Assuming a generic structure for record_data which might need conversion depending on type
      if ('value' in recordData && recordData.value) {
        const recordValue = recordData.value;
        if (existingRecord.value !== recordValue) {
          updateData.value = recordValue;
          needsUpdate = true;
        }
      }

      if (existingRecord.ttl !== ttl) {
        updateData.ttl = ttl;
        needsUpdate = true;
      }

      if (needsUpdate) {
        try {
          await netlify.updateDNSRecord(zoneId, updateData);
          console.log(`Updated ${recordKey} with new data:`, updateData);
        } catch (error) {
          console.error(`Failed to update ${recordKey}:`, error instanceof Error ? error.message : String(error));
        }
      }
    } else {
      // Create new record
      const createData = {
        type: recordType,
        hostname: name,
        value: recordData.value || '',
        ttl: ttl,
        dns_zone_id: zoneId
      };

      try {
        await netlify.updateDNSRecord(zoneId, createData);
        console.log(`Created new record for ${recordKey}`);
      } catch (error) {
        console.error(`Failed to create new record for ${recordKey}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }
}

/**
 * Convert Netlify DNS records to a zone file
 */
export async function convertToZoneFile(options: ExportOptions): Promise<void> {
  const { token, domainName, outputPath = './netlify_dns_zone_file.txt' } = options;

  const netlify = new NetlifyAPI({ token });

  // Fetch existing DNS records from Netlify
  const zoneId = await netlify.getDNSZone(domainName);
  if (!zoneId) {
    throw new Error(`DNS zone not found for domain: ${domainName}`);
  }

  const netlifyRecords = await netlify.listDNSRecords(zoneId);

  if (!netlifyRecords || netlifyRecords.length === 0) {
    console.log('No records found for the specified domain.');
    return;
  }

  // Filter out NETLIFY-specific records
  const validRecords = netlifyRecords.filter(record => {
    if (record.type === 'NETLIFY') {
      console.log(`Skipping NETLIFY record for ${record.hostname}, ${record.value}`);
      return false;
    }
    return true;
  });

  if (validRecords.length === 0) {
    console.log('No valid records found for export.');
    return;
  }

  // Convert records to zone file format
  const zoneFileContent = recordsToZoneFile(validRecords, domainName);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the zone file content to a file
  fs.writeFileSync(outputPath, zoneFileContent);
  console.log(`Zone file exported successfully to: ${outputPath}`);
}

/**
 * NetlifyDNSManager - Main class for managing DNS records
 */
export class NetlifyDNSManager {
  private netlifyAPI: NetlifyAPI;

  constructor(token: string, apiUrl?: string) {
    this.netlifyAPI = new NetlifyAPI({ token, apiUrl });
  }

  /**
   * Import DNS records from a zone file to Netlify
   */
  async importRecords(domainName: string, zonePath: string): Promise<void> {
    await syncDNSRecords({ domainName, zonePath, token: (this.netlifyAPI as any).pat });
  }

  /**
   * Export DNS records from Netlify to a zone file
   */
  async exportRecords(domainName: string, outputPath?: string): Promise<void> {
    await convertToZoneFile({
      domainName,
      token: (this.netlifyAPI as any).pat,
      outputPath
    });
  }

  /**
   * Get all DNS zones
   */
  async getDNSZones() {
    return this.netlifyAPI.getAllDNSZones();
  }

  /**
   * Get DNS records for a specific domain
   */
  async getDNSRecords(domainName: string) {
    const zoneId = await this.netlifyAPI.getDNSZone(domainName);
    if (!zoneId) {
      throw new Error(`DNS zone not found for domain: ${domainName}`);
    }
    return this.netlifyAPI.listDNSRecords(zoneId);
  }
}
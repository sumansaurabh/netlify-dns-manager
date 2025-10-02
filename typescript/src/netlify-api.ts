import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { NetlifyDNSManagerConfig, NetlifyDNSRecord, NetlifyDNSZone } from './types';
import { retry, retryAsync } from './utils';

export class NetlifyAPI {
  private apiClient: AxiosInstance;
  private pat: string;

  constructor(config: NetlifyDNSManagerConfig) {
    this.pat = config.token;

    this.apiClient = axios.create({
      baseURL: config.apiUrl || 'https://api.netlify.com/api/v1',
      headers: {
        'Authorization': `Bearer ${this.pat}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * List all DNS records for the specified zone on Netlify
   */
  async listDNSRecords(zoneId: string): Promise<NetlifyDNSRecord[]> {
    return retryAsync(async () => {
      const response = await this.apiClient.get(`/dns_zones/${zoneId}/dns_records`);
      return response.data;
    }, { delaySeconds: 3 });
  }

  /**
   * Get DNS zone ID for a domain
   */
  async getDNSZone(domainName: string): Promise<string | null> {
    return retryAsync(async () => {
      const response = await this.apiClient.get('/dns_zones');

      if (response.status === 200) {
        const zones: NetlifyDNSZone[] = response.data;
        const zone = zones.find(z => z.name === domainName);
        return zone ? zone.id : null;
      }

      console.log('Failed to fetch DNS zones:', response.status);
      return null;
    }, { delaySeconds: 3 });
  }

  /**
   * Add or update a DNS record
   */
  async updateDNSRecord(zoneId: string, recordData: Partial<NetlifyDNSRecord>): Promise<boolean> {
    return retryAsync(async () => {
      const response = await this.apiClient.post(`/dns_zones/${zoneId}/dns_records`, recordData);

      if (response.status >= 200 && response.status < 300) {
        console.log('DNS record added successfully.', recordData);
        return true;
      } else {
        console.log('Failed to add DNS record.', recordData);
        return false;
      }
    }, { maxAttempts: 7 });
  }

  /**
   * Delete a DNS record
   */
  async deleteDNSRecord(zoneId: string, recordId: string): Promise<boolean> {
    return retryAsync(async () => {
      const response = await this.apiClient.delete(`/dns_zones/${zoneId}/dns_records/${recordId}`);

      if (response.status >= 200 && response.status < 300) {
        console.log(`DNS record ${recordId} deleted successfully.`);
        return true;
      } else {
        console.log(`Failed to delete DNS record ${recordId}.`);
        return false;
      }
    }, { delaySeconds: 3 });
  }

  /**
   * Get all DNS zones
   */
  async getAllDNSZones(): Promise<NetlifyDNSZone[]> {
    return retryAsync(async () => {
      const response = await this.apiClient.get('/dns_zones');
      return response.data;
    }, { delaySeconds: 3 });
  }

  /**
   * Create a new DNS zone
   */
  async createDNSZone(domainName: string): Promise<NetlifyDNSZone | null> {
    return retryAsync(async () => {
      const response = await this.apiClient.post('/dns_zones', {
        name: domainName
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`DNS zone created successfully for ${domainName}`);
        return response.data;
      } else {
        console.log(`Failed to create DNS zone for ${domainName}`);
        return null;
      }
    }, { delaySeconds: 3 });
  }
}
export interface DNSRecord {
  rtype: string;
  name: string;
  rclass: string;
  rdata: {
    value?: string;
    [key: string]: any;
  };
  ttl: number;
}

export interface NetlifyDNSRecord {
  id?: string;
  type: string;
  hostname: string;
  value: string;
  ttl: number;
  dns_zone_id?: string;
}

export interface NetlifyDNSZone {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

export interface NetlifyAPIResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

export interface RetryOptions {
  maxAttempts?: number;
  delaySeconds?: number;
  backoffFactor?: number;
  exceptions?: Array<new (...args: any[]) => Error>;
}

export interface NetlifyDNSManagerConfig {
  token: string;
  apiUrl?: string;
}

export type ExecutionType = 'import' | 'export';

export interface ImportOptions {
  domainName: string;
  zonePath: string;
  token: string;
}

export interface ExportOptions {
  domainName: string;
  token: string;
  outputPath?: string;
}
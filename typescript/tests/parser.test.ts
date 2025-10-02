import * as fs from 'fs';
import * as path from 'path';
import { parseZoneFile, recordsToZoneFile } from '../src/parser';

// Mock fs for testing
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('DNS Parser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseZoneFile', () => {
    it('should parse a simple zone file correctly', () => {
      const sampleZoneFile = `
; Sample zone file
example.com. 300 IN A 192.168.1.1
www.example.com. 300 IN A 192.168.1.2
mail.example.com. 300 IN MX 10 mail.example.com.
      `.trim();

      mockedFs.readFileSync.mockReturnValue(sampleZoneFile);

      const records = parseZoneFile('example.com', '/mock/path');

      expect(records).toHaveLength(3);
      expect(records[0]).toEqual({
        rtype: 'A',
        name: '@',
        rclass: 'IN',
        rdata: { value: '192.168.1.1' },
        ttl: 300
      });
      expect(records[1]).toEqual({
        rtype: 'A',
        name: 'www',
        rclass: 'IN',
        rdata: { value: '192.168.1.2' },
        ttl: 300
      });
    });

    it('should skip comments and empty lines', () => {
      const sampleZoneFile = `
; This is a comment
# This is also a comment

example.com. 300 IN A 192.168.1.1

; Another comment
www.example.com. 300 IN A 192.168.1.2
      `.trim();

      mockedFs.readFileSync.mockReturnValue(sampleZoneFile);

      const records = parseZoneFile('example.com', '/mock/path');

      expect(records).toHaveLength(2);
    });

    it('should handle records without explicit TTL', () => {
      const sampleZoneFile = 'example.com. IN A 192.168.1.1';

      mockedFs.readFileSync.mockReturnValue(sampleZoneFile);

      const records = parseZoneFile('example.com', '/mock/path');

      expect(records).toHaveLength(1);
      expect(records[0].ttl).toBe(300); // default TTL
    });

    it('should throw error for invalid file', () => {
      mockedFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      expect(() => parseZoneFile('example.com', '/invalid/path')).toThrow();
    });
  });

  describe('recordsToZoneFile', () => {
    it('should convert records to zone file format', () => {
      const records = [
        { hostname: '@', type: 'A', ttl: 300, value: '192.168.1.1' },
        { hostname: 'www', type: 'A', ttl: 300, value: '192.168.1.2' },
        { hostname: 'mail', type: 'MX', ttl: 300, value: '10 mail.example.com' }
      ];

      const zoneFileContent = recordsToZoneFile(records, 'example.com');

      expect(zoneFileContent).toContain('@ 300 IN A 192.168.1.1');
      expect(zoneFileContent).toContain('www 300 IN A 192.168.1.2');
      expect(zoneFileContent).toContain('mail 300 IN MX 10 mail.example.com');
      expect(zoneFileContent.startsWith('; Generated DNS Zone File')).toBe(true);
    });

    it('should skip NETLIFY records', () => {
      const records = [
        { hostname: '@', type: 'A', ttl: 300, value: '192.168.1.1' },
        { hostname: '_netlify', type: 'NETLIFY', ttl: 300, value: 'netlify-specific-value' }
      ];

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const zoneFileContent = recordsToZoneFile(records, 'example.com');

      expect(zoneFileContent).toContain('@ 300 IN A 192.168.1.1');
      expect(zoneFileContent).not.toContain('NETLIFY');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skipping NETLIFY record')
      );

      consoleSpy.mockRestore();
    });
  });
});
import axios from 'axios';
import { NetlifyAPI } from '../src/netlify-api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NetlifyAPI', () => {
  let api: NetlifyAPI;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock axios.create
    mockedAxios.create.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    } as any);

    api = new NetlifyAPI({ token: 'test-token' });
  });

  describe('getDNSZone', () => {
    it('should return zone ID for existing domain', async () => {
      const mockZones = [
        { id: 'zone-1', name: 'example.com' },
        { id: 'zone-2', name: 'test.com' }
      ];

      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({
        status: 200,
        data: mockZones
      });

      const zoneId = await api.getDNSZone('example.com');
      expect(zoneId).toBe('zone-1');
    });

    it('should return null for non-existent domain', async () => {
      const mockZones = [
        { id: 'zone-1', name: 'example.com' }
      ];

      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({
        status: 200,
        data: mockZones
      });

      const zoneId = await api.getDNSZone('nonexistent.com');
      expect(zoneId).toBeNull();
    });

    it('should handle API errors', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({
        status: 500,
        data: null
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const zoneId = await api.getDNSZone('example.com');

      expect(zoneId).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch DNS zones:', 500);

      consoleSpy.mockRestore();
    });
  });

  describe('listDNSRecords', () => {
    it('should return DNS records for a zone', async () => {
      const mockRecords = [
        { id: '1', type: 'A', hostname: '@', value: '192.168.1.1', ttl: 300 },
        { id: '2', type: 'CNAME', hostname: 'www', value: 'example.com', ttl: 300 }
      ];

      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.get = jest.fn().mockResolvedValue({
        data: mockRecords
      });

      const records = await api.listDNSRecords('zone-1');
      expect(records).toEqual(mockRecords);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/dns_zones/zone-1/dns_records');
    });
  });

  describe('updateDNSRecord', () => {
    it('should successfully create a DNS record', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.post = jest.fn().mockResolvedValue({
        status: 201
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const recordData = {
        type: 'A',
        hostname: 'test',
        value: '192.168.1.1',
        ttl: 300
      };

      const result = await api.updateDNSRecord('zone-1', recordData);

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('DNS record added successfully.', recordData);

      consoleSpy.mockRestore();
    });

    it('should handle failed DNS record creation', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.post = jest.fn().mockResolvedValue({
        status: 400
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const recordData = {
        type: 'A',
        hostname: 'test',
        value: '192.168.1.1',
        ttl: 300
      };

      const result = await api.updateDNSRecord('zone-1', recordData);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to add DNS record.', recordData);

      consoleSpy.mockRestore();
    });
  });

  describe('deleteDNSRecord', () => {
    it('should successfully delete a DNS record', async () => {
      const mockAxiosInstance = mockedAxios.create();
      mockAxiosInstance.delete = jest.fn().mockResolvedValue({
        status: 204
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await api.deleteDNSRecord('zone-1', 'record-1');

      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('DNS record record-1 deleted successfully.');

      consoleSpy.mockRestore();
    });
  });
});
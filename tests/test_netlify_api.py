import unittest
from unittest.mock import patch, MagicMock
from netlify_dns_manage.netlify_api import NetlifyAPI
from unittest.mock import patch, Mock


class TestNetlifyAPI(unittest.TestCase):
    def setUp(self):
        self.api = NetlifyAPI("test_token")
        self.domain_name = "example.com"
        self.zone_id = "zone123"

    def test_list_dns_records_success(self):
        expected_response = [{"type": "A", "hostname": "www.example.com", "value": "192.0.2.1"}]
        with patch('requests.get') as mocked_get:
            mocked_get.return_value = MagicMock(status_code=200, json=lambda: expected_response)
            response = self.api.list_dns_records(self.zone_id)
            self.assertEqual(response, expected_response)
            mocked_get.assert_called_once_with("https://api.netlify.com/api/v1/dns_zones/zone123/dns_records", headers=self.api.headers)

    def test_get_dns_zone_success(self):
        expected_response = [{"id": self.zone_id, "name": self.domain_name}]
        with patch('requests.get') as mocked_get:
            mocked_get.return_value = MagicMock(status_code=200, json=lambda: expected_response)
            result = self.api.get_dns_zone(self.domain_name)
            self.assertEqual(result, self.zone_id)
            mocked_get.assert_called_once_with("https://api.netlify.com/api/v1/dns_zones", headers=self.api.headers)

    def test_get_dns_zone_failure(self):
        with patch('requests.get') as mocked_get:
            mocked_get.return_value = MagicMock(status_code=404)
            result = self.api.get_dns_zone(self.domain_name)
            self.assertIsNone(result)
            self.assertTrue("Failed to fetch DNS zones" in self.api.logger.last_log)


    @patch('requests.get')
    def test_get_dns_zone_success(self, mock_get):
        # Mocking the response of requests.get
        mock_response = Mock(status_code=200)
        mock_response.json.return_value = [{"name": "example.com", "id": "12345"}]
        mock_get.return_value = mock_response

        # Testing get_dns_zone
        zone_id = self.api.get_dns_zone("example.com")
        self.assertEqual(zone_id, "12345")
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_get_dns_zone_failure(self, mock_get):
        # Mocking the response of requests.get for failure case
        mock_response = Mock(status_code=404)
        mock_get.return_value = mock_response

        # Testing get_dns_zone with a failure
        zone_id = self.api.get_dns_zone("nonexistent.com")
        self.assertIsNone(zone_id)
        mock_get.assert_called_once()

    @patch('requests.get')
    def test_list_dns_records(self, mock_get):
        # Mocking the response of requests.get
        mock_response = Mock(status_code=200)
        mock_response.json.return_value = [{"type": "A", "hostname": "www.example.com", "value": "192.0.2.1"}]
        mock_get.return_value = mock_response

        # Testing list_dns_records
        records = self.api.list_dns_records("zone123")
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['type'], 'A')
        mock_get.assert_called_once()

    @patch('requests.post')
    def test_update_dns_record(self, mock_post):
        # Mocking the response of requests.post
        mock_response = Mock(status_code=201)
        mock_post.return_value = mock_response

        # Data to update/create a record
        record_data = {"type": "A", "hostname": "www.example.com", "value": "192.0.2.1", "ttl": 86400}

        # Testing update_dns_record
        success = self.api.update_dns_record("zone123", record_data)
        self.assertTrue(success)
        mock_post.assert_called_once()

if __name__ == '__main__':
    unittest.main()
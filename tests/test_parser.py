import unittest
from netlify_dns_manage.parser import parse_zone_file
from unittest.mock import patch, mock_open


class TestZoneFileParser(unittest.TestCase):
    def setUp(self):
        # Sample zone file content
        self.domain_name = "example.com"
        self.zone_file_content = """
$TTL    86400
@       IN      SOA     ns1.example.com. hostmaster.example.com. (
                              2002022401 ; serial
                              3H ; refresh
                              15M ; retry
                              1W ; expire
                              1D ) ; minimum
@       IN      NS      ns1.example.com.
@       IN      NS      ns2.example.com.
@       IN      A       192.0.2.1
www     IN      A       192.0.2.2
mail    IN      MX      10 mail.example.com.
sub     IN      CNAME   www.example.com.
"""
        # Expected output structure after parsing
        self.expected_records = [
            {"rtype": "SOA", "name": "@", "rclass": "IN", "rdata": {
                "value": "ns1.example.com. hostmaster.example.com. (2002022401 10800 900 604800 86400)"
            }, "ttl": 86400},
            {"rtype": "NS", "name": "@", "rclass": "IN", "rdata": {"value": "ns1.example.com."}, "ttl": 86400},
            {"rtype": "NS", "name": "@", "rclass": "IN", "rdata": {"value": "ns2.example.com."}, "ttl": 86400},
            {"rtype": "A", "name": "@", "rclass": "IN", "rdata": {"value": "192.0.2.1"}, "ttl": 86400},
            {"rtype": "A", "name": "www", "rclass": "IN", "rdata": {"value": "192.0.2.2"}, "ttl": 86400},
            {"rtype": "MX", "name": "mail", "rclass": "IN", "rdata": {"value": "10 mail.example.com."}, "ttl": 86400},
            {"rtype": "CNAME", "name": "sub", "rclass": "IN", "rdata": {"value": "www.example.com."}, "ttl": 86400}
        ]

        self.empty_zone_file_content = ""
        self.invalid_zone_file_content = """
        $TTL    86400
        @       IN      A       not_an_ip
        sub.example.com. IN A 192.0.2.3 garbage
        """
        self.multiple_subdomains_content = """
        @       IN      A       192.0.2.1
        www     IN      A       192.0.2.2
        dev.www IN      A       192.0.2.3
        """
        
        self.case_insensitivity_content = """
        EXAMPLE.COM. IN A 192.0.2.1
        WWW.example.COM. IN A 192.0.2.2
        """

    def test_parse_zone_file(self):
        # Mock file reading
        with unittest.mock.patch('builtins.open', unittest.mock.mock_open(read_data=self.zone_file_content)):
            records = parse_zone_file(self.domain_name, "path_does_not_matter_since_mocked")
            self.assertEqual(records, self.expected_records)

    def test_empty_zone_file(self):
        with patch('builtins.open', mock_open(read_data=self.empty_zone_file_content)):
            records = parse_zone_file(self.domain_name, "dummy_path")
            self.assertEqual(records, [])

    def test_invalid_format_records(self):
        with patch('builtins.open', mock_open(read_data=self.invalid_zone_file_content)):
            records = parse_zone_file(self.domain_name, "dummy_path")
            # Assuming function should ignore malformed entries
            self.assertEqual(len(records), 0)  # Adjust depending on actual implementation

    def test_multiple_subdomains(self):
        with patch('builtins.open', mock_open(read_data=self.multiple_subdomains_content)):
            records = parse_zone_file(self.domain_name, "dummy_path")
            expected_records = [
                {"rtype": "A", "name": "@", "rclass": "IN", "rdata": {"value": "192.0.2.1"}, "ttl": 86400},
                {"rtype": "A", "name": "www", "rclass": "IN", "rdata": {"value": "192.0.2.2"}, "ttl": 86400},
                {"rtype": "A", "name": "dev.www", "rclass": "IN", "rdata": {"value": "192.0.2.3"}, "ttl": 86400}
            ]
            self.assertEqual(records, expected_records)

    def test_case_insensitivity(self):
        with patch('builtins.open', mock_open(read_data=self.case_insensitivity_content)):
            records = parse_zone_file(self.domain_name, "dummy_path")
            expected_records = [
                {"rtype": "A", "name": "@", "rclass": "IN", "rdata": {"value": "192.0.2.1"}, "ttl": 86400},
                {"rtype": "A", "name": "www", "rclass": "IN", "rdata": {"value": "192.0.2.2"}, "ttl": 86400}
            ]
            self.assertEqual(records, expected_records)
    
    def test_uncommon_record_types(self):
        uncommon_content = """
    @       IN      TXT     "v=spf1 include:_spf.example.com ~all"
    _sip._tcp   IN  SRV 10 60 5060 sipserver.example.com.
    """
        expected_uncommon_records = [
            {"rtype": "TXT", "name": "@", "rclass": "IN", "rdata": {"value": '"v=spf1 include:_spf.example.com ~all"'}, "ttl": None},
            {"rtype": "SRV", "name": "_sip._tcp", "rclass": "IN", "rdata": {"value": "10 60 5060 sipserver.example.com."}, "ttl": None}
        ]
        with unittest.mock.patch('builtins.open', unittest.mock.mock_open(read_data=uncommon_content)):
            records = parse_zone_file(self.domain_name, "uncommon_zone_file")
            self.assertEqual(records, expected_uncommon_records)

    def test_syntax_error_in_zone_file(self):
        bad_syntax_content = """
    @       IN      A       192.0.2.1
    www     IN      A       not_an_ip_address
    """
        expected_syntax_error_records = [
            {"rtype": "A", "name": "@", "rclass": "IN", "rdata": {"value": "192.0.2.1"}, "ttl": None}
        ]
        with unittest.mock.patch('builtins.open', unittest.mock.mock_open(read_data=bad_syntax_content)):
            records = parse_zone_file(self.domain_name, "syntax_error_zone_file")
            self.assertEqual(records, expected_syntax_error_records)
    
    def test_multiple_records_for_subdomain(self):
        multiple_entries_content = """
    www     IN      A       192.0.2.2
    www     IN      A       192.0.2.3
    www     IN      MX      10 mail.example.com.
    """
        expected_multiple_entries_records = [
            {"rtype": "A", "name": "www", "rclass": "IN", "rdata": {"value": "192.0.2.2"}, "ttl": None},
            {"rtype": "A", "name": "www", "rclass": "IN", "rdata": {"value": "192.0.2.3"}, "ttl": None},
            {"rtype": "MX", "name": "www", "rclass": "IN", "rdata": {"value": "10 mail.example.com."}, "ttl": None}
        ]
        with unittest.mock.patch('builtins.open', unittest.mock.mock_open(read_data=multiple_entries_content)):
            records = parse_zone_file(self.domain_name, "multiple_entries_zone_file")
            self.assertEqual(records, expected_multiple_entries_records)




if __name__ == '__main__':
    unittest.main()

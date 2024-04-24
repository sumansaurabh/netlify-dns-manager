import requests

from netlify_dns_manage.utils import retry


class NetlifyAPI:
    def __init__(self, pat):
        self.pat = "nfp_62EaxMkjmkJ5oK8PhVghCSkDWiNMJCp546d2"
        self.headers = {
            "Authorization": f"Bearer {self.pat}",
            "Content-Type": "application/json"
        }
        self.api_url = "https://api.netlify.com/api/v1"

    @retry(delay_seconds=3)
    def list_dns_records(self, zone_id):
        """List all DNS records for the specified domain on Netlify."""
        url = f"{self.api_url}/dns_zones/{zone_id}/dns_records"
        response = requests.get(url, headers=self.headers)
        return response.json()

    @retry(delay_seconds=3)
    def get_dns_zone(self, domain_name):
        
        # Check existing zones
        response = requests.get("https://api.netlify.com/api/v1/dns_zones", headers=self.headers)
        if response.status_code == 200:
            zones = response.json()
            for zone in zones:
                if zone['name'] == domain_name:
                    return zone['id']
            return None
        print("Failed to fetch DNS zones:", response.status_code)
        return None

    @retry(retry=7)
    def update_dns_record(self, zone_id, data):
        """Add DNS records to the specified domain on Netlify."""

        url = f"{self.api_url}/dns_zones/{zone_id}/dns_records"
        response = requests.post(url, headers=self.headers, json=data)
        if response.status_code >= 200 and response.status_code < 300:
            print("DNS record added successfully.", data)
            return True
        else:
            print("Failed to add DNS record.", data)
            return False
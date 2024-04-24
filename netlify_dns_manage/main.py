from .parser import parse_zone_file
from .netlify_api import NetlifyAPI
import argparse

def sync_dns_records(domain_name, zone_file_path, access_token):
    # Parse local DNS zone file
    local_records = parse_zone_file(zone_file_path)
    print(local_records)

    netlify = NetlifyAPI(access_token)
    # Fetch existing DNS records from Netlify
    zone_id = netlify.get_dns_zone(domain_name)
    existing_records = netlify.list_dns_records(zone_id)

    # Simple mapping of existing records for quick lookup
    existing_map = {f"{rec['type']} {rec['hostname']}": rec for rec in existing_records}

    # Loop through local records and update/create on Netlify
    for name, data in local_records:
        record_type, record_data = data.split(maxsplit=1)
        record_key = f"{record_type} {name}"

        if record_key in existing_map:
            # If record exists, update it
            record_id = existing_map[record_key]['id']
            update_data = {
                "type": record_type,
                "hostname": name,
                "value": record_data
            }
            netlify.update_dns_record(record_id, update_data)
        else:
            # If record does not exist, create a new record
            # Implementation of record creation would be similar to update_netlify_dns_record function
            print(f"Record {name} does not exist on Netlify, needs creation.")

def main():
    # Create a parser with a description of the script's purpose
    parser = argparse.ArgumentParser(description="Sync DNS records from a local zone file to Netlify or export Netlify records to a zone file.")

    # Add an argument for specifying the execution type, either 'import' or 'export'
    parser.add_argument("execution_type", help="Specify 'import' to upload DNS records to Netlify from a zone file, or 'export' to save Netlify DNS records to a local zone file", choices=["import", "export"])

    # Add an argument for the Netlify access token, required for authentication
    parser.add_argument("token", help="Netlify access token for authentication", required=True)

    # Add a conditional argument for the zone file path which is only required for the 'import' operation
    parser.add_argument("-zp", dest="zone_path", help="Path to the local DNS zone file (required for import only)", required=False)

    parser.add_argument("-d", dest="domain_name", help="Domain name details", required=True)

    args = parser.parse_args()

    # Example of how you might use these arguments in your script
    if args.execution_type == 'import':
        if not args.zone_path:
            parser.error("The --zone_path argument is required when the execution_type is 'import'.")
        else:
            print(f"Importing DNS records from {args.zone_path} using token {args.token}")
            sync_dns_records(args.domain_name, args.zone_path, args.token)
    elif args.execution_type == 'export':
        print(f"Exporting DNS records to a local zone file using token {args.token}")

    

if __name__ == "__main__":
    main()

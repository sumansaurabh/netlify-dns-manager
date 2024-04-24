from .parser import parse_zone_file
from .netlify_api import NetlifyAPI
import argparse
from .driver import sync_dns_records, convert_to_zone_file
            
def main():
    # Create a parser with a description of the script's purpose
    parser = argparse.ArgumentParser(description="Sync DNS records from a local zone file to Netlify or export Netlify records to a zone file.")

    # Add an argument for specifying the execution type, either 'import' or 'export'
    parser.add_argument("execution_type", help="Specify 'import' to upload DNS records to Netlify from a zone file, or 'export' to save Netlify DNS records to a local zone file", choices=["import", "export"])

    # Add an argument for the Netlify access token, required for authentication
    parser.add_argument("token", help="Netlify access token for authentication")

    # Add a conditional argument for the zone file path which is only required for the 'import' operation
    parser.add_argument("-zp", "--zone_path", help="Path to the local DNS zone file (required for import only)", required=False)

    parser.add_argument("-d", "--domain_name", help="Domain name details", required=True)

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
        convert_to_zone_file(args.token, args.domain_name)

    

if __name__ == "__main__":
    main()

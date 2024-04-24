from .parser import parse_zone_file
from .netlify_api import NetlifyAPI

def sync_dns_records(domain_name, zone_file_path, access_token):
    # Parse local DNS zone file
    local_records = parse_zone_file(zone_file_path)
    if not local_records:
        print("No records found in the zone file.")
    netlify = NetlifyAPI(access_token)
    # Fetch existing DNS records from Netlify
    zone_id = netlify.get_dns_zone(domain_name)
    existing_records = netlify.list_dns_records(zone_id)

    # Simple mapping of existing records for quick lookup
    existing_map = {f"{rec['type']} {rec['hostname']}": rec for rec in existing_records}

    # Loop through local records and update/create on Netlify
    for local_record in local_records:
        name = local_record['name']
        record_type = local_record['rtype']
        record_data = local_record['rdata']
        ttl = local_record['ttl']

        if record_type == 'SOA':
            print(f"Skipping SOA record for {name}, {record_data}")
            continue

        if record_type == 'NS':
            print(f"Skipping NS record for {name}, {record_data}")
            continue

        if record_type == 'MX':
            print(f"Skipping MX record for {name}, {record_data}")
            continue

        # Generate the key to check if record exists in Netlify
        record_key = f"{record_type} {name}"

        if record_key in existing_map:
            # Check for any changes and update if necessary
            netlify_record = existing_map[record_key]
            needs_update = False
            update_data = netlify_record.copy()
            
            # Assuming a generic structure for record_data which might need conversion depending on type
            if 'value' in record_data:
                record_value = record_data['value']
                if netlify_record.get('value') != record_value:
                    update_data['value'] = record_value
                    needs_update = True
            
            if netlify_record.get('ttl') != ttl:
                update_data['ttl'] = ttl
                needs_update = True

            if needs_update:
                try:
                    netlify.update_dns_record(zone_id, update_data)
                    print(f"Updated {record_key} with new data: {update_data}")
                except:
                    print(f"Failed to update {record_key}")
        else:
            # Create new record
            create_data = {
                "type": record_type,
                "hostname": name,
                "value": record_data['value'],  # Simplified, adjust according to actual data structure
                "ttl": ttl,
                "dns_zone_id": zone_id
            }
            try:
                netlify.update_dns_record(zone_id, create_data)
                print(f"Created new record for {record_key}")
            except:
                print(f"Failed to create new record for {record_key}")

def convert_to_zone_file(access_token, domain_name):
    # Start of the zone file
    zone_file_content = "; Generated DNS Zone File\n"
    netlify = NetlifyAPI(access_token)
    # Fetch existing DNS records from Netlify
    zone_id = netlify.get_dns_zone(domain_name)
    netlify_records = netlify.list_dns_records(zone_id)
    
    record_created = False
    
    for record in netlify_records:
        hostname = record['hostname']
        record_type = record['type']
        ttl = record['ttl']
        target = record['value']
        if record_type == 'NETLIFY':
            print(f"Skipping NETLIFY record for {hostname}, {target}")
            continue
        
        # Format the record line for the zone file
        record_line = f"{hostname} {ttl} IN {record_type} {target}\n"
        zone_file_content += record_line
        record_created = True


    # Writing the zone file content to a file
    if record_created:
        with open('./netlify_dns_zone_file.txt', 'w') as file:
            file.write(zone_file_content)

    else:
        print("No records found for the specified domain.")
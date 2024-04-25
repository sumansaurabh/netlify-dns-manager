import zonefile_parser
from zonefile_parser.record import Record

def parse_zone_file(domain_name, zone_file_path):
    dns_records = []   
    with open(zone_file_path,"r") as stream:
        content = stream.read()
        records: list[Record] = zonefile_parser.parse(content)
        for record in records:
            if record.name == f"{domain_name}.":
                record.name = "@"
            elif f".{domain_name}." in record.name:
                record.name = record.name.replace(f".{domain_name}.","")
            
            if 'value' in record.rdata:
                if (f".{domain_name}..") in record.rdata['value']:
                    record.rdata['value'] = record.rdata['value'].replace(f".{domain_name}.","")
            modified_record = {
                "rtype": record.rtype,
                "name": record.name,
                "rclass": record.rclass,
                "rdata": record.rdata,
                "ttl": record.ttl
            }
            dns_records.append(modified_record)
    return dns_records
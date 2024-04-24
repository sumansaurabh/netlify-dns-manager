import zonefile_parser
from zonefile_parser.record import Record

def parse_zone_file(zone_file_path):
    dns_records = []
    with open(zone_file_path,"r") as stream:
        content = stream.read()
        records: list[Record] = zonefile_parser.parse(content)
        for record in records:
            modified_record = {
                "rtype": record.rtype,
                "name": record.name,
                "rclass": record.rclass,
                "rdata": record.rdata,
                "ttl": record.ttl
            }
            dns_records.append(modified_record)
    return dns_records
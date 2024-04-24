import zonefile_parser


def parse_zone_file(zone_file_path):
    dns_records = []
    with open(zone_file_path,"r") as stream:
        content = stream.read()
        records = zonefile_parser.parse(content)
        for record in records:
            dns_records.append(record)
    return dns_records
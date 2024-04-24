import dns.zone

def parse_zone_file(zone_file_path):
    zone = dns.zone.from_file(zone_file_path, relativize=False)
    records = []
    for name, node in zone.nodes.items():
        for record in node.rdatasets:
            records.append((name.to_text(), record.to_text()))
    return records

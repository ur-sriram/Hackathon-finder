import json
payload = json.load(open('/tmp/unstop_api.json'))
item = payload['data']['data'][0]
keys = sorted(item.keys())
print('TOP_LEVEL_KEYS')
for key in keys:
    value = item[key]
    if isinstance(value, (dict, list)):
        summary = f'{type(value).__name__} len={len(value)}'
    else:
        summary = repr(value)[:220]
    print(f'{key}: {summary}')
print('\nNESTED_OBJECT_KEYS')
for key, value in item.items():
    if isinstance(value, dict):
        print(key, sorted(value.keys()))
print('\nCONFIG')
print(json.dumps(item.get('opportunity_config'), indent=2)[:5000])
print('\nFILTERS')
print(json.dumps(item.get('filters'), indent=2)[:5000])
print('\nREQUIREMENTS')
print(json.dumps(item.get('regnRequirements'), indent=2)[:5000])

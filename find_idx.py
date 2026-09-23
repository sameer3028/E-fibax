with open('client/src/components/admin/WebsiteContentManager.jsx', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if 'Visual Banner Images' in l: print('START:', i)
    if 'Badge' in l and 'Heading' in l: print('END:', i)

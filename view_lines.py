with open('client/src/components/admin/WebsiteContentManager.jsx', encoding='utf-8') as f:
    lines = f.readlines()
for i, l in enumerate(lines[599:640]):
    print(f'{i+600}: {l}', end='')

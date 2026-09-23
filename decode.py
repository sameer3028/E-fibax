import base64
with open('run_patch1.py','w',encoding='utf-8') as f:
    f.write(base64.b64decode(open('patch.b64', encoding='utf-8-sig').read().strip()).decode('utf-8'))

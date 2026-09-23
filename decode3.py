import base64
raw = open('patch3.b64', encoding='utf-8-sig').read().replace('\r','').replace('\n','').replace(' ','')
pad = len(raw) % 4
if pad: raw += '=' * (4 - pad)
with open('run_patch3.py','w',encoding='utf-8') as f:
    f.write(base64.b64decode(raw).decode('utf-8'))

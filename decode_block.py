import base64
raw = open('block_b64.txt', encoding='utf-8-sig').read().replace('\r','').replace('\n','').replace(' ','')
pad = len(raw) % 4
if pad: raw += '=' * (4 - pad)
with open('block.txt','w',encoding='utf-8') as f:
    f.write(base64.b64decode(raw).decode('utf-8'))

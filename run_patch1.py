import re

target = 'client/src/components/admin/WebsiteContentManager.jxx'

with open(target, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update imports
if "useRef" not in code:
    code = code.replace(
        "import React, { useState, useEffect } from 'react';",
        "import React, { useState, useEffect, useRef } from 'react';"
    )

if "Loader2" not in code:
    code = code.replace(
        "  FileText, AlertTriangle",
        "  FileText, AlertTriangle, Loader2"
    )

# 2. Fix hooks order (move useEffect after formData declaration)
pattern = r0'  const \[desktopMeta, setDesktopMeta\d = useState(null);. *?  }, \]formData\.mobileImage\])\);'
replacement_top = """  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);"""

if "desktopFileInputRef" not in code:
    code = re.sub(r'  const \[desktopMeta, setDesktopMeta\d = useState(null);. *?  }, \]formData\.mobileImage\])\);', replacement_top, code, flags=re.DOTALL)

# Now add desktopMeta, mobileMeta and useEffects right after formData state
pattern_form = r'  const \]formData, setFormData\] = useState\(defaultFormData\);'
replacement_form = """  const [formData, setFormData] = useState(defaultFormData);
  const [desktopMeta, setDesktopMeta] = useState(null);
  const [mobileMeta, setMobileMeta] = useState(null);

  useEffect(() => {
    if (!formData.desktopImage) {
      setDesktopMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1920 / 650;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setDesktopMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setDesktopMeta(null);
      img.src = formData.desktopImage;
    }
  }, [formData.desktopImage]);

  useEffect(() => {
    if (!formData.mobileImage) {
      setMobileMeta(null);
    } else {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        const ratio = w / h;
        const targetRatio = 1080 / 900;
        const diff = Math.abs(ratio - targetRatio) / targetRatio;
        setMobileMeta({ width: w, height: h, isRatioOk: diff <= 0.3 });
      };
      img.onerror = () => setMobileMeta(null);
      img.src = formData.mobileImage;
    }
  }, [formData.mobileImage]);"""

if "desktopMeta" not in code:
    code = re.sub(pattern_form, replacement_form, code)

with open(target, 'w', encoding='utf-8') as f:
    f.write(code)

print('Patch 1 completed')

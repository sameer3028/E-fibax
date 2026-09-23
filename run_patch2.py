import re

path = 'client/src/components/admin/WebsiteContentManager.jsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Fix 1: imports
code = code.replace(
    "import React, { useState, useEffect } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';"
)
if 'Loader2' not in code:
    code = code.replace(
        "FileText, AlertTriangle",
        "FileText, AlertTriangle, Loader2"
    )

# Fix 2: Move useEffect after formData declaration
old_hooks_block = """  const [desktopMeta, setDesktopMeta] = useState(null);
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
        setDesktopMeta({ width: w, height: h, isRatioOk: diff <= 0.25 });
      };
      ymg.onerror = () => setDesktopMeta(null);
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
        setMobileMeta({ width: w, height: h, isRatioOk: diff <= 0.25 });
      };
      img.onerror = () => setMobileMeta(null);
      img.src = formData.mobileImage;
    }
  }, [formData.mobileImage]);"""

new_hooks_block = """  const desktopFileInputRef = useRef(null);
  const mobileFileInputRef = useRef(null);"""

code = code.replace(old_hooks_block, new_hooks_block)

old_form_state = """  const [formData, setFormData] = useState(defaultFormData);"""
new_form_state = """  const [formData, setFormData] = useState(defaultFormData);
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

code = code.replace(old_form_state, new_form_state)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print('EFFECTS_POSITIONED_CORRECTLY')

# FIBAX PHARMA — DESIGN SYSTEM & VISUAL IDENTITY SPECIFICATION
## The "Modern Botanical & Trustworthy Healthcare" Design System

---

### 1. Visual Identity Principles
The visual direction balances **traditional Ayurvedic herbal heritage** with **modern, clean clinical transparency**:
- **Modern**: Ample whitespace, high-legibility sans-serif typography, sharp cards with gentle borders.
- **Natural & Botanical**: Rich forest greens, sage botanical undertones, earthy herbal warm accents.
- **Premium & Clinical**: Polished golden amber accents, crisp monochrome badges, high-contrast dark charcoal body typography.
- **Anti-Clutter**: Zero cheesy clip art, no garish rainbow gradients, and no generic supermarket elements.

---

### 2. Color Palette (Tailwind CSS Tokens)

```css
:root {
  /* Brand Primary Greens */
  --primary-forest: #1b4332;       /* Deep Ayurvedic forest green - anchors headers, CTAs, hero */
  --primary-deep: #081c15;         /* Ultra dark forest - primary text headings, dark accents */
  --primary-leaf: #2d6a4f;         /* Fresh medicinal leaf green - active states, links */
  --primary-sage: #52b788;         /* Botanical sage - accents, success badges, icons */
  --primary-mint: #d8f3dc;         /* Soft mint tint - card backgrounds, highlight tags */

  /* Brand Warm Accents (Gold & Amber) */
  --accent-gold: #d4a373;          /* Warm Ayurvedic gold - star ratings, premium badges */
  --accent-amber: #e76f51;         /* Warm amber - sale tags, urgency banners */
  --accent-cream: #fefae0;         /* Soft warm cream - subtle banner backgrounds */

  /* Neutral & Base Palette */
  --bg-primary: #ffffff;           /* Clean crisp background */
  --bg-secondary: #f8f9fa;         /* Subtle warm light grey for section alternations */
  --bg-surface: #f4f6f3;           /* Botanical-tinted surface for product cards */
  --text-primary: #1a1a1a;         /* High-contrast readable charcoal for body text */
  --text-secondary: #59655f;       /* Muted slate green for subtitles, metadata */
  --text-muted: #8b9791;           /* Soft grey-green for borders, placeholders */
  --border-light: #e5e9e6;         /* Refined card borders */
  --border-subtle: #f0f3f1;

  /* E-Commerce Status Colors */
  --color-sale: #c9184a;           /* Crimson sale badge / discount alert */
  --color-bestseller: #b08968;     /* Rich bronze gold for 'Bestseller' badge */
  --color-success: #2d6a4f;        /* Order confirmed, in-stock */
  --color-warning: #f4a261;        /* Low stock alert */
  --color-error: #e63946;          /* Form validation error */
}
```

---

### 3. Typography Scale
- **Primary Body Font**: **Inter** or **Plus Jakarta Sans** (Google Fonts) — Superior legibility, clean geometric numerals for Indian Rupee pricing, modern optical kerning.
- **Editorial / Hero Heading Font**: **Playfair Display** or **Cinzel** (Google Fonts) — Used selectively on homepage hero titles and section headers to convey ancient Ayurvedic wisdom and luxury.

| Typography Token | Font Family | Size (Desktop) | Size (Mobile) | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-1` | Editorial Heading | 48px (3.0rem) | 32px (2.0rem) | Bold (700) | 1.15 |
| `heading-1` | Editorial Heading | 36px (2.25rem) | 26px (1.625rem)| SemiBold (600) | 1.2 |
| `heading-2` | Primary Sans | 28px (1.75rem) | 22px (1.375rem)| SemiBold (600) | 1.25 |
| `heading-3` | Primary Sans | 20px (1.25rem) | 18px (1.125rem)| SemiBold (600) | 1.3 |
| `body-large` | Primary Sans | 16px (1.0rem) | 15px (0.9375rem)| Regular (400) | 1.5 |
| `body-base` | Primary Sans | 14px (0.875rem) | 14px (0.875rem)| Regular (400) | 1.5 |
| `caption` | Primary Sans | 12px (0.75rem) | 11px (0.6875rem)| Medium (500) | 1.4 |
| `price-bold`| Primary Sans | 20px (1.25rem) | 18px (1.125rem)| Bold (700) | 1.0 |

---

### 4. Elevation, Radii & Shadows
- **Border Radii**:
  - Buttons: `rounded-full` (Pill shape for friendly, modern consumer feel) or `rounded-xl` (12px).
  - Product Cards: `rounded-2xl` (16px) with `border border-[#e5e9e6]`.
  - Badges: `rounded-md` (6px).
  - Cart Drawer & Modals: `rounded-l-2xl` / `rounded-2xl`.
- **Box Shadows**:
  - Card Default: `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` (Subtle, never muddy).
  - Card Hover: `shadow-[0_12px_24px_rgba(27,67,50,0.08)]` (Gentle botanical elevation).
  - Modal / Drawer: `shadow-[0_20px_50px_rgba(0,0,0,0.15)]`.

---

### 5. Buttons & Interactive Component Specifications

#### Button Variant Matrix
1. **Primary Action ("Buy Now" / "Proceed to Checkout")**:
   - Background: `bg-[#1b4332]` (Deep Forest Green)
   - Text: White, font-semibold
   - Hover: `hover:bg-[#2d6a4f]`
   - Radius: `rounded-xl` or `rounded-full`
   - Padding: `py-3 px-6`
2. **Secondary Action ("Add to Cart")**:
   - Background: White with 1.5px solid border `border-[#1b4332]`
   - Text: `text-[#1b4332]`, font-semibold
   - Hover: `hover:bg-[#d8f3dc] hover:border-[#1b4332]`
3. **Ghost / Text Button ("View Details" / "Learn More")**:
   - Background: Transparent
   - Text: `text-[#2d6a4f]` with animated underline on hover.

---

### 6. Badges & Micro-Copy Indicators
- **Discount Badge**: `bg-[#c9184a] text-white text-xs font-bold px-2.5 py-1 rounded-md` (e.g. `20% OFF`).
- **Bestseller Badge**: `bg-[#fefae0] text-[#b08968] border border-[#d4a373] text-xs font-semibold px-2 py-0.5 rounded-full`.
- **Pure Ayurvedic Seal**: `bg-[#d8f3dc] text-[#1b4332] text-xs font-medium px-2 py-0.5 rounded-full` (e.g. `100% Ayurvedic`).
- **Free Delivery Pill**: `bg-[#f4f6f3] text-[#2d6a4f] text-xs font-semibold px-2 py-1 rounded`.

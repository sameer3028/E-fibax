# FIBAX PHARMA — INFORMATION ARCHITECTURE & SITEMAP
## Structural Blueprint & Taxonomy Engine

---

### 1. Architectural Philosophy
The new Fibax Pharma information architecture is organized around **dual discovery gateways**:
1. **Primary Gateway**: **Shop by Health Concern** (Caters to 75%+ of organic and paid traffic looking for symptom resolution).
2. **Secondary Gateway**: **Shop by Product Category / Dosage Form** (Caters to repeat buyers or specific formulation preferences: Syrups, Capsules, Juices, Powders, Soaps).
3. **High-Value Gateway**: **Combos & Kits** (AOV driver offering curated multi-product bundles and courses).

---

### 2. Complete Navigation Taxonomy

```
Home (/)
├── Shop (/shop)
│   ├── All Products (/shop)
│   ├── Bestsellers (/shop/best-sellers)
│   ├── New Arrivals (/shop/new-arrivals)
│   ├── Combos & Value Kits (/shop/combos)
│   └── Formulation Categories
│       ├── Syrups (/category/syrups)
│       ├── Capsules & Tablets (/category/capsules)
│       ├── Herbal Juices (/category/juices)
│       ├── Powders & Churna (/category/powders)
│       ├── Pain Relief Oils (/category/oils)
│       └── Natural Soaps & Skincare (/category/skincare)
├── Shop by Concern (/concerns)
│   ├── Joint & Pain Relief (/concern/joint-pain-relief)
│   ├── Digestive & Gut Health (/concern/digestive-gut-health)
│   ├── Liver Care & Detox (/concern/liver-care-detox)
│   ├── Kidney & Urinary Health (/concern/kidney-urinary-care)
│   ├── Diabetes & Sugar Balance (/concern/diabetes-blood-sugar)
│   ├── Immunity & Vitality (/concern/immunity-vitality)
│   ├── Men's Wellness & Stamina (/concern/mens-wellness-stamina)
│   ├── Women's Health & Hormones (/concern/womens-wellness)
│   ├── Cardiac & Blood Pressure (/concern/cardiac-blood-pressure)
│   └── Skin & Personal Care (/concern/skin-personal-care)
├── About Fibax (/about)
│   ├── Our Heritage & Purity Promise (/about#heritage)
│   ├── AYUSH & Quality Certifications (/about#certifications)
│   └── Manufacturing Standards (/about#manufacturing)
├── Wellness Journal / Blog (/blog)
│   ├── Ayurvedic Remedies (/blog/category/remedies)
│   ├── Lifestyle & Diet (/blog/category/lifestyle)
│   └── Single Post (/blog/:slug)
├── Help & Support
│   ├── Contact Us (/contact)
│   ├── Track Your Order (/track-order)
│   ├── FAQs (/faqs)
│   └── AYUSH Consultation (/consultation)
└── Customer Account
    ├── Login / Register (/account/login)
    ├── Orders & Invoices (/account/orders)
    ├── Saved Addresses (/account/addresses)
    └── Wishlist (/wishlist)
```

---

### 3. Product Catalog Concern Mapping Matrix (All 35 Products)

| Health Concern Slug | Target Concern Name | Assigned Fibax Live Products |
| :--- | :--- | :--- |
| `joint-pain-relief` | **Joint & Pain Care** | 1. Axe Ortho Oil (60ml)<br>2. Axe Ortho Pain Relief Capsules (30s)<br>3. Axe Ortho Syrup (200ml)<br>4. Arthobax Capsules (30s)<br>5. Uriupchar Capsules (Uric Acid & Joint Care) |
| `digestive-gut-health` | **Digestive & Gut Health** | 6. Fp Enzyme Syrup (200ml)<br>7. Fibocid Antacid Syrup (200ml)<br>8. Constisol Constipation Syrup (200ml)<br>9. Fibax Triphala Juice (500ml)<br>10. Piles Back Combo Kit |
| `liver-care-detox` | **Liver Care & Detox** | 11. Livupchar Liver Care Syrup (200ml)<br>12. Livupchar Liver Detox Capsules (30s) |
| `kidney-urinary-care` | **Kidney & Urinary Care** | 13. Stonupchar Kidney & Urinary Syrup (200ml)<br>14. Stonupchar Kidney Detox Capsules (30s)<br>15. Uriupchar Capsules (30s) |
| `diabetes-blood-sugar` | **Diabetes & Blood Sugar** | 16. Diabdic Ayurvedic Syrup (300ml)<br>17. Diabdic Blood Sugar Capsules (30s)<br>18. Fibax Neem Karela Jamun Juice (500ml) |
| `immunity-vitality` | **Immunity & Vitality** | 19. Fibax Multivitamin Syrup (500ml)<br>20. Immunbax Immunity & Platelet Syrup (200ml)<br>21. Platobax Platelet Boost Syrup (200ml)<br>22. Fevobax Fever Support Capsules (30s)<br>23. Fibax Amla Powder (100g)<br>24. Fibax Ashwagandha Powder (100g) |
| `mens-wellness-stamina` | **Men's Health & Stamina** | 25. Moonkind Power & Stamina Capsules (30s)<br>26. Incredible Musli Gold Capsules (30s)<br>27. Fibax Safed Musli Powder (100g)<br>28. Fibax Ashwagandha Powder (100g) |
| `womens-wellness` | **Women's Health & Hormones** | 29. Nariupchar Women Hormonal Syrup (200ml) |
| `cardiac-blood-pressure` | **Heart & Blood Pressure** | 30. Lipidobax Cholesterol Control Syrup (200ml)<br>31. BP Hype Blood Pressure Syrup (200ml) |
| `skin-personal-care` | **Skin & Personal Care** | 32. Fibax Neem & Aloevera Facewash (100ml)<br>33. Fibax Haldi Chandan Soap (75g)<br>34. Fibax Neem Aloevera Soap (75g)<br>35. Fibax Rose Soap (75g)<br>36. Fibax Lemon Soap (75g) |
| `respiratory-cough-care` | **Cough & Respiratory** | 37. Tus Remove Ayurvedic Cough Relief Syrup (100ml) |

---

### 4. Complete Page Inventory & URL Routing Structure

| Route Pattern | Page Type | Dynamic Parameters | SEO Intent |
| :--- | :--- | :--- | :--- |
| `/` | Homepage | None | High-intent brand landing & discovery |
| `/shop` | Catalog Hub | Query: `?sort=`, `?filter=`, `?page=` | Comprehensive shopping index |
| `/shop/combos` | Combos & Bundles | Query: `?concern=` | High AOV multi-product kits |
| `/concern/:slug` | Concern Category Page | Slug: e.g. `joint-pain-relief` | Organic ranking for symptom searches |
| `/category/:slug` | Dosage Category Page | Slug: e.g. `syrups`, `capsules` | Dosage preference shopping |
| `/product/:slug` | Product Detail Page | Slug: e.g. `ayurvedic-multivitamin-syrup` | Transactional purchase funnel |
| `/cart` | Full Cart Page | Fallback for non-drawer browsers | Order review |
| `/checkout` | Multi-step Checkout | Step: `info`, `address`, `payment` | Order execution & conversion |
| `/order-success/:id`| Order Confirmation | Order ID / UUID | Post-purchase tracking & thank-you |
| `/track-order` | Order Tracking | None | Customer service self-help |
| `/about` | Brand & Purity | None | Institutional trust & credentials |
| `/contact` | Contact & Inquiries | None | Customer support & B2B inquiries |
| `/blog` | Content Marketing Hub | Query: `?category=`, `?page=` | Top-of-funnel health education |
| `/blog/:slug` | Blog Article Page | Slug: e.g. `winter-health-tips` | Organic health problem capture |
| `/privacy-policy` | Legal Policy | None | Regulatory compliance |
| `/terms-conditions` | Terms & Conditions | None | E-commerce legal mandate |
| `/shipping-policy` | Shipping Policy | None | SLA & shipping rates transparency |
| `/refund-returns` | Return/Refund Policy | None | Trust & buyer security |
| `/admin/*` | Admin Dashboard | Authenticated Admin JWT | Full catalog, orders & CMS management |

---

### 5. Detailed Homepage Section Engineering Specifications (Item 6)

| # | Section Name | Purpose | Heading | Supporting Copy Direction | CTA | Content Required | Image Requirements | Product Data Required | Conversion Objective |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Announcement Bar** | Highlight urgent value prop & free shipping hook | Free Shipping on Orders Over ₹499 | Free shipping across India + COD available | "Shop Bestsellers" | Shipping threshold notice, discount code teaser | Minimal SVG icons (truck, shield) | None | Reduce cart abandonment; establish immediate value |
| 2 | **Header / Navigation** | Instant product discovery & cart access | N/A | Intuitive dual-gateway nav (Concerns + Categories) | "Cart (Drawer Trigger)" | Concern dropdown items, format categories, search bar, contact | High-res Fibax Logo SVG (155px) | Dynamic cart item count badge | Minimize navigation friction; direct shoppers to concern hubs |
| 3 | **Hero Slider** | High-impact sales entry point | "Ayurvedic Science for Modern Vitality" | Targeted pain relief, liver protection, and immune recovery crafted from standardized botanical extracts | "Shop by Concern" & "Explore Offers" | 3 carousel slides with therapeutic value propositions | 1920x800 desktop / 800x800 mobile WebP lifestyle packshots | Featured promo product IDs | Immediate brand trust and click-through to high-margin products |
| 4 | **Trust Pillars Bar** | Overcome initial buyer skepticism | "Our Quality & Purity Assurance" | AYUSH Approved • GMP Certified • 100% Herbal Actives • Pan-India COD | None (Informational) | 4 trust guarantee micro-cards with certifications | 4 crisp SVG vector seals | None | Eliminate doubts about adulteration, safety, and legitimacy |
| 5 | **Shop by Concern** | Direct symptom-based conversion gateway | "What Health Concern Can We Help You With?" | Clinically formulated Ayurvedic solutions categorized by your physiological wellness needs | "View All Concerns →" | 10 circular/square cards with icon + label + product count | 10 custom illustrated anatomical/botanical concern icons | Concern IDs, slug, product counts | Match 75%+ of organic visitors to their exact symptom remedy |
| 6 | **Our Bestsellers** | Leverage social proof on proven formulas | "Most Trusted Ayurvedic Remedies" | Tried, tested, and loved by over 50,000+ Indian families | "Add to Cart" & "View All" | Horizontal product carousel with quick-add functionality | Transparent background 1000x1000 WebP packshots | Title, rating, review count, MRP, salePrice, slug | Drive impulse add-to-cart on proven high-velocity SKUs |
| 7 | **Featured Combos & Kits**| Maximize Average Order Value (AOV) | "Complete Ayurvedic Healing Courses" | Synergistic internal + external remedies designed to work together for faster relief | "Grab Course & Save 20%" | Bundle comparison cards showing individual items vs kit price | Composite multi-bottle packshots (Syrup + Capsule + Oil) | Bundle ID, included product SKUs, total MRP vs bundle price | Upgrade single-bottle shoppers into multi-item course buyers |
| 8 | **Shop by Formulation Format** | Support shoppers looking for specific dosage types | "Explore by Category" | Syrups, herbal capsules, pure churnas, juices, and therapeutic oils | Category Links | 6 category tiles with dosage form descriptions | Clean packshot representation of each formulation family | Category slug, total products count | Cater to traditional consumers with format preferences |
| 9 | **Featured Product Deep-Dive Story** | Deep education on flagship hero product | "Arthobax & Axe Ortho: Rapid Mobility & Joint Freedom" | How traditional Boswellia (Sallaki) and Nirgundi restore synovial fluid without gastric irritation | "Buy Complete Course Now" | Visual anatomy breakdown of joints + active herb mechanisms | High-impact clinical lifestyle shot + 3D ingredient breakdown | Flagship product ID, real-time price, variant selector | Convert hesitant high-ticket chronic pain sufferers |
| 10| **Botanical Ingredients Spotlight** | Reinforce herbal purity and transparency | "Powered by Sacred Ayurvedic Botanicals" | Ethically wildcrafted herbs standardized for maximum bioactive potency | "Explore Herbal Glossary" | 4 ingredient profile cards (Ashwagandha, Sallaki, Triphala, Giloy)| Macro photography of fresh botanical roots, leaves, and barks | Linked ingredient IDs and associated products | Solidify Ayurvedic authenticity and scientific credibility |
| 11| **Verified Customer Reviews** | Authentic social proof & community validation | "Real Stories of Healing & Vitality" | Over 4.8-star average rating across thousands of verified patient orders | "Write a Review" | Customer review cards with verified buyer tags, ratings, days used | Optional customer photo proof / video snippets | Product title, reviewer name, star count, date, review text | Reassure hesitant first-time buyers right before checkout |
| 12| **Wellness Journal / Health Feed** | Top-of-funnel SEO & patient education | "From the Fibax Wellness Journal" | Evidence-informed Ayurvedic lifestyle, dietary guidelines, and seasonal health routines | "Read Article" | 3 latest blog post cards with read-time and category | 800x500 WebP editorial imagery | Post slug, title, excerpt, publish date | Capture informational organic traffic; educate patients |
| 13| **Newsletter / First Order Discount Hook** | Customer acquisition & email/SMS capture | "Begin Your Ayurvedic Journey: Get 10% Off" | Subscribe for seasonal wellness tips, herbal recipes, and exclusive flash sales | "Claim 10% Off" | Single input field (Email or WhatsApp Mobile) + instant coupon trigger | Subtle botanical background texture | Coupon code auto-creation in database | Capture abandoning visitors into email/WhatsApp nurture funnels |
| 14| **Universal Trust Footer** | Final institutional reassurance & legal compliance | "Fibax Pharma — Nurturing Life Through Ayurveda" | Complete navigation, AYUSH disclaimers, GST info, and direct contact desk | Social & Support CTAs | Address, customer care phones (+91-76579-63458), policies | Secure payment badges (UPI, Visa, Mastercard, RuPay, COD) | None | Comply with e-commerce consumer protection laws |

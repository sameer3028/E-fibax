# FIBAX PHARMA — TECHNICAL SEO & ORGANIC GROWTH BLUEPRINT
## D2C Search Optimization & AYUSH-Compliant Search Engine Strategy

---

### 1. Technical SEO Architecture
- **Rendering Strategy**: Next.js / Vite with Server-Side Pre-Rendering (SSG/SSR) or dynamic edge HTML generation for search bots.
- **Canonical URLs**: Strict self-referential canonicalization across all concern, category, and product URLs to avoid duplicate content penalties.
- **URL Structure**: Clean, descriptive, semantic slugs without dates, query parameters, or file extensions:
  - Concern: `/concern/:slug` (e.g., `/concern/joint-pain-relief`)
  - Category: `/category/:slug` (e.g., `/category/syrups`)
  - Product: `/product/:slug` (e.g., `/product/arthobax-capsules-for-arthritis-joint-pain-relief`)
  - Blog: `/blog/:slug` (e.g., `/blog/winter-health-tips`)

---

### 2. Structured Data (Schema.org / JSON-LD) Blueprint

#### A. Product Schema with AggregateOffer & Review
Every product page dynamically injects rich schema to achieve Google Rich Snippet stars, pricing, and stock status:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Arthobax Ayurvedic Capsules for Arthritis & Joint Pain Relief",
  "image": [
    "https://fibaxpharma.com/wp-content/uploads/2023/10/arthobax-1000-pxl-2.png"
  ],
  "description": "Natural Ayurvedic herbal capsules formulated with Sallaki and Guggul to relieve joint stiffness and support cartilage health.",
  "sku": "FBX-ARTHO-30C",
  "brand": {
    "@type": "Brand",
    "name": "Fibax Pharma"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://fibaxpharma.com/product/arthobax-capsules-for-arthritis-joint-pain-relief",
    "priceCurrency": "INR",
    "price": "330.00",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Fibax Pharma"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "64"
  }
}
```

#### B. FAQPage Schema
Injected on PDPs to capture Google People Also Ask (PAA) rich results:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long should I take Arthobax Capsules for joint pain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For optimal joint flexibility and lasting comfort, Ayurvedic practitioners recommend consistent use for 60 to 90 days alongside light movement and a balanced diet."
      }
    }
  ]
}
```

#### C. BreadcrumbList Schema
Standardized across all collection and product routes:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://fibaxpharma.com" },
    { "@type": "ListItem", "position": 2, "name": "Joint & Pain Care", "item": "https://fibaxpharma.com/concern/joint-pain-relief" },
    { "@type": "ListItem", "position": 3, "name": "Arthobax Capsules", "item": "https://fibaxpharma.com/product/arthobax-capsules-for-arthritis-joint-pain-relief" }
  ]
}
```

---

### 3. AYUSH & Indian Regulatory Compliance Rules for SEO Content
1. **Forbidden Terminology**:
   - Never use "Cure", "Eliminate", "100% Guaranteed Relief", "Alternative to Prescription Medicine".
2. **Compliant Substitutes**:
   - Use "Supports healthy joint function", "Natural relief for discomfort", "Formulated to maintain balanced blood sugar levels", "Ayurvedic support for vitality".
3. **Mandatory Disclaimer**:
   - Every product page footer must display: *"This product is an Ayurvedic proprietary medicine. It is not intended to diagnose, treat, cure or prevent any disease. Results may vary from person to person. Please consult an Ayurvedic practitioner before starting any supplement regimen."*

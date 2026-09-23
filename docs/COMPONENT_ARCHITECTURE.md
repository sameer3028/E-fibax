# FIBAX PHARMA — FRONTEND COMPONENT ARCHITECTURE
## React + Vite + TypeScript Component Blueprint

---

### 1. Architecture Philosophy & Design Pattern
The frontend utilizes a modular **Atomic Design** layered architecture within React 18+ and TypeScript:
- **Prims / UI Atoms** (`components/ui/`): Low-level stateless primitives based on Tailwind CSS and Radix UI / shadcn (Button, Badge, Input, Dialog, Tooltip, Skeleton, Slider).
- **Molecules** (`components/molecules/`): Reusable functional widgets (ProductCard, RatingStars, PriceDisplay, QuantitySelector, HerbTag, AccordionItem, SearchBar).
- **Organisms** (`components/organisms/`): Complex interactive systems (Header, Footer, CartDrawer, ConcernGrid, ProductGallery, ProductTabs, ReviewSection, CheckoutForm, StickyAddToCart).
- **Templates / Layouts** (`components/layouts/`): Page shells (StoreLayout, AdminLayout, CheckoutLayout).
- **Pages** (`pages/`): Route views fetching and passing state to organisms.

---

### 2. Frontend Directory Structure

```
frontend/
├── src/
│   ├── assets/                 # SVGs, icons, static brand graphics
│   ├── components/
│   │   ├── ui/                 # shadcn / Radix primitives
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx       # Used for CartDrawer & MobileNav
│   │   │   ├── accordion.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── input.tsx
│   │   │   └── skeleton.tsx
│   │   ├── common/             # Cross-cutting components
│   │   │   ├── Header/
│   │   │   │   ├── TopNoticeBar.tsx
│   │   │   │   ├── MainHeader.tsx
│   │   │   │   ├── ConcernDropdown.tsx
│   │   │   │   └── SearchModal.tsx
│   │   │   ├── Footer/
│   │   │   │   ├── MainFooter.tsx
│   │   │   │   └── TrustCertificationsBar.tsx
│   │   │   ├── CartDrawer/
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CartItemRow.tsx
│   │   │   │   ├── FreeShippingBar.tsx
│   │   │   │   ├── CartUpsellList.tsx
│   │   │   │   └── CouponInput.tsx
│   │   │   ├── ProductCard/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductBadge.tsx
│   │   │   │   └── QuickAddButton.tsx
│   │   │   └── StickyBar/
│   │   │       └── StickyAddToCart.tsx
│   │   ├── sections/           # Homepage & Landing page sections
│   │   │   ├── HeroSlider.tsx
│   │   │   ├── ShopByConcernSection.tsx
│   │   │   ├── BestsellersCarousel.tsx
│   │   │   ├── ComboDealsSection.tsx
│   │   │   ├── WhyChooseFibax.tsx
│   │   │   ├── IngredientSpotlight.tsx
│   │   │   ├── CustomerReviewsMarquee.tsx
│   │   │   └── WellnessBlogFeed.tsx
│   │   └── pdp/                # Product Detail Page specific organisms
│   │       ├── ProductGallery.tsx
│   │       ├── ProductDetailsHeader.tsx
│   │       ├── PackSelector.tsx
│   │       ├── KeyIngredientsGrid.tsx
│   │       ├── HowToUseTimeline.tsx
│   │       ├── ProductFaqAccordion.tsx
│   │       └── ReviewSubmissionModal.tsx
│   ├── context/ / store/       # Global State (Zustand or React Context)
│   │   ├── useCartStore.ts     # Persistent cart, subtotal, discount, drawer toggle
│   │   ├── useAuthStore.ts     # User token, role, customer profile
│   │   └── useFilterStore.ts   # Shop filters (concern, price, category)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useProducts.ts
│   │   ├── useCart.ts
│   │   └── useScrollPosition.ts
│   ├── types/                  # TypeScript interface definitions
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   └── order.ts
│   ├── lib/                    # Utilities & API client
│   │   ├── api.ts              # Axios / Fetch wrapper with interceptors
│   │   └── utils.ts            # Formatting (Currency ₹, date, cn classNames)
│   ├── pages/                  # Route views
│   │   ├── HomePage.tsx
│   │   ├── ShopPage.tsx
│   │   ├── ConcernPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CombosPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrderSuccessPage.tsx
│   │   ├── AboutPage.tsx
│   │   └── ContactPage.tsx
│   └── App.tsx                 # Router setup & query provider
```

---

### 3. Core Component Props & Contract Specifications

#### A. `ProductCard.tsx`
```typescript
export interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  dosageForm: 'Syrup' | 'Capsule' | 'Juice' | 'Powder' | 'Oil' | 'Soap';
  featuredImage: string;
  secondaryImage?: string;
  mrp: number;
  salePrice: number;
  ratingAverage: number;
  ratingCount: number;
  badge?: 'BESTSELLER' | 'NEW' | 'SAVE_MORE' | null;
  keyHerbs?: string[];
  inStock: boolean;
  onQuickAdd?: (productId: string) => void;
}
```

#### B. `CartDrawer.tsx`
```typescript
export interface CartDrawerState {
  isOpen: boolean;
  items: CartItem[];
  subtotal: number;
  shippingCharge: number;
  discountAmount: number;
  appliedCoupon: string | null;
  freeShippingThreshold: number; // 499
  freeShippingProgress: number; // 0 to 100 percentage
  crossSells: Product[];
  toggleDrawer: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  applyCoupon: (code: string) => Promise<boolean>;
}
```

#### C. `StickyAddToCart.tsx`
- Mounted dynamically on PDP when viewport scroll Y exceeds the hero Add-to-Cart button position.
- Animates in via Framer Motion slide-up:
  - Displays pack thumbnail, selected variant, price, and instant CTA buttons.

---

### 4. Strict Engineering Directives: Zero WordPress Classes & Zero Iframes
- **NO WordPress Classes**: Strictly zero legacy classes such as `wp-*`, `woocommerce-*`, `elementor-*`, or `frutin-*`.
- **NO Iframes**: Strictly zero `<iframe>` embeds for content, products, or forms.
- **100% Native Architecture**: All elements (headers, product cards, galleries, accordions, modals, checkout forms, and review grids) must be authored as clean, modern, semantic React + Tailwind CSS components.

# FIBAX PHARMA — REST API SPECIFICATION & BACKEND ARCHITECTURE
## Node.js + Express.js + TypeScript API Blueprint

---

### 1. Architecture Overview & Best Practices
- **Base Endpoint**: `/api/v1`
- **Protocol**: HTTPS (TLS 1.3) with JSON request/response payloads.
- **Security & Headers**:
  - Helmet for security headers (CSP, HSTS, X-Frame-Options).
  - CORS strictly configured to frontend domains.
  - Rate limiting via Redis / Memory store on sensitive routes (`/api/v1/auth/*`, `/api/v1/orders/checkout`).
- **Response Format**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": { "page": 1, "total": 35 }
}
```

---

### 2. Core API Route Registry

#### Public Storefront Endpoints
| HTTP Method | Route | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | List all products with filtering & sorting | `?concern=`, `?category=`, `?sort=`, `?search=`, `?page=`, `?limit=` |
| `GET` | `/api/v1/products/:slug` | Get complete product detail (gallery, herbs, FAQs, reviews) | None |
| `GET` | `/api/v1/concerns` | List all 10 health concerns with product counts | None |
| `GET` | `/api/v1/concerns/:slug` | Get specific concern details + curated products | None |
| `GET` | `/api/v1/combos` | List all curated bundle packs & value kits | None |
| `GET` | `/api/v1/reviews/:productId`| Get verified customer reviews with rating aggregates | `?page=`, `?sort=helpful|recent` |
| `POST` | `/api/v1/reviews/:productId`| Submit new customer review (triggers pending moderation)| Body: `{ rating, authorName, title, content, phone }` |

#### Cart & Checkout Endpoints
| HTTP Method | Route | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | Retrieve session/user cart with live price calculations | None (reads Cookie/Bearer) |
| `POST` | `/api/v1/cart/items` | Add item to cart | `{ productId, quantity }` |
| `PATCH` | `/api/v1/cart/items/:id` | Update item quantity | `{ quantity }` |
| `DELETE`| `/api/v1/cart/items/:id` | Remove item from cart | None |
| `POST` | `/api/v1/coupons/apply` | Validate and apply promo discount code | `{ code, cartSubtotal }` |
| `POST` | `/api/v1/orders/create` | Initialize order & generate Razorpay Order ID | `{ address, items, paymentMethod, couponCode }` |
| `POST` | `/api/v1/orders/verify` | Verify Razorpay payment signature & confirm order | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` |
| `GET` | `/api/v1/orders/track/:id`| Public order tracking via Order ID + Phone | `?phone=XXXXXXXXXX` |

#### Authentication & Customer Endpoints
| HTTP Method | Route | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/otp/send` | Send login OTP to customer mobile number | `{ phone }` |
| `POST` | `/api/v1/auth/otp/verify` | Verify OTP and return JWT in HTTP-only cookie | `{ phone, otp }` |
| `GET` | `/api/v1/customer/profile`| Get customer profile, saved addresses, and order history | Requires Auth JWT |
| `POST` | `/api/v1/customer/address`| Save or update delivery address | `{ fullName, phone, addressLine1, pincode, ... }` |

#### Admin Management Endpoints (`/api/v1/admin/*`)
| HTTP Method | Route | Description | Access Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/analytics` | Revenue, AOV, bestsellers, low-stock metrics | ADMIN |
| `GET/POST` | `/api/v1/admin/products` | CRUD product catalog & inventory levels | ADMIN, STAFF |
| `GET/PATCH`| `/api/v1/admin/orders` | Manage order statuses, assign tracking IDs, trigger dispatch | ADMIN, STAFF |
| `GET/PATCH`| `/api/v1/admin/reviews` | Moderate and approve pending customer reviews | ADMIN |
| `POST` | `/api/v1/admin/coupons` | Create promotional vouchers and discount tiers | ADMIN |
| `PATCH` | `/api/v1/admin/banners` | Update homepage announcement and hero sliders | ADMIN |

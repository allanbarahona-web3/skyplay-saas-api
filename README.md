# 🚀 **Skyplay SaaS Backend API**
**Multi-tenant REST API para venta de credenciales digitales, streaming, pins y giftcards.**

Skyplay SaaS Backend es una **API multi-tenant NestJS** diseñada para potenciar múltiples aplicaciones frontend independientes usando un único backend modular, donde cada tenant tiene datos aislados y módulos personalizables.

Este es un **proyecto solo backend**. Los frontends se despliegan de forma independiente en repositorios separados.

## Key Features:

- **Real multi-tenancy architecture with PostgreSQL RLS**
- **Domain-based tenant detection (automatic from Origin header)**
- **Complete REST API for Products, Orders, Payments, CRM**
- **Secure authentication (JWT with JTI blacklist)**
- **File storage with Digital Ocean Spaces**
- **Email notifications and templating**
- **Rate limiting and CORS protection**

📌 **One backend API, multiple tenant frontends.**
Each tenant is isolated and can have multiple domains.

---

## 🧩 **API Modules**

### 📦 **Products & Categories**  
- Multi-tenant product catalog  
- Categories with hierarchical structure
- Image storage with DO Spaces proxy
- Tenant-isolated data with RLS

### 🛒 **Orders & Payments**  
- Order creation and management
- Payment processing integration
- Order status tracking
- Customer billing information

### 💬 **CRM (Customer Relationship Management)**  
- Contact management
- Lead tracking and conversion
- Customer interaction history
- Segmentation and filtering

### 👥 **Tenant & User Management**
- Multi-tenant isolation
- Domain-based tenant detection
- User authentication with JWT
- Role-based access control (RBAC)

### 📁 **Media & Files**
- Image upload to Digital Ocean Spaces
- Image proxy to bypass CORS
- File management per tenant

### 📧 **Email Notifications**
- Transactional emails
- HTML templates with Handlebars
- SendGrid integration

---

## 🏗 **Architecture**

```
Frontend Apps (Vercel)          Backend API (NestJS)           Database
─────────────────────          ──────────────────────         ────────
                                                              
sneakerscr.vercel.app  ──┐                                   PostgreSQL
www.cocoandnina.com    ──┼──→  localhost:3000/ngrok  ──→    (Digital Ocean)
barmentech.com         ──┘      Multi-tenant API              + RLS Policies
                                │
                                ├─ Tenant Detection (Origin header)
                                ├─ JWT Authentication  
                                ├─ Rate Limiting
                                └─ CORS Protection
```

**Each frontend:**
- Independent Next.js application
- Separate repository and deployment
- Calls backend API with tenant's domain in Origin header
- Backend automatically detects tenant from domain

---

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm (package manager)

🔐 **Each tenant has its own users, domain, products, orders, settings, contacts and data rules.**

---

## 🛠 **Tech Architecture (High-Level)**
> Stack: **NestJS + PostgreSQL (RLS) + Next.js App Router + Stripe + Docker**

┌────────────── Storefront (Next.js) ───────────────┐
│ Auth • Cart • Checkout • Admin • Custom Themes │
└──────────────────────────┬────────────────────────┘
↓
┌──────────────────── Backend (NestJS) ─────────────┐
│ Modules: Commerce • CRM • Billing • Automations │
│ RLS + Auth + JTI + Rate Limit + DTO Validation │
└──────────────────────┬────────────────────────────┘
↓
PostgreSQL + Row-Level Security (RLS)


---

## 🔐 **Security & Isolation**
✔ PostgreSQL **Row-Level Security (32+ policies)**  
✔ JWT with **JTI revocation**  
✔ Rate limiting + CORS rules  
✔ Role-based access control (admin, customer, super admin)  
✔ Domain-to-tenant routing with middleware + guards  
✔ Strict tenant isolation in every service  

---

## 🚀 **Project Status**
🔧 **Backend — Production-Ready (85%+)**
- NestJS + Prisma  
- Multi-tenancy + Host extraction  
- RLS Policies across all modules  
- Auth + JTI + Rate limiting  
- 32+ endpoints shipped  
- Tests in progress  

🛒 **Storefront — Functional (App Router)**
- Multi-tenant UI + Themes  
- Cart + Checkout flow  
- Admin panel with products, media, payments  
- Auth modal + context + reusable hooks  

💬 **CRM & Automations — Architecture Complete**
- WebSockets + gateway  
- WhatsApp API + Telegram ready  
- Automation layer planned around events, queues and webhooks 
---

## 📦 **Module Activation (Tenant-Based)**

Tenant 1 → Storefront + Billing
Tenant 2 → CRM + Automations
Tenant 3 → Storefront + CRM + Billing + Automations


📌 **This makes the platform scalable as a SaaS business**, not just an eCommerce template.

---

## 📁 **Project Structure**

<details>
<summary><b>Backend (NestJS + Prisma) — click to expand</b></summary>



api/
├── src/
│ ├── common/ # Decorators, guards, interceptors
│ ├── modules/ # Commerce, CRM, Billing, Automations
│ ├── prisma/ # ORM & migrations
│ ├── app.module.ts
│ └── main.ts
└── prisma/
├── schema.prisma
├── enable-rls.sql
└── seed.ts


</details>

<details>
<summary><b>Frontend (Next.js App Router) — click to expand</b></summary>



app/
├── (storefront)/ # Public store per tenant
├── (tenant-admin)/ # Admin Panel
├── components/ # Shared UI + modals + hooks
├── lib/ # API config + helpers + tenant utils
└── middleware.ts # Multi-tenant domain handling


</details>

---

## 🧪 **Tests**
> Tests cover security rules, RLS policies, domain isolation and business flows.

- Backend: **Jest + Supertest**  
- Frontend: **Vitest + Playwright**  
- Payment testing via **Stripe CLI & Paypal Sandbox & Crypto**

---

## 🚧 **Roadmap**

### Phase 1 — Finishing Commerce & Billing
- Complete checkout & order tracking  
- Stripe + PayPal + Crypto payments  
- Email + receipt automation  

### Phase 2 — CRM Release
- Webhooks + smart routing  
- Full WhatsApp/Telegram/Instagram/Tiktok/Emails/etc flows  
- Chat assignment + analytics  

### Phase 3 — Automations Hub
- Business rules engine  
- Workflow automation via APIs, webhooks, and messaging triggers
- API marketplace for modules  

---

## 📌 **License & Contact**
This project is currently **not open for contributions.**  
Business inquiries: *(add your email or LinkedIn link here)*

Nov27/2025
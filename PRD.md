# Product Requirements Document (PRD): StackBox

**Product Name:** StackBox (Stack-Vault)  
**Version:** 1.1.0  
**Status:** In Development / MVP  
**Date:** April 2026

---

## 1. Executive Summary & Vision

**StackBox** is a specialized B2B/B2C SaaS solution designed for IT leaders, DevOps engineers, system administrators, and freelancers. The product aims to unify fragmented infrastructure data—often scattered across spreadsheets, notes, and chat apps—into a single, aesthetic, and cryptographically secure vault.

### Core Value Propositions:
- **Security First:** "Bullet-proof" encryption for sensitive credentials.
- **Unified Inventory:** A single source of truth for Servers, Projects, and Services.
- **Modern UX:** A high-end Neumorphic design that prioritizes clarity and speed.

---

## 2. Target Audience

1. **DevOps & SysAdmins:** Need a registry of hardware/cloud assets, SSH keys, and firewall configurations.
2. **IT Freelancers & Full-stack Developers:** Manage multiple client projects, access codes (DB, Hosting, API), and server stacks.
3. **IT Managers:** Require a high-level overview (Dashboard) of infrastructure health and resource allocation.

---

## 3. Product Features (Functional Requirements)

### 3.1 Authentication & Onboarding
- **Google OAuth Integration:** Secure entry via Firebase Authentication.
- **Paywall/Trial Logic:** 14-day free trial period followed by a subscription model (300 RUB/mo) integrated via YooKassa API.

### 3.2 Global Dashboard
- **Aggregated Metrics:** Real-time counters for Projects, Servers, and Services.
- **Clean Aesthetic:** Optimized for monitoring with a simplified UI that removes distracting action buttons from dashboard summary cards.
- **Quick Navigation:** Direct links to detailed module views via card interaction.

### 3.3 Infrastructure Modules
- **Projects:** 
  - Manage project lifecycles (Active/Archived).
  - Documentation of tech stacks (Tags), descriptions, and live URLs.
- **Servers:**
  - Inventory of IP addresses, providers (AWS, GCP, DigitalOcean), OS types (Ubuntu, CentOS), and notes.
  - Relational mapping to Projects.
- **Services:**
  - Mapping of microservices to specific servers.
  - Tracking of ports (443, 8080) and internal/external URLs.

### 3.4 The Secure Vault (Credentials Management)
- **Encryption Algorithm:** Standard `AES-256-GCM` using the Web Crypto API.
- **Selective Decryption:** Password fields are masked by default. Decryption is performed server-side or via a secure API call only upon specific user interaction.
- **Clipboard Security:** One-click copy for decrypted secrets.

### 3.5 Ephemeral Sharing (Share Links)
- **Time-bound Access:** Generate temporary URLs to share specific server or credential details.
- **Lifecycle Management:** Users can view, revoke, or delete active sharing tokens.

---

## 4. Non-Functional Requirements

- **Security:** Zero-knowledge principles where possible. Sensitive keys reside in server environment variables.
- **Localization (i18n):** Real-time switching between English and Russian.
- **Performance:** Single Page Application (SPA) architecture utilizing Next.js for high-speed routing.
- **Responsiveness:** Tactile Neumorphic mobile-first design.

---

## 5. Technical Architecture

- **Frontend:** React 19, Next.js 15 (App Router).
- **Backend:** Next.js Server Components and API Routes (Node.js).
- **Database:** Firebase Firestore (NoSQL) with hardened Security Rules.
- **Styling:** Tailwind CSS v4.0 with Custom CSS Properties for Neumorphic depth.
- **Animations:** Motion (Framer Motion) for state transitions.

---

## 6. Design System (UI/UX)

- **Aesthetic:** Neumorphism (Soft UI).
- **Themes:** Persistent Light/Dark theme toggle using `next-themes`.
- **Typography:** `Geist Sans` for structural text, `Geist Mono` for technical data.

---

## 7. Roadmap & Future Scope

### Phase 1: MVP (Current)
- CRUD for all major entities.
- Basic AES encryption.
- Multi-language support.

### Phase 2: Collaboration (Q3 2026)
- **Teams & RBAC:** Invite colleagues to shared projects with specific permissions (Reader/Editor).
- **Activity Feed:** Detailed audit logs of all changes and secret reveals.

### Phase 3: Automation (Q1 2027)
- **Cloud Importers:** Auto-sync servers from AWS/GCP APIs.
- **Uptime Monitoring:** Basic ping checks for registered Services.

---

## 8. Compliance & Legal

- **Data Privacy:** Users own their data. Encryption ensures even database administrators cannot read sensitive secrets.
- **Localization:** Compliant with primary data storage regulations in targeted regions.

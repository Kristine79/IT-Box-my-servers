# IT-Box 🗄️

**A unified, secure vault for your entire IT infrastructure.**

IT-Box is a modern, web-based platform designed for system administrators, DevOps engineers, and IT teams to centralize and secure their infrastructure data. It eliminates fragmented spreadsheets and insecure password sharing by providing a single, encrypted source of truth for projects, servers, services, and credentials.

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_&_Frontend-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

---

## ✨ Key Features

- 📊 **Intelligent Dashboard:** A centralized overview of your infrastructure health, active projects, and recently modified assets.
- 📁 **Project Management:** Track IT projects with status tagging (Active/Archived), tech stack documentation, and cross-linking to servers.
- 🖥️ **Server Inventory:** Maintain a detailed registry of machines with IP tracking, OS versions, provider details, and quick-copy functionality.
- 🌐 **Service Directory:** Map applications and microservices to their respective servers, ports, and public URLs.
- 🔐 **The Secure Vault:** A high-security module for storing SSH keys, database credentials, and API secrets. 
  - **AES-256-GCM Encryption:** All secrets are encrypted client-side or at the API level before reaching the database.
  - **Zero-Knowledge Feel:** Passwords are masked by default and require explicit user action (and server-side decryption) to view.
- 🔗 **Secure Sharing (Ephemeral Links):** Generate temporary, time-limited landing pages to share configuration details with external contractors without revealing actual database records.
- 🌓 **Neumorphic UI/UX:** A unique, tactile interface design that reduces eye strain and provides a premium, modern feel. Supports **Light** and **Dark** modes.
- 🌍 **Internationalization:** Full support for English and Russian languages out of the box.
- 📱 **PWA Ready:** Install IT-Box as a native-like app on your desktop or mobile device.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router & React 19)
- **Database & Auth:** [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Auth](https://firebase.google.com/docs/auth)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with Neumorphic custom variables.
- **Animations:** [Motion](https://motion.dev/) (formerly Framer Motion)
- **Encryption:** Web Crypto API / Node.js Crypto for AES-256-GCM.
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **i18n:** `react-i18next`

---

## 🔐 Security Architecture

IT-Box takes security seriously. We implement the "Eight Pillars of Hardened Rules" in our Firestore configuration and utilize high-grade encryption for all secrets:

1. **Payload Encryption:** Secrets are encrypted via `AES-256-GCM`.
2. **Key Isolation:** Encryption keys are managed via server-side environment variables, never exposed to the client bundle.
3. **IAM (Identity & Access Management):** Granular Firestore security rules ensure users can only access data they own.
4. **Audit Logs:** (Planned) Tracking of who accessed which secret and when.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18.x or higher
- A Firebase project (Firestore & Google Auth enabled)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/it-box.git
   cd it-box
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file based on `.env.example`:
   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   
   # Encryption (32-byte hex string)
   ENCRYPTION_KEY=your_32_byte_hex_key
   
   # Billing (Optional - YooKassa)
   YOOKASSA_SHOP_ID=your_shop_id
   YOOKASSA_SECRET_KEY=your_secret_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📈 Roadmap

- [ ] Individual Resource Permissions (Teams)
- [ ] SSH Key Generation & Storage
- [ ] Auto-discovery for cloud instances (AWS/GCP/Azure)
- [ ] Integration with Telegram/Discord for infrastructure alerts
- [ ] Master Password secondary authentication

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Developed with ❤️ by the IT-Box Team.

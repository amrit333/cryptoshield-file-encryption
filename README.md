# 🛡️ CryptoShield

CryptoShield is a modern, high-performance web application designed for secure, military-grade end-to-end file encryption, storage, and secure self-destructing file sharing.

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the application running on your local machine.

### 📋 Prerequisites
Ensure you have the following installed:
* **Node.js** (v18.x, v20.x, or later)
* **npm** (comes with Node.js) or **yarn**

---

## 🛠️ Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

---

## ⚙️ Step 2: Environment Configuration
Create a file named `.env` in the root of the project (if it doesn't already exist) and configure the following environment variables:

```env
# 1. Database Configuration
# Remote Neon Database (Default):
DATABASE_URL="postgresql://neondb_owner:npg_zLShXHR5I0bE@ep-super-tooth-ap7dov0r.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"

# 2. NextAuth Configuration
AUTH_SECRET="f9b4c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"
NEXTAUTH_SECRET="f9b4c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9"
NEXTAUTH_URL="http://localhost:3000"

# 3. Encryption Master Key (32-byte hexadecimal string)
ENCRYPTION_MASTER_KEY="a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"

# 4. Optional OAuth Providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

> [!NOTE]
> If you want a completely fresh and local database instead of using the shared Neon PostgreSQL, you can install PostgreSQL locally, create a new database (e.g., `cryptoshield`), and change `DATABASE_URL` to point to it (e.g., `postgresql://postgres:YOUR_PASSWORD@localhost:5432/cryptoshield`).

---

## 🗄️ Step 3: Initialize Database & Prisma Client
Prisma acts as the ORM to interact with the database. Initialize and synchronize the database schema by running:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Sync Schema to Database:**
   ```bash
   npx prisma db push
   ```

3. **Seed Default Accounts & Sample Data:**
   Run the database seed script to create default test users and mock logs:
   ```bash
   npx prisma db seed
   ```

---

## 👤 Step 4: Login Credentials
Once the database has been seeded, you can sign in using these default credentials:

* **Standard User Account:**
  * **Email:** `user@cryptoshield.com`
  * **Password:** `password123`
* **Admin Account:**
  * **Email:** `admin@cryptoshield.com`
  * **Password:** `admin123`

---

## 💻 Step 5: Start the Application
Run the Next.js development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📁 How the File Vault Works

### File Upload & Encryption
1. When you select a file and enter an encryption password in the vault, the file is encrypted locally on the server using **AES-256-GCM**.
2. The encrypted file is saved to the local `uploads/` directory inside the project root.
3. The cryptographic metadata (salt, IV) and file statistics are stored in the database.

### File Decryption & Download
1. To download and decrypt a file, click the **key icon** in the file list and enter the password you used during upload.
2. The server reads the encrypted file from the local `uploads/` directory, decrypts it, and streams the original file to your browser.

> [!IMPORTANT]
> The database only keeps track of file metadata. The actual encrypted `.enc` files live locally on disk in the project's `uploads/` folder. If you migrate databases or change machines, the `uploads/` folder must contain the physical files, otherwise downloads will return a "file not found" error.

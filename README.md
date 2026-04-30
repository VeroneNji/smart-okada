# 🏍️ UrbanRide Network (Smart Okada Rental System)

A production-ready motorbike rental system built with **React Native (Expo)** and **Supabase**. This system is designed for safe, atomic, and secure ride bookings, specifically tailored for the "Okada" (motorcycle taxi) market.

---

## 🏗️ System Architecture & Tech Stack

### Languages Used
- **TypeScript**: Used for the entire frontend application logic, type definitions, and service layers.
- **SQL (PostgreSQL/PLpgSQL)**: Powers the backend database, security policies (RLS), and atomic business logic (RPC functions).
- **JavaScript**: Used for configuration files (ESLint, scripts).

### Technology Stack
- **Frontend**: 
  - **Framework**: React Native (Expo SDK 54)
  - **Navigation**: Expo Router (File-based)
  - **UI Components**: React Native Paper (Material Design)
  - **Icons**: Lucide React Native
  - **State Management**: React Hooks & Custom Service Layers
- **Backend (BaaS)**: 
  - **Supabase**: Auth, PostgreSQL Database, Storage, and Real-time notifications.
  - **Security**: Row Level Security (RLS) ensures data isolation.
  - **Atomicity**: PLpgSQL functions (RPC) handle sensitive operations like payments and ride starts.

---

## 🚀 Key Features

- **Secure Wallet System**: Atomic fund deductions and deposits via PostgreSQL RPC functions to prevent race conditions.
- **Robust Ride Flow**: Integrated station and bike selection with automatic 6-digit activation code generation.
- **Notification System**: Real-time feedback for deposits, ride starts, and ride completions.
- **Admin Dashboard**: Comprehensive management of bikes, stations, and ride activation codes.
- **Strict Security**: RLS enforced on all tables; users can only access their own data.
- **Type-Safe Architecture**: Clean service layers and custom hooks for maintainable code.

---

## 🛠️ Core Business Logic (Atomic Operations)

To ensure data integrity, the system moves critical logic to the database layer using **RPC Functions**:
- `deposit_funds`: Validates amounts and updates wallet balance + transaction log + notifications.
- `process_ride_payment`: Atomically checks balance, reserves bike, deducts funds, creates ride, and generates an activation code.
- `complete_ride`: Ends the ride, calculates distance, updates bike status/location, and notifies the user.

---

## 📁 Project Structure

```text
smart-okada/
├── app/                  # Expo Router screens (Main Entry)
│   ├── (auth)/           # Authentication (Login, Signup)
│   ├── (tabs)/           # Main App Tabs (Dashboard, Wallet, Trips, Profile)
│   ├── admin/            # Administrative screens (Management tools)
│   └── _layout.tsx       # Root layout with auth state management
├── components/           # Reusable UI components (Modals, Cards, Buttons)
├── constants/            # App-wide constants (Colors, Theme, API)
├── database/             # PostgreSQL schema, RLS policies, and RPC functions
├── hooks/                # Custom React hooks (useAuth, useWallet, useRides)
├── services/             # Supabase service layer (Auth, Wallet, Ride, Admin)
├── types/                # TypeScript interfaces/types for DB and Entities
└── utils/                # Formatting and helper utilities (Date, Currency)
```

---

## 🗄️ Database Schema Overview

The system relies on a relational schema in Supabase:
1.  **`profiles`**: User profiles linked to Supabase Auth.
2.  **`wallets` & `wallet_transactions`**: Financial tracking.
3.  **`bike_stations`**: Physical locations where bikes are parked.
4.  **`bikes`**: Inventory of motorcycles with status (`available`, `in_use`, `maintenance`).
5.  **`rides`**: Logs of all rental sessions.
6.  **`activation_codes`**: Temporary codes required to unlock/start a bike.
7.  **`notifications`**: User alerts for system activity.

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (or an emulator)
- A [Supabase](https://supabase.com) account

### 2. Database Setup
1. Create a new Supabase project.
2. In the **SQL Editor**, execute the files in `database/` in the following order:
   - `00_initial_schema.sql`
   - `01_rls_policies.sql`
   - `02_seed_data.sql` (optional, for testing)
   - `03_public_functions.sql`
   - `04_admin_roles.sql`
   - `05_notifications.sql`

### 3. Environment Configuration
1. Create a `.env` file in the root directory.
2. Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 4. Installation & Launch
```bash
# Install dependencies
npm install

# Start the Expo development server
npm run start
```

---

## 🔐 Security Model

This system uses a **Zero-Trust** approach on the frontend:
- **RLS**: The frontend never has permission to update balances or ride statuses directly.
- **RPC**: All data-modifying operations are performed through `SECURITY DEFINER` functions, which act with elevated permissions but perform strict internal validation (e.g., checking if the user has enough money).

---

## 📄 License & Documentation
For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

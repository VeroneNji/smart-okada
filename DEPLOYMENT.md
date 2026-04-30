# UrbanRide Network - Deployment & Production Readiness Guide

This guide outlines the steps required to move the UrbanRide Network (Smart Okada Rental System) from development to production.

## 1. Database Production Checklist (Supabase)

### Row Level Security (RLS)
- [x] Ensure `profiles`, `wallets`, `wallet_transactions`, `bike_stations`, `bikes`, `rides`, and `activation_codes` have RLS enabled.
- [x] Verify that no table allows "Public" (anon) `INSERT`, `UPDATE`, or `DELETE` access.
- [x] Confirm that wallet and ride modifications are restricted to the secure RPC functions (`SECURITY DEFINER`).

### Indexing for Scale
The current schema includes initial indexes. For production scale (10,000+ users), ensure the following are indexed:
- `rides(user_id, status)`
- `wallet_transactions(wallet_id, created_at)`
- `bikes(station_id, status)`

### Automated Backups
- Supabase provides automated backups. Ensure you are on a plan that meets your data retention requirements (Pro plan recommended for production).

---

## 2. Frontend Production Checklist (Expo)

### Environment Variables
- Ensure `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in your CI/CD environment (e.g., Expo Application Services - EAS).

### App Configuration (`app.json`)
- Update `name`, `slug`, `version`, and `bundleIdentifier` (iOS) / `package` (Android) to match your brand.
- Set up your app icons and splash screens in the `assets` folder.

### Performance Optimization
- **Image Optimization**: Use the `expo-image` component for better caching and performance.
- **Bundle Size**: Run `npx expo export` to inspect the bundle size and ensure no large unnecessary dependencies are included.

---

## 3. Deployment Strategy

### Backend (Supabase)
1. **Migration Management**: Use the Supabase CLI to manage migrations instead of manually running SQL in the dashboard.
   ```bash
   supabase db pull
   supabase migration new initial_schema
   ```
2. **Branching**: Use Supabase branching to test schema changes in a staging environment before pushing to production.

### Frontend (Expo + EAS)
1. **Build with EAS**: Use Expo Application Services (EAS) for building and submitting to the stores.
   ```bash
   eas build --platform all
   ```
2. **Over-the-Air (OTA) Updates**: Configure `expo-updates` to push bug fixes directly to users without a full app store submission.
   ```bash
   eas update --branch production
   ```

## 4. Scalability Considerations

- **PostgreSQL Connection Pooling**: Supabase uses PgBouncer. Ensure your app logic doesn't hold connections open longer than necessary.
- **Edge Functions**: For complex business logic or third-party integrations (like real Mobile Money APIs), move them to Supabase Edge Functions to reduce latency and improve security.

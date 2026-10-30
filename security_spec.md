# Security Specification: FF BATTLE ARENA (Firestore ABAC)

## 1. Data Invariants
1. A user can only modify their own profile data (e.g. username, avatar, in-game name) and CANNOT self-assign the admin role or modify wallet balances (`depositBalance`, `winningBalance`).
2. Wallet balance updates, transaction creation, and winner prize distributions are strictly privileged or server/admin-controlled.
3. Tournament creation, status transition, and room ID/pass reveal can only be written by authenticated administrators.
4. Players can only register into a tournament slot if they are authenticated and their user ID matches the slot record.
5. Withdrawal requests can only be created by the account owner, and only administrators can approve or reject them.
6. Admin role authorization is derived exclusively from existence in `/admins/$(request.auth.uid)` or verified admin email `d44945857@gmail.com`.

## 2. The Dirty Dozen Attack Payloads
1. **Self-Promotion to Admin**: Non-admin user sending `{ role: 'admin' }` to their user doc.
2. **Wallet Balance Manipulation**: Non-admin user directly increasing `{ depositBalance: 999999 }`.
3. **Room Credential Hijack**: Regular player modifying `/tournaments/{tournamentId}` with fake room credentials.
4. **Impersonated Slot Registration**: Player attempting to register someone else's UID into a tournament slot.
5. **Withdrawal Auto-Approval**: User creating a withdrawal with `{ status: 'APPROVED' }`.
6. **Cross-User Withdrawal Read**: Normal user trying to list all other players' bank/UPI withdrawals.
7. **Tournament Deletion Spoof**: Non-admin user deleting a tournament document.
8. **Spoofed User Creation**: User creating a user document with an ID different from their authenticated UID.
9. **Fake Tournament Win Claim**: Normal user writing to `/transactions` with `{ type: 'PRIZE_WIN' }`.
10. **Malicious Giant Payload (Denial of Wallet)**: Injecting 1MB payload into `username` or `rules`.
11. **Pulsing / Ghost Status Overwrite**: Overwriting a completed tournament back to `upcoming`.
12. **Unverified Email Spoofing**: Admin action attempted by unverified email token.

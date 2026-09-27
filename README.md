# Live Price Tracker (Next.js + Firebase)

A tiny real-time price tracker:

- **`/admin`** — enter a product name and price, click "Save price".
- **`/`** — the public page, which updates the instant a price changes, with no refresh (via Firestore's `onSnapshot` listener).

Entering the *same* product name again updates its existing price (rather than creating a duplicate), since each product's Firestore document id is derived from its name.

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. In the project, go to **Build → Firestore Database → Create database** (start in test mode for local dev, or production mode and use `firestore.rules` below).
3. Go to **Project settings → General → Your apps → Web app (</>)** and register an app. Copy the config values shown.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Paste the values from the Firebase console into `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## 3. Install and run

```bash
npm install
npm run dev
```

- Open `http://localhost:3000/admin` in one tab and `http://localhost:3000` in another.
- Add/update a price in Admin and watch it update live on the other tab.

## 4. Firestore security rules

`firestore.rules` is included: public read, authenticated-only write. For a quick local test without wiring up auth, you can temporarily set the database to test mode in the Firebase console (`allow read, write: if true;`) — just remember to lock it back down before sharing the app publicly, since anyone with the rules open could overwrite prices.

If you want the Admin page properly protected, add Firebase Authentication (e.g. email/password or Google sign-in) and update `firestore.rules` to check `request.auth != null` (already scaffolded) plus a wrapper in `app/admin/page.js` that redirects unauthenticated users.

## How the live updates work

- `app/page.js` and `app/admin/page.js` both subscribe to the `products` Firestore collection with `onSnapshot`.
- Firestore pushes changes to every subscribed client the moment a document is written — no polling, no manual refresh.
- `app/admin/page.js` writes with `setDoc(doc(db, "products", slug(name)), {...}, { merge: true })`, so saving the same product name updates its price in place.

## Project structure

```
app/
  layout.js        Root layout + nav
  page.js           Public live price list
  admin/page.js     Add/update/delete prices
  globals.css
lib/
  firebase.js       Firebase app + Firestore init
  slug.js           Product name -> doc id helper
firestore.rules
.env.local.example
```
## Snapshots

<img width="1728" height="963" alt="image" src="https://github.com/user-attachments/assets/cbf7e788-e4b6-4190-9a52-1760fce4c1f9" />

##
<img width="1598" height="850" alt="image" src="https://github.com/user-attachments/assets/5bfb890d-b76d-4c5c-a897-37df4d973834" />


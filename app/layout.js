import "./globals.css";

export const metadata = {
  title: "Live Price Tracker",
  description: "Real-time product price tracker powered by Firebase Firestore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <a href="/">Live Prices</a>
          <a href="/admin">Admin</a>
        </nav>
        {children}
      </body>
    </html>
  );
}

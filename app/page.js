"use client";

import { useEffect, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevPrices = useRef({}); // id -> last price, used to flash changed rows

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));

    // onSnapshot fires immediately with current data, then again every time
    // any document in the "products" collection changes — that's the "live" part.
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(rows);
        setLoading(false);
      },
      (error) => {
        console.error("Live price subscription error:", error);
        setLoading(false);
      }
    );

    // Always clean up the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  return (
    <div className="container">
      <h1>
        <span className="live-dot" />
        Live Prices
      </h1>
      <p className="subtitle">
        Updates instantly whenever a price is added or changed in Admin — no refresh needed.
      </p>

      <div className="card">
        {loading ? (
          <p className="empty">Loading…</p>
        ) : products.length === 0 ? (
          <p className="empty">No products yet. Add one from the Admin page.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Last updated</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <PriceRow key={p.id} product={p} prevPrices={prevPrices} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PriceRow({ product, prevPrices }) {
  const last = prevPrices.current[product.id];
  const changed = last !== undefined && last !== product.price;
  prevPrices.current[product.id] = product.price;

  const updatedAt = product.updatedAt?.toDate
    ? product.updatedAt.toDate().toLocaleString()
    : "—";

  return (
    <tr>
      <td>{product.name}</td>
      <td className={`price${changed ? " flash" : ""}`}>
        ${Number(product.price).toFixed(2)}
      </td>
      <td>{updatedAt}</td>
    </tr>
  );
}

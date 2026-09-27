"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/slug";

export default function AdminPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState(null); // { type: "ok" | "err", message }
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    const trimmedName = name.trim();
    const numericPrice = parseFloat(price);

    if (!trimmedName) {
      setStatus({ type: "err", message: "Enter a product name." });
      return;
    }
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      setStatus({ type: "err", message: "Enter a valid non-negative price." });
      return;
    }

    setSaving(true);
    try {
      const id = slugify(trimmedName);
      // setDoc with a deterministic id (from the product name) means submitting
      // the same product name again UPDATES its price doc rather than creating
      // a duplicate — that update is what the live page picks up in real time.
      await setDoc(
        doc(db, "products", id),
        {
          name: trimmedName,
          price: numericPrice,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setStatus({ type: "ok", message: `Saved "${trimmedName}" at $${numericPrice.toFixed(2)}.` });
      setName("");
      setPrice("");
    } catch (err) {
      console.error(err);
      setStatus({ type: "err", message: "Failed to save. Check your Firebase config and Firestore rules." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.error(err);
    }
  }

  function editProduct(p) {
    setName(p.name);
    setPrice(String(p.price));
    setStatus(null);
  }

  return (
    <div className="container">
      <h1>Admin</h1>
      <p className="subtitle">
        Add a new product or update an existing one — changes appear instantly on the Live Prices page.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="Product name (e.g. Coffee Beans 1kg)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Price (e.g. 12.99)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save price"}
            </button>
          </div>
        </form>
        {status && <p className={`status ${status.type}`}>{status.message}</p>}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        {products.length === 0 ? (
          <p className="empty">No products yet — add one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td className="price">${Number(p.price).toFixed(2)}</td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="edit-btn" onClick={() => editProduct(p)}>
                      Edit
                    </button>
                    <button type="button" className="edit-btn" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

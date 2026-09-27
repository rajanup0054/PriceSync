// Turns a product name into a stable, safe Firestore document id.
// Using the name (rather than an auto id) means re-entering the same
// product name updates its existing price doc instead of creating a duplicate.
export function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Reseñas de producto persistidas en localStorage (sin backend).
// Clave: multicatalogo_reviews_{productId}

export interface Review {
  id: string;
  productId: number;
  autor: string;
  rating: number; // 1-5
  texto: string;
  fecha: string;
}

const key = (productId: number) => `multicatalogo_reviews_${productId}`;

export function getReviews(productId: number): Review[] {
  try {
    const raw = localStorage.getItem(key(productId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as Review[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function addReview(
  productId: number,
  data: { autor: string; rating: number; texto: string }
): Review {
  const review: Review = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    productId,
    autor: data.autor.trim() || "Cliente",
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    texto: data.texto.trim(),
    fecha: new Date().toISOString(),
  };
  const list = getReviews(productId);
  list.unshift(review);
  localStorage.setItem(key(productId), JSON.stringify(list.slice(0, 50)));
  return review;
}

export function averageRating(productId: number): { avg: number; count: number } {
  const list = getReviews(productId);
  if (list.length === 0) return { avg: 0, count: 0 };
  const sum = list.reduce((a, r) => a + r.rating, 0);
  return { avg: Math.round((sum / list.length) * 10) / 10, count: list.length };
}

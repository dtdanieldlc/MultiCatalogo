// Detalle + reseñas + comparar + stock
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductoById, ApiError } from "../services/productosService";
import type { Producto } from "../data/productos";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { useAuth } from "../context/AuthContext";
import {
  addReview,
  averageRating,
  getReviews,
  type Review,
} from "../services/reviewsService";
import { Alert, Icon, PageLoading, money } from "./ui";

const DetalleProducto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle, has } = useCompare();
  const { user } = useAuth();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imagenActiva, setImagenActiva] = useState(0);
  const [lightboxAbierto, setLightboxAbierto] = useState(false);
  const [agregado, setAgregado] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState("");
  const [reviewOk, setReviewOk] = useState("");

  useEffect(() => {
    let activo = true;
    setLoading(true);
    setError("");
    getProductoById(id ?? "")
      .then((data) => {
        if (!activo) return;
        setProducto(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!activo) return;
        setProducto(null);
        setError(err instanceof ApiError ? err.message : "Error inesperado");
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  useEffect(() => {
    if (producto) setReviews(getReviews(producto.id));
  }, [producto]);

  useEffect(() => {
    if (!lightboxAbierto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxAbierto(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxAbierto]);

  if (loading) return <PageLoading label="Cargando producto…" />;

  if (!producto) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Alert>{error || "Producto no encontrado."}</Alert>
        <Link to="/catalogo" className="btn btn-dark">
          <Icon name="arrow-left" className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const imagenes = [producto.img, ...(producto.galeria ?? [])].filter(Boolean);
  const sinStock = typeof producto.stock === "number" && producto.stock <= 0;
  const { avg, count } = averageRating(producto.id);
  const enComparar = has(producto.id);

  const handleAddToCart = () => {
    if (sinStock) return;
    addToCart(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  const handleReview = (e: FormEvent) => {
    e.preventDefault();
    if (!texto.trim()) return;
    addReview(producto.id, {
      autor: user?.email?.split("@")[0] ?? "Cliente",
      rating,
      texto,
    });
    setReviews(getReviews(producto.id));
    setTexto("");
    setRating(5);
    setReviewOk("¡Gracias por tu reseña!");
    setTimeout(() => setReviewOk(""), 2500);
  };

  const handlePrev = () =>
    setImagenActiva((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  const handleNext = () =>
    setImagenActiva((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost -ml-3 mb-6">
        <Icon name="arrow-left" className="h-4 w-4" /> Volver
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <div>
          <button
            type="button"
            onClick={() => setLightboxAbierto(true)}
            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-sand"
            aria-label="Ampliar imagen"
          >
            <img
              src={imagenes[imagenActiva]}
              alt={producto.nombre}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1571781926291-c77df809dbe5?w=600&h=600&fit=crop";
              }}
            />
          </button>
          {imagenes.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {imagenes.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setImagenActiva(idx)}
                  aria-label={`Ver imagen ${idx + 1}`}
                  className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                    idx === imagenActiva
                      ? "border-brand-600"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:py-4">
          <p className="eyebrow">{producto.categoria}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {producto.nombre}
          </h1>
          {count > 0 && (
            <p className="mt-2 text-sm text-ink-500">
              <span className="font-semibold text-gold-600">★ {avg}</span>
              {" · "}
              {count} reseña{count === 1 ? "" : "s"}
            </p>
          )}
          <p className="mt-5 font-display text-3xl text-brand-700">
            {money(producto.precio)}
          </p>
          {typeof producto.stock === "number" && (
            <p
              className={`mt-2 text-sm font-medium ${
                sinStock ? "text-red-600" : "text-leaf-700"
              }`}
            >
              {sinStock ? "Agotado" : `${producto.stock} en stock`}
            </p>
          )}
          <p className="mt-6 max-w-prose leading-relaxed text-ink-600">
            {producto.descripcion}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={sinStock}
              className={`btn flex-1 px-10 py-4 ${
                agregado ? "bg-leaf-600 text-white" : "btn-primary"
              } disabled:opacity-40`}
            >
              {agregado ? (
                <>
                  <Icon name="check" className="h-4 w-4" /> Añadido
                </>
              ) : (
                <>
                  <Icon name="bag" className="h-4 w-4" /> Añadir al carrito
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => toggle(producto)}
              className={`btn flex-1 px-6 py-4 ${
                enComparar ? "btn-dark" : "btn-outline"
              }`}
            >
              <Icon name="grid" className="h-4 w-4" />
              {enComparar ? "En comparador" : "Comparar"}
            </button>
          </div>
        </div>
      </div>

      {/* Reseñas */}
      <section className="mt-16 border-t border-ink-100 pt-10">
        <h2 className="font-display text-2xl font-semibold">
          Reseñas de clientes
        </h2>
        <form onSubmit={handleReview} className="card mt-6 max-w-xl space-y-4 p-5">
          <p className="text-sm font-medium text-ink-700">Escribe tu opinión</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${
                  n <= rating ? "text-gold-500" : "text-ink-200"
                }`}
                aria-label={`${n} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className="input"
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="¿Qué te pareció el producto?"
            required
          />
          <button type="submit" className="btn btn-primary">
            Publicar reseña
          </button>
          {reviewOk && <p className="text-sm text-leaf-700">{reviewOk}</p>}
        </form>

        <ul className="mt-8 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-500">
              Sé el primero en opinar sobre este producto.
            </p>
          ) : (
            reviews.map((r) => (
              <li key={r.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-ink-900">{r.autor}</p>
                  <span className="text-sm text-gold-600">
                    {"★".repeat(r.rating)}
                    <span className="text-ink-200">
                      {"★".repeat(5 - r.rating)}
                    </span>
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-600">{r.texto}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {new Date(r.fecha).toLocaleDateString()}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      {lightboxAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95"
          onClick={() => setLightboxAbierto(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            onClick={() => setLightboxAbierto(false)}
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-3 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:left-10"
            aria-label="Anterior"
          >
            <Icon name="arrow-left" className="h-6 w-6" />
          </button>
          <img
            src={imagenes[imagenActiva]}
            alt={producto.nombre}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[85vw] rounded-2xl object-contain"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:right-10"
            aria-label="Siguiente"
          >
            <Icon name="arrow-right" className="h-6 w-6" />
          </button>
          <p className="absolute bottom-6 text-sm text-white/70">
            {imagenActiva + 1} / {imagenes.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;

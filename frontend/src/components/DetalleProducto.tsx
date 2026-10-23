// src/components/DetalleProducto.tsx
// Detalle de producto con ruta dinámica (Tema 5):
// - useParams para leer el :id de la URL (/producto/:id)
// - Galería de imágenes con lightbox a pantalla completa
// - Estados de carga, error y "no encontrado"
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProductoById, ApiError } from '../services/productosService';
import type { Producto } from '../data/productos';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { Alert, Icon, PageLoading, money } from './ui';


const DetalleProducto = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [imagenActiva, setImagenActiva] = useState<number>(0);
  const [lightboxAbierto, setLightboxAbierto] = useState<boolean>(false);
  const [agregado, setAgregado] = useState<boolean>(false);
  const [shareOk, setShareOk] = useState(false);
  const { isFavorite, toggle: toggleFav } = useFavorites();

  useEffect(() => {
    // El id viaja tal cual a la API; ella responde 400 (id inválido) o 404 (no existe).
    // La bandera "activo" evita actualizar estado si el componente se desmonta.
    let activo = true;
    setLoading(true);
    setError('');
    getProductoById(id ?? '')
      .then((data) => {
        if (!activo) return;
        setProducto(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!activo) return;
        setProducto(null);
        setError(err instanceof ApiError ? err.message : 'Error inesperado');
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [id]);

  // Cerrar el lightbox con la tecla Escape
  useEffect(() => {
    if (!lightboxAbierto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxAbierto(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxAbierto]);

  if (loading) {
    return <PageLoading label="Cargando producto…" />;
  }

  if (!producto) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Alert>{error || 'Producto no encontrado.'}</Alert>
        <Link to="/catalogo" className="btn btn-dark">
          <Icon name="arrow-left" className="h-4 w-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  // Todas las imágenes de la galería: principal + adicionales
  const imagenes = [producto.img, ...producto.galeria];

  const sinStock = typeof producto.stock === "number" && producto.stock <= 0;
  const fav = isFavorite(producto.id);

  const handleAddToCart = () => {
    if (sinStock) return;
    addToCart(producto);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const data = { title: producto.nombre, text: producto.descripcion, url };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setShareOk(true);
        setTimeout(() => setShareOk(false), 2000);
      }
    } catch {
      /* usuario canceló share */
    }
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
        {/* ===== GALERÍA ===== */}
        <div>
          <button
            type="button"
            onClick={() => setLightboxAbierto(true)}
            className="block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl bg-sand"
            aria-label="Ampliar imagen"
          >
            <img src={imagenes[imagenActiva]} alt={producto.nombre} className="h-full w-full object-cover" />
          </button>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {imagenes.map((img, idx) => (
              <button
                key={img}
                onClick={() => setImagenActiva(idx)}
                aria-label={`Ver imagen ${idx + 1}`}
                className={`aspect-square overflow-hidden rounded-xl border-2 transition ${
                  idx === imagenActiva ? "border-brand-600" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ===== INFORMACIÓN ===== */}
        <div className="lg:py-4">
          <p className="eyebrow">{producto.categoria}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            {producto.nombre}
          </h1>
          <p className="mt-5 font-display text-3xl text-brand-700">{money(producto.precio)}</p>
          <p className="mt-6 max-w-prose leading-relaxed text-ink-600">{producto.descripcion}</p>

          {typeof producto.stock === "number" && (
            <p className={`mt-4 text-sm font-medium ${sinStock ? "text-brand-700" : producto.stock <= 10 ? "text-gold-700" : "text-ink-500"}`}>
              {sinStock ? "Producto agotado" : producto.stock <= 10 ? `Quedan solo ${producto.stock} unidades` : `${producto.stock} en stock`}
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={sinStock}
              className={`btn w-full px-10 py-4 sm:w-auto ${
                agregado ? "bg-leaf-600 text-white" : sinStock ? "cursor-not-allowed bg-ink-300 text-white" : "btn-primary"
              }`}
            >
              {agregado ? (
                <><Icon name="check" className="h-4 w-4" /> Añadido al carrito</>
              ) : sinStock ? (
                "Agotado"
              ) : (
                <><Icon name="bag" className="h-4 w-4" /> Añadir al carrito</>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleFav(producto)}
              aria-pressed={fav}
              aria-label={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
              className={`btn h-12 w-12 rounded-full p-0 ${
                fav ? "bg-brand-600 text-white hover:bg-brand-700" : "btn-ghost border border-ink-200"
              }`}
            >
              <Icon name="heart" className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartir producto"
              className="btn btn-ghost h-12 w-12 rounded-full border border-ink-200 p-0"
            >
              <Icon name={shareOk ? "check" : "share"} className="h-5 w-5" />
            </button>
          </div>
          {shareOk && (
            <p className="mt-2 text-sm text-leaf-700">Enlace copiado al portapapeles</p>
          )}
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxAbierto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95"
          onClick={() => setLightboxAbierto(false)}
        >
          <button
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10"
            onClick={() => setLightboxAbierto(false)}
            aria-label="Cerrar"
          >
            <Icon name="x" className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
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
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-3 flex h-12 w-12 items-center justify-center rounded-full text-white transition hover:bg-white/10 md:right-10"
            aria-label="Siguiente"
          >
            <Icon name="arrow-right" className="h-6 w-6" />
          </button>
          <p className="absolute bottom-6 text-sm text-white/70">{imagenActiva + 1} / {imagenes.length}</p>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;

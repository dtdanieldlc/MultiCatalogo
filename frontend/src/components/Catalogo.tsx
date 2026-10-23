// Catálogo profesional: búsqueda, categoría, precio, stock, orden y comparar
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useCompare } from "../context/CompareContext";
import { getProductos } from "../services/productosService";
import { categorias, type Producto } from "../data/productos";
import ProductCard from "./ProductCard";
import { EmptyState, Icon, PageHeader, ProductGridSkeleton, money } from "./ui";

type Orden = "relevancia" | "precio-asc" | "precio-desc" | "nombre" | "stock";

const Catalogo = () => {
  const { addToCart } = useCart();
  const { items: compareItems, clear: clearCompare } = useCompare();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState(searchParams.get("q") ?? "");
  const [categoria, setCategoria] = useState(
    searchParams.get("categoria") ?? "Todas"
  );
  const [precioMin, setPrecioMin] = useState(searchParams.get("min") ?? "");
  const [precioMax, setPrecioMax] = useState(searchParams.get("max") ?? "");
  const [soloStock, setSoloStock] = useState(
    searchParams.get("stock") === "1"
  );
  const [orden, setOrden] = useState<Orden>(
    (searchParams.get("orden") as Orden) || "relevancia"
  );

  useEffect(() => {
    getProductos()
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const syncParams = (next: {
    q?: string;
    categoria?: string;
    min?: string;
    max?: string;
    stock?: boolean;
    orden?: Orden;
  }) => {
    const p = new URLSearchParams();
    const q = next.q ?? busqueda;
    const cat = next.categoria ?? categoria;
    const min = next.min ?? precioMin;
    const max = next.max ?? precioMax;
    const stock = next.stock ?? soloStock;
    const ord = next.orden ?? orden;
    if (q.trim()) p.set("q", q.trim());
    if (cat && cat !== "Todas") p.set("categoria", cat);
    if (min) p.set("min", min);
    if (max) p.set("max", max);
    if (stock) p.set("stock", "1");
    if (ord !== "relevancia") p.set("orden", ord);
    setSearchParams(p);
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const min = precioMin ? Number(precioMin) : null;
    const max = precioMax ? Number(precioMax) : null;

    let list = productos.filter((prod) => {
      const coincideCategoria =
        categoria === "Todas" ||
        prod.categoria.toLowerCase() === categoria.toLowerCase();
      const coincideTexto =
        texto === "" ||
        prod.nombre.toLowerCase().includes(texto) ||
        prod.descripcion.toLowerCase().includes(texto);
      const coincideMin = min === null || Number.isNaN(min) || prod.precio >= min;
      const coincideMax = max === null || Number.isNaN(max) || prod.precio <= max;
      const coincideStock =
        !soloStock || (typeof prod.stock === "number" ? prod.stock > 0 : true);
      return (
        coincideCategoria &&
        coincideTexto &&
        coincideMin &&
        coincideMax &&
        coincideStock
      );
    });

    switch (orden) {
      case "precio-asc":
        list = [...list].sort((a, b) => a.precio - b.precio);
        break;
      case "precio-desc":
        list = [...list].sort((a, b) => b.precio - a.precio);
        break;
      case "nombre":
        list = [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case "stock":
        list = [...list].sort(
          (a, b) => (b.stock ?? 0) - (a.stock ?? 0)
        );
        break;
      default:
        break;
    }
    return list;
  }, [productos, busqueda, categoria, precioMin, precioMax, soloStock, orden]);

  const limpiar = () => {
    setBusqueda("");
    setCategoria("Todas");
    setPrecioMin("");
    setPrecioMax("");
    setSoloStock(false);
    setOrden("relevancia");
    setSearchParams({});
  };

  const precios = useMemo(() => {
    if (productos.length === 0) return { min: 0, max: 100 };
    const ps = productos.map((p) => p.precio);
    return { min: Math.floor(Math.min(...ps)), max: Math.ceil(Math.max(...ps)) };
  }, [productos]);

  return (
    <div>
      <PageHeader
        eyebrow="Colección"
        title="Catálogo"
        subtitle={
          loading
            ? "Cargando productos…"
            : `${productosFiltrados.length} producto(s) · ${money(precios.min)} – ${money(precios.max)}`
        }
      />

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              syncParams({ q: e.target.value });
            }}
            placeholder="Buscar por nombre o descripción…"
            aria-label="Buscar productos"
            className="input rounded-full pl-12"
          />
        </div>

        <div
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          role="tablist"
          aria-label="Categorías"
        >
          {["Todas", ...categorias].map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoria === cat}
              onClick={() => {
                setCategoria(cat);
                syncParams({ categoria: cat });
              }}
              className={`chip ${categoria === cat ? "chip-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtros avanzados */}
        <div className="card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-6">
          <div>
            <label className="label" htmlFor="f-min">
              Precio mín.
            </label>
            <input
              id="f-min"
              type="number"
              min={0}
              step={1}
              placeholder={String(precios.min)}
              value={precioMin}
              onChange={(e) => {
                setPrecioMin(e.target.value);
                syncParams({ min: e.target.value });
              }}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-max">
              Precio máx.
            </label>
            <input
              id="f-max"
              type="number"
              min={0}
              step={1}
              placeholder={String(precios.max)}
              value={precioMax}
              onChange={(e) => {
                setPrecioMax(e.target.value);
                syncParams({ max: e.target.value });
              }}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="f-orden">
              Ordenar
            </label>
            <select
              id="f-orden"
              className="input"
              value={orden}
              onChange={(e) => {
                const v = e.target.value as Orden;
                setOrden(v);
                syncParams({ orden: v });
              }}
            >
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A–Z</option>
              <option value="stock">Mayor stock</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={soloStock}
                onChange={(e) => {
                  setSoloStock(e.target.checked);
                  syncParams({ stock: e.target.checked });
                }}
                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              Solo con stock
            </label>
          </div>
          <div className="col-span-2 flex items-end gap-2 sm:col-span-1 lg:col-span-2">
            <button type="button" onClick={limpiar} className="btn btn-outline w-full">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : productosFiltrados.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sin resultados"
          text="No hay productos que coincidan con tus filtros."
          action={
            <button onClick={limpiar} className="btn btn-dark">
              Limpiar filtros
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {productosFiltrados.map((prod) => (
            <ProductCard key={prod.id} prod={prod} onAdd={addToCart} />
          ))}
        </div>
      )}

      {/* Barra flotante de comparación */}
      {compareItems.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-[min(100%-2rem,36rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-ink-100 bg-white/95 p-3 shadow-lift backdrop-blur">
          <div className="flex -space-x-2">
            {compareItems.map((p) => (
              <img
                key={p.id}
                src={p.img}
                alt=""
                className="h-10 w-10 rounded-lg border-2 border-white object-cover"
              />
            ))}
          </div>
          <p className="flex-1 text-sm font-medium text-ink-800">
            {compareItems.length}/3 para comparar
          </p>
          <Link to="/comparar" className="btn btn-primary btn-sm">
            Comparar
          </Link>
          <button
            type="button"
            onClick={clearCompare}
            className="btn btn-outline btn-sm"
            aria-label="Vaciar comparador"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalogo;

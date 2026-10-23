// src/components/Catalogo.tsx
// Catálogo con búsqueda y filtros por categoría (useMemo + query string compartible).
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductos } from '../services/productosService';
import { categorias, type Producto } from '../data/productos';
import ProductCard from './ProductCard';
import { EmptyState, Icon, PageHeader, ProductGridSkeleton } from './ui';

const Catalogo = () => {
  const { addToCart } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoria, setCategoria] = useState<string>(searchParams.get("categoria") ?? "Todas");

  useEffect(() => {
    getProductos()
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((prod) => {
      const coincideCategoria = categoria === "Todas" || prod.categoria === categoria;
      const coincideTexto =
        texto === "" ||
        prod.nombre.toLowerCase().includes(texto) ||
        prod.descripcion.toLowerCase().includes(texto);
      return coincideCategoria && coincideTexto;
    });
  }, [productos, busqueda, categoria]);

  const handleCategoriaChange = (value: string) => {
    setCategoria(value);
    if (value === "Todas") {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: value });
    }
  };

  const limpiar = () => {
    setBusqueda("");
    setCategoria("Todas");
    setSearchParams({});
  };

  return (
    <div>
      <PageHeader
        eyebrow="Colección"
        title="Catálogo"
        subtitle={loading ? "Cargando productos…" : `${productosFiltrados.length} producto(s) encontrado(s)`}
      />

      {/* Búsqueda + categorías */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o descripción…"
            aria-label="Buscar productos"
            className="input rounded-full pl-12"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Categorías">
          {["Todas", ...categorias].map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoria === cat}
              onClick={() => handleCategoriaChange(cat)}
              className={`chip ${categoria === cat ? "chip-active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton />
      ) : productosFiltrados.length === 0 ? (
        <EmptyState
          icon="search"
          title="Sin resultados"
          text="No hay productos que coincidan con tu búsqueda."
          action={<button onClick={limpiar} className="btn btn-dark">Limpiar filtros</button>}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {productosFiltrados.map((prod) => (
            <ProductCard key={prod.id} prod={prod} onAdd={addToCart} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;

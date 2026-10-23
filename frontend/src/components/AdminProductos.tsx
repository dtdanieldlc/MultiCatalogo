// /admin/productos — CRUD admin (borrado lógico)
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '../services/http';
import { Alert, EmptyState, Icon, PageHeader, PageLoading, money } from './ui';

interface ProductoAdmin {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  img: string;
  galeria: string[];
  stock: number;
  activo: boolean;
}

interface Pagina {
  data: ProductoAdmin[];
  page: number;
  limit: number;
  total: number;
}

const vacio = {
  nombre: '',
  descripcion: '',
  precio: 0,
  categoria: '',
  img: 'https://picsum.photos/seed/nuevo/600',
  stock: 100,
};

const AdminProductos = () => {
  const [pagina, setPagina] = useState<Pagina | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(vacio);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async (busqueda = q) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (busqueda) params.set('q', busqueda);
      const data = await apiFetch<Pagina>(`/api/admin/productos?${params}`);
      setPagina(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirCrear = () => {
    setEditId(null);
    setForm(vacio);
    setShowForm(true);
  };

  const abrirEditar = (p: ProductoAdmin) => {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      categoria: p.categoria,
      img: p.img,
      stock: p.stock,
    });
    setShowForm(true);
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) {
        await apiFetch(`/api/productos/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/productos', {
          method: 'POST',
          body: JSON.stringify(form),
        });
      }
      setShowForm(false);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (p: ProductoAdmin) => {
    const ok = window.confirm(
      p.activo
        ? `¿Desactivar «${p.nombre}»? Dejará de verse en el catálogo.`
        : `¿Reactivar «${p.nombre}»?`
    );
    if (!ok) return;
    try {
      if (p.activo) {
        await apiFetch(`/api/productos/${p.id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/productos/${p.id}/activar`, { method: 'PATCH' });
      }
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado');
    }
  };

  const lista = pagina?.data ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Productos"
        subtitle="Crea, edita y activa o desactiva productos del catálogo."
        action={
          <button type="button" onClick={abrirCrear} className="btn btn-primary">
            <Icon name="plus" className="h-4 w-4" /> Nuevo producto
          </button>
        }
      />

      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
          <input
            className="input rounded-full pl-12"
            placeholder="Buscar por nombre o categoría…"
            aria-label="Buscar productos"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void cargar(q)}
          />
        </div>
        <button type="button" onClick={() => void cargar(q)} className="btn btn-outline">Buscar</button>
      </div>

      {error && <Alert>{error}</Alert>}

      {showForm && (
        <form onSubmit={guardar} className="card mb-6 space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{editId ? `Editar producto #${editId}` : 'Nuevo producto'}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100" aria-label="Cerrar formulario">
              <Icon name="x" className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="p-nombre">Nombre</label>
              <input id="p-nombre" required className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="p-cat">Categoría</label>
              <input id="p-cat" required className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="p-precio">Precio ($)</label>
              <input id="p-precio" required type="number" min={0.01} step={0.01} className="input" value={form.precio || ''} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label" htmlFor="p-stock">Stock</label>
              <input id="p-stock" type="number" min={0} className="input" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-img">URL de la imagen</label>
              <input id="p-img" className="input" value={form.img} onChange={(e) => setForm({ ...form, img: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-desc">Descripción</label>
              <textarea id="p-desc" className="input" rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Guardando…' : 'Guardar'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <PageLoading />
      ) : lista.length === 0 ? (
        <EmptyState icon="box" title="No hay productos" text="Crea el primero con el botón «Nuevo producto»." />
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <ul className="space-y-3 md:hidden">
            {lista.map((p) => (
              <li key={p.id} className="card flex gap-4 p-4">
                <img src={p.img} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-sand object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-semibold text-ink-900">{p.nombre}</p>
                    <span className={`badge shrink-0 ${p.activo ? 'bg-leaf-100 text-leaf-700' : 'bg-ink-100 text-ink-500'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <p className="text-sm text-ink-500">{p.categoria} · stock {p.stock}</p>
                  <p className="font-semibold text-brand-700">{money(p.precio)}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => abrirEditar(p)} className="btn btn-outline btn-sm">Editar</button>
                    <button type="button" onClick={() => void toggleActivo(p)} className="btn btn-ghost btn-sm">{p.activo ? 'Desactivar' : 'Activar'}</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Escritorio: tabla */}
          <div className="card hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60">
                <tr>
                  <th className="th">Producto</th>
                  <th className="th">Categoría</th>
                  <th className="th">Precio</th>
                  <th className="th">Stock</th>
                  <th className="th">Estado</th>
                  <th className="th text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {lista.map((p) => (
                  <tr key={p.id} className="transition hover:bg-ink-50/50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt="" className="h-12 w-12 rounded-lg bg-sand object-cover" />
                        <span className="font-medium text-ink-900">{p.nombre}</span>
                      </div>
                    </td>
                    <td className="td text-ink-600">{p.categoria}</td>
                    <td className="td font-semibold">{money(p.precio)}</td>
                    <td className="td">{p.stock}</td>
                    <td className="td">
                      <span className={`badge ${p.activo ? 'bg-leaf-100 text-leaf-700' : 'bg-ink-100 text-ink-500'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="td whitespace-nowrap text-right">
                      <button type="button" onClick={() => abrirEditar(p)} className="btn btn-ghost btn-sm"><Icon name="edit" className="h-4 w-4" /> Editar</button>
                      <button type="button" onClick={() => void toggleActivo(p)} className="btn btn-ghost btn-sm">{p.activo ? 'Desactivar' : 'Activar'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {pagina && <p className="mt-3 text-xs text-ink-400">{pagina.total} producto(s) en total</p>}
    </div>
  );
};

export default AdminProductos;

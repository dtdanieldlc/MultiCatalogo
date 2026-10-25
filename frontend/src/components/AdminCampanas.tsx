// /admin/campanas — banners promocionales en tienda
import { useState, type FormEvent } from "react";
import {
  getBanners,
  saveBanners,
  type BannerCampana,
} from "../services/adminConfigService";
import { EmptyState, Icon, PageHeader } from "./ui";

const vacio = (): Omit<BannerCampana, "id"> => ({
  titulo: "",
  texto: "",
  cta: "Ver catálogo",
  ctaUrl: "/catalogo",
  activo: true,
  desde: "",
  hasta: "",
});

const AdminCampanas = () => {
  const [lista, setLista] = useState<BannerCampana[]>(() => getBanners());
  const [form, setForm] = useState(vacio());
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const persist = (next: BannerCampana[]) => {
    setLista(next);
    saveBanners(next);
  };

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (editId) {
      persist(
        lista.map((b) =>
          b.id === editId
            ? {
                ...b,
                ...form,
                desde: form.desde || undefined,
                hasta: form.hasta || undefined,
              }
            : b
        )
      );
    } else {
      persist([
        {
          id: String(Date.now()),
          ...form,
          desde: form.desde || undefined,
          hasta: form.hasta || undefined,
        },
        ...lista,
      ]);
    }
    setShow(false);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Campañas"
        subtitle="Banners promocionales para la tienda"
      />

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditId(null);
            setForm(vacio());
            setShow(true);
          }}
        >
          <Icon name="plus" className="h-4 w-4" /> Nueva campaña
        </button>
      </div>

      {show && (
        <form onSubmit={guardar} className="card mb-6 space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Título</label>
              <input
                required
                className="input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Texto</label>
              <textarea
                className="input"
                rows={2}
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Texto del botón</label>
              <input
                className="input"
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
              />
            </div>
            <div>
              <label className="label">URL del botón</label>
              <input
                className="input"
                value={form.ctaUrl}
                onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Desde</label>
              <input
                type="date"
                className="input"
                value={form.desde ?? ""}
                onChange={(e) => setForm({ ...form, desde: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input
                type="date"
                className="input"
                value={form.hasta ?? ""}
                onChange={(e) => setForm({ ...form, hasta: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShow(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 ? (
        <EmptyState
          icon="bag"
          title="Sin campañas"
          text="Crea un banner para destacar promociones en la tienda."
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((b) => (
            <li
              key={b.id}
              className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg font-semibold">{b.titulo}</p>
                  <span
                    className={`badge ${
                      b.activo
                        ? "bg-leaf-100 text-leaf-700"
                        : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {b.activo ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-600">{b.texto}</p>
                <p className="mt-1 text-xs text-ink-400">
                  CTA: {b.cta} → {b.ctaUrl}
                  {b.desde || b.hasta
                    ? ` · ${b.desde || "…"} — ${b.hasta || "…"}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() =>
                    persist(
                      lista.map((x) =>
                        x.id === b.id ? { ...x, activo: !x.activo } : x
                      )
                    )
                  }
                >
                  {b.activo ? "Desactivar" : "Activar"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-dark"
                  onClick={() => {
                    setEditId(b.id);
                    setForm({
                      titulo: b.titulo,
                      texto: b.texto,
                      cta: b.cta,
                      ctaUrl: b.ctaUrl,
                      activo: b.activo,
                      desde: b.desde ?? "",
                      hasta: b.hasta ?? "",
                    });
                    setShow(true);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    if (window.confirm("¿Eliminar campaña?"))
                      persist(lista.filter((x) => x.id !== b.id));
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCampanas;

// /admin/cupones — CRUD de cupones (localStorage)
import { useState, type FormEvent } from "react";
import {
  getCupones,
  saveCupones,
  type AdminCupon,
} from "../services/adminConfigService";
import { Alert, EmptyState, Icon, PageHeader } from "./ui";

const vacio = (): Omit<AdminCupon, "id" | "usosHechos"> => ({
  codigo: "",
  tipo: "pct",
  valor: 10,
  minCompra: 0,
  usosMax: 100,
  activo: true,
  expira: "",
});

const AdminCupones = () => {
  const [lista, setLista] = useState<AdminCupon[]>(() => getCupones());
  const [form, setForm] = useState(vacio());
  const [editId, setEditId] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  const persist = (next: AdminCupon[]) => {
    setLista(next);
    saveCupones(next);
  };

  const abrirCrear = () => {
    setEditId(null);
    setForm(vacio());
    setShow(true);
  };

  const abrirEditar = (c: AdminCupon) => {
    setEditId(c.id);
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: c.valor,
      minCompra: c.minCompra,
      usosMax: c.usosMax,
      activo: c.activo,
      expira: c.expira ?? "",
    });
    setShow(true);
  };

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    const codigo = form.codigo.trim().toUpperCase();
    if (!codigo) return;
    if (editId) {
      persist(
        lista.map((c) =>
          c.id === editId
            ? {
                ...c,
                ...form,
                codigo,
                expira: form.expira || undefined,
              }
            : c
        )
      );
    } else {
      persist([
        {
          id: String(Date.now()),
          ...form,
          codigo,
          usosHechos: 0,
          expira: form.expira || undefined,
        },
        ...lista,
      ]);
    }
    setShow(false);
    setMsg("Cupón guardado");
    setTimeout(() => setMsg(""), 2000);
  };

  const eliminar = (id: string) => {
    if (!window.confirm("¿Eliminar este cupón?")) return;
    persist(lista.filter((c) => c.id !== id));
  };

  const toggle = (id: string) => {
    persist(
      lista.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administración"
        title="Cupones"
        subtitle="Códigos de descuento y envío gratis para el checkout"
      />

      <div className="mb-6 flex justify-end">
        <button type="button" onClick={abrirCrear} className="btn btn-primary">
          <Icon name="plus" className="h-4 w-4" /> Nuevo cupón
        </button>
      </div>

      {msg && <Alert>{msg}</Alert>}

      {show && (
        <form onSubmit={guardar} className="card mb-6 space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">
            {editId ? "Editar cupón" : "Nuevo cupón"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Código</label>
              <input
                required
                className="input uppercase"
                value={form.codigo}
                onChange={(e) =>
                  setForm({ ...form, codigo: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select
                className="input"
                value={form.tipo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipo: e.target.value as AdminCupon["tipo"],
                  })
                }
              >
                <option value="pct">Porcentaje (%)</option>
                <option value="fijo">Monto fijo ($)</option>
                <option value="envio">Envío gratis</option>
              </select>
            </div>
            {form.tipo !== "envio" && (
              <div>
                <label className="label">
                  Valor {form.tipo === "pct" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="input"
                  value={form.valor}
                  onChange={(e) =>
                    setForm({ ...form, valor: Number(e.target.value) })
                  }
                />
              </div>
            )}
            <div>
              <label className="label">Compra mínima ($)</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.minCompra}
                onChange={(e) =>
                  setForm({ ...form, minCompra: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Usos máximos</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.usosMax}
                onChange={(e) =>
                  setForm({ ...form, usosMax: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Expira (opcional)</label>
              <input
                type="date"
                className="input"
                value={form.expira ?? ""}
                onChange={(e) => setForm({ ...form, expira: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 ? (
        <EmptyState
          icon="coin"
          title="Sin cupones"
          text="Crea el primero para promociones en checkout."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-sand/60 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Mín.</th>
                <th className="px-4 py-3">Usos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-ink-50 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold">{c.codigo}</td>
                  <td className="px-4 py-3 capitalize">
                    {c.tipo === "pct"
                      ? "%"
                      : c.tipo === "fijo"
                        ? "Fijo"
                        : "Envío"}
                  </td>
                  <td className="px-4 py-3">
                    {c.tipo === "envio"
                      ? "—"
                      : c.tipo === "pct"
                        ? `${c.valor}%`
                        : `$${c.valor}`}
                  </td>
                  <td className="px-4 py-3">${c.minCompra}</td>
                  <td className="px-4 py-3">
                    {c.usosHechos}/{c.usosMax}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        c.activo
                          ? "bg-leaf-100 text-leaf-700"
                          : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => toggle(c.id)}
                      >
                        {c.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-dark"
                        onClick={() => abrirEditar(c)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => eliminar(c.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-400">
        Los cupones se guardan en este navegador. Para sincronizar entre equipos,
        luego se pueden mover a la base de datos.
      </p>
    </div>
  );
};

export default AdminCupones;

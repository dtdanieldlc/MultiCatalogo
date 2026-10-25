// /mi-perfil — datos de cuenta + extras locales
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getPerfilExtra,
  savePerfilExtra,
  type PerfilExtra,
} from "../services/clienteLocalService";
import { Alert, Icon, PageHeader } from "./ui";

const MiPerfil = () => {
  const { user, logout } = useAuth();
  const [extra, setExtra] = useState<PerfilExtra>(() => getPerfilExtra());
  const [ok, setOk] = useState("");

  const guardar = (e: FormEvent) => {
    e.preventDefault();
    savePerfilExtra(extra);
    setOk("Perfil guardado en este dispositivo");
    setTimeout(() => setOk(""), 2500);
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        eyebrow="Cuenta"
        title="Mi perfil"
        subtitle="Datos de sesión y contacto para pedidos"
      />

      {ok && <Alert tone="success">{ok}</Alert>}

      <div className="card mb-6 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 font-display text-xl font-semibold text-white">
            {(user?.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{user?.email}</p>
            <p className="text-sm capitalize text-ink-500">Rol: {user?.rol}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-400">
          Email y rol vienen del servidor. Nombre y contacto se guardan localmente
          para prellenar checkout.
        </p>
      </div>

      <form onSubmit={guardar} className="card space-y-4 p-6">
        <div>
          <label className="label">Nombre completo</label>
          <input
            className="input"
            value={extra.nombre}
            onChange={(e) => setExtra({ ...extra, nombre: e.target.value })}
            placeholder="Tu nombre"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={extra.telefono}
              onChange={(e) => setExtra({ ...extra, telefono: e.target.value })}
            />
          </div>
          <div>
            <label className="label">WhatsApp</label>
            <input
              className="input"
              value={extra.whatsapp}
              onChange={(e) => setExtra({ ...extra, whatsapp: e.target.value })}
              placeholder="5939..."
            />
          </div>
        </div>
        <div>
          <label className="label">Ciudad</label>
          <input
            className="input"
            value={extra.ciudad}
            onChange={(e) => setExtra({ ...extra, ciudad: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Dirección</label>
          <input
            className="input"
            value={extra.direccion}
            onChange={(e) => setExtra({ ...extra, direccion: e.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            <Icon name="check" className="h-4 w-4" /> Guardar
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              if (window.confirm("¿Cerrar sesión?")) logout();
            }}
          >
            <Icon name="logout" className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </form>
    </div>
  );
};

export default MiPerfil;

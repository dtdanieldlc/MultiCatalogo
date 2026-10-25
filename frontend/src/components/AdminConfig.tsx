// /admin/config — parámetros del negocio
import { useState, type FormEvent } from "react";
import {
  DEFAULT_CONFIG,
  getConfig,
  saveConfig,
  type BusinessConfig,
} from "../services/adminConfigService";
import { Alert, PageHeader } from "./ui";

const AdminConfig = () => {
  const [cfg, setCfg] = useState<BusinessConfig>(() => getConfig());
  const [ok, setOk] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    saveConfig(cfg);
    setOk("Configuración guardada");
    setTimeout(() => setOk(""), 2500);
  };

  const reset = () => {
    setCfg({ ...DEFAULT_CONFIG });
    saveConfig(DEFAULT_CONFIG);
    setOk("Valores por defecto restaurados");
    setTimeout(() => setOk(""), 2500);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Administración"
        title="Configuración"
        subtitle="Comisiones, envío, stock e impuestos"
      />

      {ok && <Alert>{ok}</Alert>}

      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <div>
          <label className="label">Nombre del negocio</label>
          <input
            className="input"
            value={cfg.nombreNegocio}
            onChange={(e) => setCfg({ ...cfg, nombreNegocio: e.target.value })}
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink-800">
            Comisiones MLM (fracción 0–1)
          </legend>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                ["comisionN1", "Nivel 1"],
                ["comisionN2", "Nivel 2"],
                ["comisionN3", "Nivel 3"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  className="input"
                  value={cfg[key]}
                  onChange={(e) =>
                    setCfg({ ...cfg, [key]: Number(e.target.value) })
                  }
                />
                <p className="mt-1 text-xs text-ink-400">
                  {(cfg[key] * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Mín. liquidación ($)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={cfg.minLiquidacion}
              onChange={(e) =>
                setCfg({ ...cfg, minLiquidacion: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Envío gratis desde ($)</label>
            <input
              type="number"
              min={0}
              className="input"
              value={cfg.envioGratisDesde}
              onChange={(e) =>
                setCfg({ ...cfg, envioGratisDesde: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">Umbral stock bajo (uds.)</label>
            <input
              type="number"
              min={1}
              className="input"
              value={cfg.stockBajo}
              onChange={(e) =>
                setCfg({ ...cfg, stockBajo: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="label">IVA %</label>
            <input
              type="number"
              min={0}
              max={100}
              className="input"
              value={cfg.ivaPct}
              onChange={(e) =>
                setCfg({ ...cfg, ivaPct: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <button type="button" onClick={reset} className="btn btn-outline">
            Restaurar defaults
          </button>
        </div>
        <p className="text-xs text-ink-400">
          Nota: las comisiones del backend siguen las tasas del servidor. Estos
          valores guían el panel y el checkout (envío / stock). La sincronización
          total con Go se puede hacer en una siguiente iteración.
        </p>
      </form>
    </div>
  );
};

export default AdminConfig;

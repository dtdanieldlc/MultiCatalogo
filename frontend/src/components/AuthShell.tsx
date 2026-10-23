// Marco de las pantallas de acceso: panel de marca + formulario.
import type { ReactNode } from "react";
import { Icon, Logo } from "./ui";

const AuthShell = ({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) => (
  <div className="grid min-h-[100dvh] lg:grid-cols-[1.05fr_1fr]">
    {/* Panel de marca (solo escritorio) */}
    <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-700/60 blur-3xl" />
      <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="relative">
        <Logo light />
      </div>
      <div className="relative max-w-md">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200">
          Cosmética · Venta en red
        </p>
        <h2 className="font-display text-5xl font-medium leading-[1.05] text-white">
          Belleza que se comparte, ganancias que crecen.
        </h2>
        <ul className="mt-8 space-y-3 text-brand-100">
          {["Catálogo de cosmética premium", "Comisiones en 3 niveles de tu red", "Funciona como app, incluso sin conexión"].map(
            (t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  <Icon name="check" className="h-3.5 w-3.5" />
                </span>
                {t}
              </li>
            )
          )}
        </ul>
      </div>
      <p className="relative text-sm text-brand-200/80">© DTLC MultiCatálogo</p>
    </aside>

    {/* Formulario */}
    <main className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-md animate-rise">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">{title}</h1>
        <p className="mb-8 mt-2 text-ink-500">{subtitle}</p>
        {children}
      </div>
    </main>
  </div>
);

export default AuthShell;

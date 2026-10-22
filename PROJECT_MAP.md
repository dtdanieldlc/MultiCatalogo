# PROJECT_MAP — MultiCatálogo (mapa de navegación)

> Leer ESTE archivo antes de abrir código. Solo rutas y responsabilidades.
> Raíz del proyecto = carpeta que contiene `backend/` y `frontend/`.

## 1. Visión general
- Sistema SaaS multitenant tipo catálogo/billetera con red de referidos (multinivel).
- Unidad 2: alta transaccionalidad y rendimiento **backend**. El frontend ya está terminado y funciona como "monitor visual".
- Puertos: API Go/Fiber `:3000` · Frontend Vite `:5173` · PostgreSQL 16 (Docker) `:5432` · Redis (Docker) `:6379`.
- Cuentas de prueba: `admin@upse.edu.ec` / `cliente@upse.edu.ec`, contraseña `123456`.

## 2. Backend — `backend/` (Go + Fiber v2 + PostgreSQL vía `database/sql` + `lib/pq`)
Patrón por capas: routes → controllers → repository (Redis Cache-Aside → PostgreSQL) → models.
Fase 4: los controladores son `struct` que reciben **interfaces** (`DBRepository`, `CacheRepository`); `main.go` es el único lugar que crea las implementaciones y las inyecta.

| Ruta | Responsabilidad |
|---|---|
| `backend/main.go` | Arranque: .env, BD, migración Fase 4, Redis, **inyección de dependencias**, Fiber + ErrorHandler + recover + CORS, apagado ordenado (espera comisiones) |
| `backend/config/db.go` | `LoadEnv`, `Getenv`, `ConnectDB` (pool + reintentos) |
| `backend/config/migrate.go` | `Migrate`: ejecuta un script SQL idempotente al arrancar |
| `backend/database/migracion_fase4.sql`, `embed.go` | Tablas `pedidos`, `pedido_items`, `comisiones` + stock/saldo/referido_id (embebido en el binario) |
| `backend/database/reset_demo_fase4.sql` | Deja la demo como al inicio (stock, saldos, pedidos) |
| `backend/controllers/checkoutController.go` | `Checkout` (POST /api/checkout), goroutine `calcularComisiones`, `Esperar`, validación |
| `backend/controllers/checkout_test.go` | Pruebas unitarias con repositorio y caché falsos |
| `backend/repository/interfaces.go` | Contratos `DBRepository` y `CacheRepository` |
| `backend/repository/pedidos.go` | `CrearPedido` (transacción ACID), `AcreditarComisiones`, errores de negocio, inyección de falla (demo) |
| `backend/config/redis.go` | `ConnectRedis` (cliente go-redis; `REDIS_URL` o `REDIS_HOST`/`PORT`) |
| `backend/docker-compose.yml` | PostgreSQL 16 + Redis (`docker compose up -d`); API opcional con `--profile full` |
| `backend/Dockerfile` | Imagen de la API (solo perfil `full`) |
| `backend/database/init.sql` | Esquema (`usuarios`, `productos`, `referidos`) + datos semilla |
| `backend/.env`, `.env.example` | Credenciales BD, `REDIS_*` y `PORT` (el `.env` está en .gitignore) |
| `backend/routes/routes.go` | ÚNICO lugar donde se registran endpoints |
| `backend/controllers/authController.go` | `Login`: validación de entrada, 400/401/200 |
| `backend/controllers/prodController.go` | `GetProductos`, `GetProductoPorID` (400/404) |
| `backend/controllers/redController.go` | `GetRed` (árbol multinivel, `?email=` opcional, 400 si es inválido) |
| `backend/controllers/healthController.go` | `Health` → `{"status":"ok",...}` |
| `backend/controllers/response.go` | `SendError` + `ErrorHandler` (formato `APIError`) + `setCacheHeader` (`X-Cache`) |
| `backend/models/models.go` | `LoginRequest/Response`, `Producto`, `Referido`, `Usuario`, `APIError` |
| `backend/repository/cache.go` | `CacheAside[T]`, `RedisCache`, `NopCache`, claves (`productos:all` 5 min, `red:tree:{email}` 10 min) |
| `backend/repository/repository.go` | `PostgresRepo` (implementa `DBRepository`): `FindUsuario[ByToken]`, `GetProductos`, `GetProductoByID`, `GetRed` |
| `backend/go.mod`, `go.sum` | Módulo `multicatalogo-backend`: fiber/v2, lib/pq, godotenv, go-redis/v9 |

### Endpoints
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/api/health` | 200 `{status,message}` |
| POST | `/api/checkout` | 201 `Pedido` · 400 validación/producto inexistente · 401 sin sesión · 409 stock · 500 (con `Authorization: Bearer <token>`) |
| POST | `/api/login` | 200 `{token,email,rol}` · 400 validación · 401 credenciales |
| GET | `/api/productos` | 200 `[Producto]` · cabecera `X-Cache: HIT\|MISS` |
| GET | `/api/productos/:id` | 200 `Producto` · 400 id inválido · 404 no existe |
| GET | `/api/red[?email=]` | 200 `Referido` (árbol) · `X-Cache: HIT\|MISS` · 400 email inválido |

### Contrato de error (todas las rutas)
`{"status": int, "message": string, "details": any (opcional)}`

## 3. Frontend — `frontend/` (React 19 + Vite 5 + Tailwind 3 + React Router 7 + TypeScript)
**Prohibido cambiar** firmas de endpoints ni forma de los JSON que consume.

| Ruta | Responsabilidad |
|---|---|
| `frontend/src/App.tsx` | Rutas y guardas (`ProtectedRoute`, `AdminRoute`, `CartBoundary`) |
| `frontend/src/config.ts` | `API_URL` = `http://<host>:3000` |
| `frontend/src/context/AuthContext.tsx` | Usuario + rol (`admin` \| `cliente`) |
| `frontend/src/context/CartContext.tsx` | Carrito persistente por usuario (localStorage) |
| `frontend/src/services/productosService.ts` | `fetch` a `/api/productos[/:id]`, clase `ApiError` |
| `frontend/src/data/productos.ts` | Tipo `Producto` + categorías (mock ya no se usa en servicio) |
| `frontend/src/data/red.ts` | Cálculo de comisiones + red local de respaldo si `/api/red` falla |
| `frontend/src/components/Login.tsx` | POST `/api/login`, muestra `message` del backend |
| `frontend/src/components/DetalleProducto.tsx` | `/producto/:id`, muestra errores 400/404 |
| `frontend/src/components/Catalogo.tsx`, `Storefront.tsx` | Listado y tienda (consumen `getProductos`) |
| `frontend/src/components/Carrito.tsx`, `Checkout.tsx`, `Confirmacion.tsx` | Flujo de compra; `Checkout` hace POST a `/api/checkout` |
| `frontend/src/hooks/useRed.ts` | Hook: árbol desde `/api/red` (respaldo `data/red.ts`), usado por Dashboard y MiRed |
| `frontend/src/components/Dashboard.tsx`, `MiRed.tsx` | Solo admin (`/`, `/mi-red`); ambos usan `useRed` |
| `frontend/src/components/Layout.tsx`, `Navbar.tsx`, `Sidebar.tsx` | Estructura visual |

### Rutas de la SPA
`/login` público · `/`, `/mi-red` solo admin · `/tienda`, `/catalogo`, `/producto/:id`, `/carrito`, `/checkout`, `/confirmacion` ambos roles.

## 4. Documentación existente
- `README.md` (raíz): cómo ejecutar backend y frontend.
- `frontend/README.md`: estructura y rutas del frontend.
- `REQUIREMENTS_CHECKLIST.md`: estado y requerimientos (leer al iniciar sesión).
- `.windsurfrules`: reglas del agente.
- NOTA: `Guia_Practica_Tema5_leccion.md`, `Planificacion_Unidad1_Tema5.md` y `Silabo_Framework_Programacion_Web.md` NO están en este árbol; ubicación por confirmar.

## 5. Comandos
- BD + Redis: `cd backend && docker compose up -d` (reiniciar datos: `docker compose down -v`)
- Pruebas unitarias: `cd backend && go test ./controllers/ -v`
- Demo de ROLLBACK: `FALLA_CHECKOUT=antes_items go run .` (o `=pausa`; ver `.env.example`)
- Reiniciar la demo: ver `backend/database/reset_demo_fase4.sql`
- Ver/limpiar caché: `docker exec multicatalogo-redis redis-cli KEYS "*"` · `... redis-cli FLUSHALL`
- Backend: `cd backend && go run .`
- Frontend: `cd frontend && npm install && npm run dev`
- Tipos frontend: `cd frontend && npx tsc -b`
- Verificar API sin navegador: `GET http://localhost:3000/api/health`

// Paquete database: scripts SQL embebidos en el binario.
package database

import _ "embed"

// MigracionSchema crea tablas base + semilla en BD vacías (Render/Railway).
//
//go:embed 001_schema.sql
var MigracionSchema string

// MigracionFase4 crea/actualiza las tablas de pedidos y comisiones (idempotente).
//
//go:embed migracion_fase4.sql
var MigracionFase4 string

// MigracionSeguridad aplica bcrypt a passwords e índices (idempotente).
//
//go:embed 003_seguridad.sql
var MigracionSeguridad string

// MigracionBackoffice tablas/columnas del back-office MLM (idempotente).
//
//go:embed 004_backoffice.sql
var MigracionBackoffice string

// MigracionDatosDemo productos 9..33, red ampliada, cuentas, pedidos y liquidaciones.
// Idempotente vía tabla seed_aplicados (nombre = '005_datos_demo').
//
//go:embed 005_datos_demo.sql
var MigracionDatosDemo string

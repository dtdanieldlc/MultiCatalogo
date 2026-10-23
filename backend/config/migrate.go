package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"
)

// Migrate ejecuta un script SQL idempotente (CREATE ... IF NOT EXISTS, etc.).
// lib/pq envía el script completo en una sola petición, de modo que se aplica entero o nada.
// timeout opcional: si es 0 se usa 60s (suficiente para seeds pesados como 005).
func Migrate(db *sql.DB, nombre, script string) error {
	return MigrateWithTimeout(db, nombre, script, 60*time.Second)
}

// MigrateWithTimeout igual que Migrate pero con deadline configurable.
func MigrateWithTimeout(db *sql.DB, nombre, script string, timeout time.Duration) error {
	if timeout <= 0 {
		timeout = 60 * time.Second
	}
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	if _, err := db.ExecContext(ctx, script); err != nil {
		return fmt.Errorf("migración %s: %w", nombre, err)
	}
	log.Printf("config: migración %s aplicada", nombre)
	return nil
}

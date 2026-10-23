package repository

import (
	"context"
	"database/sql"
	"fmt"

	"multicatalogo-backend/models"
)

// ListUsuariosAdmin lista usuarios con búsqueda, filtro de rol y paginación.
func (r *PostgresRepo) ListUsuariosAdmin(ctx context.Context, q, rol string, page, limit int) ([]models.UsuarioAdmin, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	where := "WHERE 1=1"
	args := []any{}
	if q != "" {
		args = append(args, "%"+q+"%")
		n := len(args)
		where += fmt.Sprintf(" AND (u.email ILIKE $%d OR COALESCE(u.nombre,'') ILIKE $%d)", n, n)
	}
	if rol == "admin" || rol == "cliente" {
		args = append(args, rol)
		where += fmt.Sprintf(" AND u.rol = $%d", len(args))
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM usuarios u `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, limit, offset)
	limIdx, offIdx := len(args)-1, len(args)

	// Query robusta: creado_en puede no existir en installs viejas → usamos COALESCE con now()
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT u.id,
		       u.email,
		       u.rol,
		       COALESCE(u.nombre, ''),
		       COALESCE(u.activo, true),
		       u.referido_id,
		       COALESCE(r.codigo, ''),
		       COALESCE(u.creado_en, now()),
		       COALESCE((SELECT COUNT(*)::int FROM pedidos p WHERE p.usuario_id = u.id), 0),
		       COALESCE((SELECT SUM(p.total) FROM pedidos p WHERE p.usuario_id = u.id AND COALESCE(p.estado,'') <> 'cancelado'), 0)::float8
		FROM usuarios u
		LEFT JOIN referidos r ON r.id = u.referido_id
		%s
		ORDER BY u.id
		LIMIT $%d OFFSET $%d`, where, limIdx, offIdx), args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	out := make([]models.UsuarioAdmin, 0)
	for rows.Next() {
		var u models.UsuarioAdmin
		var refID sql.NullInt64
		if err := rows.Scan(
			&u.ID, &u.Email, &u.Rol, &u.Nombre, &u.Activo,
			&refID, &u.CodigoRef, &u.CreadoEn, &u.Pedidos, &u.TotalComprado,
		); err != nil {
			return nil, 0, err
		}
		if refID.Valid {
			v := int(refID.Int64)
			u.ReferidoID = &v
		}
		out = append(out, u)
	}
	return out, total, rows.Err()
}

// SetUsuarioActivo activa o desactiva una cuenta.
func (r *PostgresRepo) SetUsuarioActivo(ctx context.Context, id int, activo bool) (models.UsuarioAdmin, error) {
	res, err := r.db.ExecContext(ctx, `UPDATE usuarios SET activo = $1 WHERE id = $2`, activo, id)
	if err != nil {
		return models.UsuarioAdmin{}, err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return models.UsuarioAdmin{}, sql.ErrNoRows
	}

	var u models.UsuarioAdmin
	var refID sql.NullInt64
	err = r.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, u.rol, COALESCE(u.nombre,''), COALESCE(u.activo,true),
		       u.referido_id, COALESCE(r.codigo,''), COALESCE(u.creado_en, now()),
		       COALESCE((SELECT COUNT(*)::int FROM pedidos p WHERE p.usuario_id = u.id), 0),
		       COALESCE((SELECT SUM(p.total) FROM pedidos p WHERE p.usuario_id = u.id AND COALESCE(p.estado,'') <> 'cancelado'), 0)::float8
		FROM usuarios u
		LEFT JOIN referidos r ON r.id = u.referido_id
		WHERE u.id = $1`, id).Scan(
		&u.ID, &u.Email, &u.Rol, &u.Nombre, &u.Activo,
		&refID, &u.CodigoRef, &u.CreadoEn, &u.Pedidos, &u.TotalComprado,
	)
	if err != nil {
		return models.UsuarioAdmin{}, err
	}
	if refID.Valid {
		v := int(refID.Int64)
		u.ReferidoID = &v
	}
	return u, nil
}

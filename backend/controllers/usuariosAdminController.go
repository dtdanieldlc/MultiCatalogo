package controllers

import (
	"database/sql"
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"

	"multicatalogo-backend/models"
	"multicatalogo-backend/repository"
)

// UsuariosAdminController listado y activación/desactivación de usuarios (solo admin).
type UsuariosAdminController struct {
	repo repository.DBRepository
}

func NewUsuariosAdminController(repo repository.DBRepository) *UsuariosAdminController {
	return &UsuariosAdminController{repo: repo}
}

// List GET /api/admin/usuarios?q=&rol=&page=&limit=
func (u *UsuariosAdminController) List(c *fiber.Ctx) error {
	q := strings.TrimSpace(c.Query("q"))
	rol := strings.TrimSpace(c.Query("rol"))
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}

	data, total, err := u.repo.ListUsuariosAdmin(c.UserContext(), q, rol, page, limit)
	if err != nil {
		return dbError(c, err)
	}
	return c.JSON(models.Pagina[models.UsuarioAdmin]{Data: data, Page: page, Limit: limit, Total: total})
}

// SetActivo PATCH /api/admin/usuarios/:id/activo  body: { "activo": true|false }
func (u *UsuariosAdminController) SetActivo(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil || id <= 0 {
		return SendError(c, fiber.StatusBadRequest, "Id de usuario inválido", nil)
	}

	selfID, _ := c.Locals("userID").(int)
	var body struct {
		Activo *bool `json:"activo"`
	}
	if err := c.BodyParser(&body); err != nil || body.Activo == nil {
		return SendError(c, fiber.StatusBadRequest, "Debes enviar { \"activo\": true|false }", nil)
	}
	if selfID == id && !*body.Activo {
		return SendError(c, fiber.StatusBadRequest, "No puedes desactivar tu propia cuenta", nil)
	}

	out, err := u.repo.SetUsuarioActivo(c.UserContext(), id, *body.Activo)
	if errors.Is(err, sql.ErrNoRows) {
		return SendError(c, fiber.StatusNotFound, "Usuario no encontrado", nil)
	}
	if err != nil {
		return dbError(c, err)
	}
	return c.JSON(out)
}

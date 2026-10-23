-- Deja la demo de la Fase 4 como al inicio (útil entre clases):
--   docker cp database/reset_demo_fase4.sql multicatalogo-db:/tmp/r.sql
--   docker exec multicatalogo-db psql -U multicatalogo -d multicatalogo -f /tmp/r.sql
--   docker exec multicatalogo-redis redis-cli FLUSHALL
TRUNCATE comisiones, pedido_items, pedidos RESTART IDENTITY;
UPDATE productos SET stock = 100;
UPDATE referidos r SET saldo = 0, ventas = v.ventas
FROM (VALUES
  (0, 3200), (1, 1450), (2, 980), (3, 560), (8, 720), (9, 410),
  (4, 620), (5, 510), (6, 440), (12, 290), (13, 320), (14, 265),
  (7, 380), (10, 210), (11, 175)
) AS v(id, ventas)
WHERE r.id = v.id;

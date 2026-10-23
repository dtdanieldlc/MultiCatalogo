-- Esquema base + semilla (idempotente). Para BD vacías (Render/Railway).

CREATE TABLE IF NOT EXISTS usuarios (
    id       SERIAL PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol      VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'cliente')),
    token    VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS productos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150)  NOT NULL,
    descripcion TEXT          NOT NULL DEFAULT '',
    precio      NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    categoria   VARCHAR(50)   NOT NULL,
    img         TEXT          NOT NULL,
    galeria     TEXT[]        NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS referidos (
    id        INTEGER PRIMARY KEY,
    nombre    VARCHAR(150)  NOT NULL,
    nivel     INTEGER       NOT NULL CHECK (nivel >= 0),
    ventas    NUMERIC(12,2) NOT NULL DEFAULT 0,
    parent_id INTEGER REFERENCES referidos(id)
);

CREATE INDEX IF NOT EXISTS idx_referidos_parent ON referidos(parent_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

INSERT INTO usuarios (email, password, rol, token)
SELECT 'admin@upse.edu.ec', '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'admin', ''
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@upse.edu.ec');

INSERT INTO usuarios (email, password, rol, token)
SELECT 'cliente@upse.edu.ec', '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'cliente@upse.edu.ec');

INSERT INTO productos (id, nombre, descripcion, precio, categoria, img, galeria)
SELECT * FROM (VALUES
    (1, 'Serum Revitalizante', 'Serum concentrado con vitamina C y ácido hialurónico.', 45.00::numeric, 'Serum', 'https://picsum.photos/seed/serum/600', ARRAY[]::text[]),
    (2, 'Crema Hidratante Facial', 'Crema ligera con ácido hialurónico y aloe vera.', 32.00::numeric, 'Crema', 'https://picsum.photos/seed/crema/600', ARRAY[]::text[]),
    (3, 'Tónico Facial Natural', 'Tónico refrescante con extractos botánicos.', 22.00::numeric, 'Tónico', 'https://picsum.photos/seed/tonico/600', ARRAY[]::text[]),
    (4, 'Mascarilla Nocturna', 'Mascarilla de noche con colágeno y vitamina E.', 50.00::numeric, 'Mascarilla', 'https://picsum.photos/seed/mascarilla/600', ARRAY[]::text[]),
    (5, 'Serum Anti-Edad Retinol', 'Serum de retinol encapsulado.', 58.00::numeric, 'Serum', 'https://picsum.photos/seed/retinol/600', ARRAY[]::text[]),
    (6, 'Crema Contorno de Ojos', 'Contorno de ojos con cafeína y péptidos.', 26.00::numeric, 'Crema', 'https://picsum.photos/seed/ojos/600', ARRAY[]::text[]),
    (7, 'Tónico Exfoliante AHA-BHA', 'Exfoliación química suave con AHA y BHA.', 34.00::numeric, 'Tónico', 'https://picsum.photos/seed/exfoliante/600', ARRAY[]::text[]),
    (8, 'Kit Rutina Completa', 'Kit integral: serum, crema, tónico y mascarilla.', 129.00::numeric, 'Kit', 'https://picsum.photos/seed/kit/600', ARRAY[]::text[])
) AS v(id, nombre, descripcion, precio, categoria, img, galeria)
WHERE NOT EXISTS (SELECT 1 FROM productos LIMIT 1);

INSERT INTO referidos (id, nombre, nivel, ventas, parent_id)
SELECT * FROM (VALUES
    (0, 'Tú', 0, 2400.00::numeric, NULL::integer),
    (1, 'Ana García', 1, 1200.00::numeric, 0),
    (2, 'Luis Poveda', 1, 850.00::numeric, 0),
    (3, 'Marta Sánchez', 1, 430.00::numeric, 0),
    (4, 'Carlos Ruiz', 2, 500.00::numeric, 1),
    (5, 'Sofía León', 2, 430.00::numeric, 1),
    (6, 'Marco Díaz', 2, 380.00::numeric, 2),
    (7, 'Diana Paz', 3, 300.00::numeric, 4)
) AS v(id, nombre, nivel, ventas, parent_id)
WHERE NOT EXISTS (SELECT 1 FROM referidos LIMIT 1);

SELECT setval(pg_get_serial_sequence('productos', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM productos), 1));
SELECT setval(pg_get_serial_sequence('usuarios',  'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM usuarios), 1));

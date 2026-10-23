-- MultiCatálogo · esquema relacional y datos semilla (Fase 2)
-- Se ejecuta automáticamente la primera vez que arranca el contenedor de PostgreSQL.
-- Para reiniciar desde cero:  docker compose down -v && docker compose up -d

DROP TABLE IF EXISTS referidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id       SERIAL PRIMARY KEY,
    email    VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,          -- bcrypt hash
    rol      VARCHAR(20)  NOT NULL CHECK (rol IN ('admin', 'cliente')),
    token    VARCHAR(255) NOT NULL DEFAULT ''  -- legado; el JWT se genera en login
);

CREATE TABLE productos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150)  NOT NULL,
    descripcion TEXT          NOT NULL DEFAULT '',
    precio      NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    categoria   VARCHAR(50)   NOT NULL,
    img         TEXT          NOT NULL,
    galeria     TEXT[]        NOT NULL DEFAULT '{}'
);

CREATE TABLE referidos (
    id        INTEGER PRIMARY KEY,
    nombre    VARCHAR(150)  NOT NULL,
    nivel     INTEGER       NOT NULL CHECK (nivel >= 0),
    ventas    NUMERIC(12,2) NOT NULL DEFAULT 0,
    parent_id INTEGER REFERENCES referidos(id)   -- NULL = raíz del árbol
);
CREATE INDEX idx_referidos_parent ON referidos(parent_id);
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- ---------- Datos semilla DTLC (expandidos) ----------
-- password = bcrypt("123456") cost 10  (misma clave para todas las cuentas demo)
INSERT INTO usuarios (email, password, rol, token) VALUES
    ('admin@upse.edu.ec',      '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'admin',   ''),
    ('cliente@upse.edu.ec',    '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''),
    ('ana@dtlc.com',           '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''),
    ('luis@dtlc.com',          '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''),
    ('marta@dtlc.com',         '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''),
    ('diana@dtlc.com',         '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', ''),
    ('andrea@dtlc.com',        '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK', 'cliente', '');

INSERT INTO productos (id, nombre, descripcion, precio, categoria, img, galeria) VALUES
    (1,  'Serum Revitalizante',        'Serum concentrado con vitamina C y ácido hialurónico. Ilumina la piel, reduce manchas y aporta hidratación profunda desde la primera aplicación.', 45.00,  'Serum',            'https://picsum.photos/seed/serum/600',       ARRAY['https://picsum.photos/seed/serum1/600', 'https://picsum.photos/seed/serum2/600', 'https://picsum.photos/seed/serum3/600']),
    (2,  'Crema Hidratante Pro',       'Crema facial de textura ligera con niacinamida y manteca de karité. Hidratación de 24 horas y barrera cutánea fortalecida para todo tipo de piel.', 32.50,  'Crema',            'https://picsum.photos/seed/crema/600',       ARRAY['https://picsum.photos/seed/crema1/600', 'https://picsum.photos/seed/crema2/600', 'https://picsum.photos/seed/crema3/600']),
    (3,  'Tónico Purificante',         'Tónico sin alcohol con hamamelis y agua de rosas. Limpia poros, equilibra el pH y prepara la piel para el resto de la rutina diaria.', 28.00,  'Tónico',           'https://picsum.photos/seed/tonico/600',      ARRAY['https://picsum.photos/seed/tonico1/600', 'https://picsum.photos/seed/tonico2/600', 'https://picsum.photos/seed/tonico3/600']),
    (4,  'Mascarilla Nocturna',        'Mascarilla de noche con colágeno y vitamina E. Repara la piel mientras duermes y recupera la luminosidad al despertar.', 50.00,  'Mascarilla',       'https://picsum.photos/seed/mascarilla/600',  ARRAY['https://picsum.photos/seed/mascarilla1/600', 'https://picsum.photos/seed/mascarilla2/600', 'https://picsum.photos/seed/mascarilla3/600']),
    (5,  'Serum Anti-Edad Retinol',    'Serum de retinol encapsulado que suaviza líneas de expresión y mejora la firmeza. Uso nocturno recomendado.', 58.00,  'Serum',            'https://picsum.photos/seed/retinol/600',     ARRAY['https://picsum.photos/seed/retinol1/600', 'https://picsum.photos/seed/retinol2/600', 'https://picsum.photos/seed/retinol3/600']),
    (6,  'Crema Contorno de Ojos',     'Contorno de ojos con cafeína y péptidos. Reduce bolsas y ojeras, hidrata la zona más delicada del rostro.', 26.00,  'Crema',            'https://picsum.photos/seed/ojos/600',        ARRAY['https://picsum.photos/seed/ojos1/600', 'https://picsum.photos/seed/ojos2/600', 'https://picsum.photos/seed/ojos3/600']),
    (7,  'Tónico Exfoliante AHA-BHA',  'Exfoliación química suave con ácidos AHA y BHA. Renueva la textura de la piel y desobstruye los poros.', 34.00,  'Tónico',           'https://picsum.photos/seed/exfoliante/600',  ARRAY['https://picsum.photos/seed/exfoliante1/600', 'https://picsum.photos/seed/exfoliante2/600', 'https://picsum.photos/seed/exfoliante3/600']),
    (8,  'Kit Rutina Completa',        'Kit integral con serum, crema, tónico y mascarilla. La rutina perfecta para comenzar: limpieza, tratamiento e hidratación.', 129.00, 'Kit',              'https://picsum.photos/seed/kit/600',         ARRAY['https://picsum.photos/seed/kit1/600', 'https://picsum.photos/seed/kit2/600', 'https://picsum.photos/seed/kit3/600']),
    (9,  'Limpiador Suave Espuma',     'Gel-espuma de limpieza con extracto de avena y glicerina. Elimina impurezas sin resecar y deja la piel suave y equilibrada.', 22.00,  'Limpiador',        'https://picsum.photos/seed/limpiador/600',   ARRAY['https://picsum.photos/seed/limpiador1/600', 'https://picsum.photos/seed/limpiador2/600', 'https://picsum.photos/seed/limpiador3/600']),
    (10, 'Protector Solar FPS 50+',    'Protector solar de amplio espectro, textura ultraligera e invisible. Resistente al agua, ideal para uso diario y clima tropical.', 38.00,  'Protector Solar',  'https://picsum.photos/seed/solar/600',       ARRAY['https://picsum.photos/seed/solar1/600', 'https://picsum.photos/seed/solar2/600', 'https://picsum.photos/seed/solar3/600']),
    (11, 'Aceite Facial de Rosa Mosqueta', 'Aceite 100% puro de rosa mosqueta con vitamina A natural. Regenera, unifica el tono y aporta brillo saludable sin dejar grasa.', 42.00,  'Aceite',           'https://picsum.photos/seed/aceite/600',      ARRAY['https://picsum.photos/seed/aceite1/600', 'https://picsum.photos/seed/aceite2/600', 'https://picsum.photos/seed/aceite3/600']),
    (12, 'Serum Niacinamida 10%',      'Serum de alta concentración de niacinamida. Minimiza poros, controla el sebo y refuerza la barrera cutánea en 4 semanas.', 39.00,  'Serum',            'https://picsum.photos/seed/niacinamida/600', ARRAY['https://picsum.photos/seed/niacinamida1/600', 'https://picsum.photos/seed/niacinamida2/600', 'https://picsum.photos/seed/niacinamida3/600']),
    (13, 'Mascarilla de Arcilla Verde','Mascarilla purificante con arcilla verde y extracto de té verde. Absorbe exceso de grasa y deja la piel mate y fresca.', 24.50,  'Mascarilla',       'https://picsum.photos/seed/arcilla/600',     ARRAY['https://picsum.photos/seed/arcilla1/600', 'https://picsum.photos/seed/arcilla2/600', 'https://picsum.photos/seed/arcilla3/600']),
    (14, 'Kit Anti-Edad Premium',      'Pack de lujo: serum retinol, crema firming y contorno de ojos. Rutina completa anti-edad con resultados visibles en 30 días.', 149.00, 'Kit',              'https://picsum.photos/seed/kitanti/600',     ARRAY['https://picsum.photos/seed/kitanti1/600', 'https://picsum.photos/seed/kitanti2/600', 'https://picsum.photos/seed/kitanti3/600']),
    (15, 'Crema Corporal Manteca de Karité', 'Crema corporal densa y nutritiva con manteca de karité y aceite de almendras. Ideal para piel seca y zonas ásperas.', 29.00,  'Crema',            'https://picsum.photos/seed/corporal/600',    ARRAY['https://picsum.photos/seed/corporal1/600', 'https://picsum.photos/seed/corporal2/600', 'https://picsum.photos/seed/corporal3/600']),
    (16, 'Limpiador Aceite Bifásico',  'Aceite limpiador bifásico que disuelve maquillaje waterproof y filtro solar. Se transforma en leche al contacto con agua.', 31.00,  'Limpiador',        'https://picsum.photos/seed/bifasico/600',    ARRAY['https://picsum.photos/seed/bifasico1/600', 'https://picsum.photos/seed/bifasico2/600', 'https://picsum.photos/seed/bifasico3/600']);

-- El padre debe existir antes que el hijo: se inserta en orden de nivel
INSERT INTO referidos (id, nombre, nivel, ventas, parent_id) VALUES
    (0,  'Tú',              0, 3200.00, NULL),
    (1,  'Ana García',      1, 1450.00, 0),
    (2,  'Luis Poveda',     1,  980.00, 0),
    (3,  'Marta Sánchez',   1,  560.00, 0),
    (8,  'Andrea Torres',   1,  720.00, 0),
    (9,  'Felipe Ríos',     1,  410.00, 0),
    (4,  'Carlos Ruiz',     2,  620.00, 1),
    (5,  'Sofía León',      2,  510.00, 1),
    (6,  'Marco Díaz',      2,  440.00, 2),
    (12, 'Valeria Mendoza', 2,  290.00, 2),
    (13, 'Jorge Castillo',  2,  320.00, 3),
    (14, 'Ricardo Peña',    2,  265.00, 8),
    (7,  'Diana Paz',       3,  380.00, 4),
    (10, 'Elena Vargas',    3,  210.00, 4),
    (11, 'Pedro Alvarado',  3,  175.00, 5);

-- Sincroniza las secuencias SERIAL con los ids insertados manualmente
SELECT setval(pg_get_serial_sequence('productos', 'id'), (SELECT MAX(id) FROM productos));
SELECT setval(pg_get_serial_sequence('usuarios',  'id'), (SELECT MAX(id) FROM usuarios));

-- Migración 005: datos de demostración DTLC (idempotente).
-- Añade: productos (9..33), cuentas + red de referidos (nodos 8..27), ventas (pedidos),
-- comisiones y liquidaciones de ejemplo. Se aplica UNA sola vez (marca en seed_aplicados).
-- Contraseña de TODAS las cuentas nuevas: 123456
-- Para repetirla desde cero:  DELETE FROM seed_aplicados WHERE nombre = '005_datos_demo';
--   (y limpiar antes los datos con reset_demo_fase4.sql o `docker compose down -v`)

CREATE TABLE IF NOT EXISTS seed_aplicados (
    nombre      VARCHAR(60) PRIMARY KEY,
    aplicado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $seed$
DECLARE
    v_hash      CONSTANT TEXT := '$2a$10$25xR7ldVklwrNocB0WJVf.K2bQDpSGc/Y1nKgVATU8ovRQ/aRwWxK'; -- bcrypt("123456")
    ciudades    CONSTANT TEXT[] := ARRAY['Guayaquil','Quito','Cuenca','Manta','Ambato','Loja','Santa Elena','Riobamba'];
    calles      CONSTANT TEXT[] := ARRAY['Av. 9 de Octubre','Av. Amazonas','Calle Larga','Av. Malecón','Calle Bolívar','Av. de las Américas','Calle Sucre','Av. Universitaria'];
    metodos     CONSTANT TEXT[] := ARRAY['Tarjeta de crédito','Transferencia bancaria','Efectivo contra entrega'];
    buyers      INT[];
    nb          INT;
    i           INT;
    k           INT;
    n_items     INT;
    n_prod      INT;
    uid         INT;
    u_nombre    TEXT;
    u_email     TEXT;
    u_nodo      INT;
    dias        INT;
    v_estado    TEXT;
    v_fecha     TIMESTAMPTZ;
    v_pedido    INT;
    v_total     NUMERIC(12,2);
    pid         INT;
    qty         INT;
    v_precio    NUMERIC(10,2);
    usados      INT[];
    a           RECORD;
    tasas       CONSTANT NUMERIC[] := ARRAY[0.10, 0.05, 0.02];
    v_monto     NUMERIC(12,2);
    v_liq       INT;
    v_suma      NUMERIC(12,2);
BEGIN
    IF EXISTS (SELECT 1 FROM seed_aplicados WHERE nombre = '005_datos_demo') THEN
        RETURN;
    END IF;

    -- =====================================================================
    -- 1) PRODUCTOS  (9..16 = los que ya muestra el frontend; 17..33 = nuevos)
    -- =====================================================================
    INSERT INTO productos (id, nombre, descripcion, precio, categoria, img, galeria, stock, activo)
    SELECT v.id, v.nombre, v.descripcion, v.precio, v.categoria,
           'https://picsum.photos/seed/' || v.semilla || '/600',
           ARRAY['https://picsum.photos/seed/' || v.semilla || '1/600',
                 'https://picsum.photos/seed/' || v.semilla || '2/600',
                 'https://picsum.photos/seed/' || v.semilla || '3/600'],
           v.stock, v.activo
    FROM (VALUES
      ( 9, 'Limpiador Suave Espuma',               'Gel-espuma de limpieza con extracto de avena y glicerina. Elimina impurezas sin resecar y deja la piel suave y equilibrada.', 22.00, 'Limpiador',       'limpiador',   150, true),
      (10, 'Protector Solar FPS 50+',              'Protector solar de amplio espectro, textura ultraligera e invisible. Resistente al agua, ideal para uso diario y clima tropical.', 38.00, 'Protector Solar', 'solar',        90, true),
      (11, 'Aceite Facial de Rosa Mosqueta',       'Aceite 100% puro de rosa mosqueta con vitamina A natural. Regenera, unifica el tono y aporta brillo saludable sin dejar grasa.', 42.00, 'Aceite',          'aceite',       55, true),
      (12, 'Serum Niacinamida 10%',                'Serum de alta concentración de niacinamida. Minimiza poros, controla el sebo y refuerza la barrera cutánea en 4 semanas.', 39.00, 'Serum',           'niacinamida',  75, true),
      (13, 'Mascarilla de Arcilla Verde',          'Mascarilla purificante con arcilla verde y extracto de té verde. Absorbe exceso de grasa y deja la piel mate y fresca.', 24.50, 'Mascarilla',      'arcilla',     100, true),
      (14, 'Kit Anti-Edad Premium',                'Pack de lujo: serum retinol, crema firming y contorno de ojos. Rutina completa anti-edad con resultados visibles en 30 días.', 149.00,'Kit',             'kitanti',      25, true),
      (15, 'Crema Corporal Manteca de Karité',     'Crema corporal densa y nutritiva con manteca de karité y aceite de almendras. Ideal para piel seca y zonas ásperas.', 29.00, 'Crema',           'corporal',    130, true),
      (16, 'Limpiador Aceite Bifásico',            'Aceite limpiador bifásico que disuelve maquillaje waterproof y filtro solar. Se transforma en leche al contacto con agua.', 31.00, 'Limpiador',       'bifasico',     65, true),
      (17, 'Serum Vitamina C 15%',                 'Serum antioxidante con vitamina C estabilizada y ácido ferúlico. Ilumina, unifica el tono y protege del daño ambiental.', 48.00, 'Serum',           'vitaminac',    80, true),
      (18, 'Serum Ácido Hialurónico Triple',       'Tres pesos moleculares de ácido hialurónico para hidratar en profundidad y rellenar líneas finas.', 36.00, 'Serum',           'hialuronico',  95, true),
      (19, 'Crema Antiarrugas de Noche',           'Crema nutritiva de noche con retinol suave y péptidos. Repara mientras duermes y suaviza las arrugas.', 54.00, 'Crema',           'antiarrugas',  60, true),
      (20, 'Crema Hidratante Gel-Agua',            'Textura gel-agua ultraligera con aloe y pepino. Hidratación fresca de 24 horas para pieles mixtas y grasas.', 28.00, 'Crema',           'gelagua',     120, true),
      (21, 'Tónico de Rosas Hidratante',           'Tónico sin alcohol con agua de rosas y glicerina. Equilibra el pH y prepara la piel para el serum.', 19.50, 'Tónico',          'rosas',       110, true),
      (22, 'Tónico Calmante Centella',             'Tónico lenitivo con centella asiática y pantenol. Reduce el enrojecimiento y calma pieles sensibles.', 26.00, 'Tónico',          'centella',     70, true),
      (23, 'Mascarilla Hidratante de Hialurónico', 'Mascarilla en gel de uso nocturno con ácido hialurónico y ceramidas. Despierta con la piel rellena y luminosa.', 27.00, 'Mascarilla',      'mascgel',      85, true),
      (24, 'Mascarilla Exfoliante de Papaya',      'Exfoliación enzimática suave con papaya y piña. Renueva la piel y afina la textura sin irritar.', 23.00, 'Mascarilla',      'papaya',       90, true),
      (25, 'Kit Rutina Piel Grasa',                'Limpiador, tónico, serum de niacinamida y gel hidratante para controlar el brillo y los poros.', 99.00, 'Kit',             'kitgrasa',     40, true),
      (26, 'Kit Viaje Mini Esenciales',            'Cuatro minis de 30 ml (limpiador, tónico, serum y crema) en neceser. Ideal para llevar en la maleta de mano.', 55.00, 'Kit',             'kitviaje',     50, true),
      (27, 'Limpiador Gel Purificante Árbol de Té','Gel limpiador con árbol de té y ácido salicílico. Previene imperfecciones y purifica sin resecar.', 24.00, 'Limpiador',       'arboltea',     95, true),
      (28, 'Agua Micelar 400 ml',                  'Agua micelar desmaquillante todo en uno. Limpia, tonifica y retira maquillaje sin enjuague.', 18.50, 'Limpiador',       'micelar',     140, true),
      (29, 'Protector Solar Facial en Barra FPS 50','Barra práctica para reaplicar sobre el maquillaje. Textura seca, sin residuo blanco.', 34.00, 'Protector Solar', 'solarbarra',   70, true),
      (30, 'Protector Solar Corporal FPS 30',      'Loción corporal de rápida absorción, resistente al agua y a la arena. Frasco familiar de 250 ml.', 29.50, 'Protector Solar', 'solarcuerpo', 100, true),
      (31, 'Aceite de Jojoba Puro',                'Aceite de jojoba prensado en frío, similar al sebo natural. Equilibra, hidrata y es apto para pieles grasas.', 33.00, 'Aceite',          'jojoba',       60, true),
      (32, 'Aceite Corporal de Argán',             'Aceite seco de argán con vitamina E. Nutre cuerpo y cabello, absorción inmediata y acabado satinado.', 36.50, 'Aceite',          'argan',        75, true),
      (33, 'Kit Edición Limitada Navidad',         'Edición limitada descontinuada (producto inactivo de ejemplo para probar activar/desactivar en el panel admin).', 89.00, 'Kit',             'kitnavidad',   12, false)
    ) AS v(id, nombre, descripcion, precio, categoria, semilla, stock, activo)
    ON CONFLICT (id) DO NOTHING;

    PERFORM setval(pg_get_serial_sequence('productos', 'id'), (SELECT MAX(id) FROM productos));

    -- =====================================================================
    -- 2) RED DE REFERIDOS  (nodos nuevos 8..27, hasta nivel 5)
    -- =====================================================================
    INSERT INTO referidos (id, nombre, nivel, ventas, saldo, parent_id, codigo) VALUES
      ( 8, 'Andrea Torres',     2, 0, 0,  3, 'ANDREA'),
      ( 9, 'Jorge Mendoza',     2, 0, 0,  3, 'JORGE'),
      (10, 'Valeria Cedeño',    2, 0, 0,  2, 'VALERIA'),
      (11, 'Fernando Salazar',  2, 0, 0,  2, 'FERNANDO'),
      (12, 'Paola Intriago',    3, 0, 0,  5, 'PAOLA'),
      (13, 'Esteban Loor',      3, 0, 0,  5, 'ESTEBAN'),
      (14, 'Camila Vera',       3, 0, 0,  6, 'CAMILA'),
      (15, 'Daniel Zambrano',   3, 0, 0,  4, 'DANIEL'),
      (16, 'Gabriela Mora',     4, 0, 0,  7, 'GABRIELA'),
      (17, 'Ricardo Pincay',    4, 0, 0,  7, 'RICARDO'),
      (18, 'Karla Bravo',       3, 0, 0,  8, 'KARLA'),
      (19, 'Mateo Quishpe',     3, 0, 0,  8, 'MATEO'),
      (20, 'Lucía Armijos',     3, 0, 0,  9, 'LUCIA'),
      (21, 'Santiago Cruz',     3, 0, 0, 10, 'SANTIAGO'),
      (22, 'Natalia Ortiz',     3, 0, 0, 11, 'NATALIA'),
      (23, 'Andrés Villacís',   4, 0, 0, 12, 'ANDRES'),
      (24, 'Isabela Franco',    4, 0, 0, 15, 'ISABELA'),
      (25, 'Bryan Macías',      5, 0, 0, 16, 'BRYAN'),
      (26, 'Mónica Reyes',      4, 0, 0, 18, 'MONICA'),
      (27, 'Henry Chávez',      4, 0, 0, 21, 'HENRY')
    ON CONFLICT (id) DO NOTHING;

    PERFORM setval('referidos_id_seq', (SELECT MAX(id) FROM referidos) + 1, false);

    -- =====================================================================
    -- 3) CUENTAS  (clave 123456)
    --    · una cuenta por cada nodo de la red (1..27)
    --    · gerente@dtlc.com  -> segundo administrador
    --    · invitado@dtlc.com -> cliente SIN red (no genera comisiones)
    --    · suspendido@dtlc.com -> cuenta desactivada (el login debe rechazarla)
    -- =====================================================================
    INSERT INTO usuarios (email, password, rol, token, nombre, activo, referido_id)
    SELECT v.email, v_hash, v.rol, '', v.nombre, v.activo, v.nodo
    FROM (VALUES
      ('ana@dtlc.com',        'cliente', 'Ana García',        true,  1),
      ('luis@dtlc.com',       'cliente', 'Luis Poveda',       true,  2),
      ('marta@dtlc.com',      'cliente', 'Marta Sánchez',     true,  3),
      ('carlos@dtlc.com',     'cliente', 'Carlos Ruiz',       true,  4),
      ('sofia@dtlc.com',      'cliente', 'Sofía León',        true,  5),
      ('marco@dtlc.com',      'cliente', 'Marco Díaz',        true,  6),
      ('diana@dtlc.com',      'cliente', 'Diana Paz',         true,  7),
      ('andrea@dtlc.com',     'cliente', 'Andrea Torres',     true,  8),
      ('jorge@dtlc.com',      'cliente', 'Jorge Mendoza',     true,  9),
      ('valeria@dtlc.com',    'cliente', 'Valeria Cedeño',    true, 10),
      ('fernando@dtlc.com',   'cliente', 'Fernando Salazar',  true, 11),
      ('paola@dtlc.com',      'cliente', 'Paola Intriago',    true, 12),
      ('esteban@dtlc.com',    'cliente', 'Esteban Loor',      true, 13),
      ('camila@dtlc.com',     'cliente', 'Camila Vera',       true, 14),
      ('daniel@dtlc.com',     'cliente', 'Daniel Zambrano',   true, 15),
      ('gabriela@dtlc.com',   'cliente', 'Gabriela Mora',     true, 16),
      ('ricardo@dtlc.com',    'cliente', 'Ricardo Pincay',    true, 17),
      ('karla@dtlc.com',      'cliente', 'Karla Bravo',       true, 18),
      ('mateo@dtlc.com',      'cliente', 'Mateo Quishpe',     true, 19),
      ('lucia@dtlc.com',      'cliente', 'Lucía Armijos',     true, 20),
      ('santiago@dtlc.com',   'cliente', 'Santiago Cruz',     true, 21),
      ('natalia@dtlc.com',    'cliente', 'Natalia Ortiz',     true, 22),
      ('andres@dtlc.com',     'cliente', 'Andrés Villacís',   true, 23),
      ('isabela@dtlc.com',    'cliente', 'Isabela Franco',    true, 24),
      ('bryan@dtlc.com',      'cliente', 'Bryan Macías',      true, 25),
      ('monica@dtlc.com',     'cliente', 'Mónica Reyes',      true, 26),
      ('henry@dtlc.com',      'cliente', 'Henry Chávez',      true, 27),
      ('gerente@dtlc.com',    'admin',   'Gerente DTLC',      true,  0),
      ('invitado@dtlc.com',   'cliente', 'Invitado Sin Red',  true, NULL),
      ('suspendido@dtlc.com', 'cliente', 'Cuenta Suspendida', false, NULL)
    ) AS v(email, rol, nombre, activo, nodo)
    ON CONFLICT (email) DO UPDATE SET
        nombre      = CASE WHEN COALESCE(usuarios.nombre, '') = '' THEN EXCLUDED.nombre ELSE usuarios.nombre END,
        referido_id = COALESCE(usuarios.referido_id, EXCLUDED.referido_id);

    -- =====================================================================
    -- 4) VENTAS: 60 pedidos repartidos en ~90 días (determinista, sin azar)
    --    · cancelado  -> no descuenta stock y sus comisiones quedan 'revertida'
    --    · resto      -> descuenta stock, suma ventas al nodo y reparte 10/5/2 %
    -- =====================================================================
    SELECT array_agg(id ORDER BY id) INTO buyers
    FROM usuarios
    WHERE rol = 'cliente' AND activo AND email <> 'suspendido@dtlc.com';
    nb := COALESCE(array_length(buyers, 1), 0);
    SELECT COUNT(*) INTO n_prod FROM productos WHERE activo;

    IF nb > 0 THEN
    FOR i IN 1..60 LOOP
        uid := buyers[1 + ((i * 7) % nb)];
        SELECT COALESCE(nombre, email), email, referido_id INTO u_nombre, u_email, u_nodo FROM usuarios WHERE id = uid;

        dias    := ((60 - i) * 145) / 100;
        v_fecha := now() - make_interval(days => dias, hours => (i * 5) % 24, mins => (i * 13) % 60);

        IF dias >= 21 THEN
            v_estado := CASE WHEN i % 9 = 0 THEN 'cancelado' ELSE 'entregado' END;
        ELSIF dias >= 10 THEN
            v_estado := CASE WHEN i % 7 = 0 THEN 'cancelado' WHEN i % 3 = 0 THEN 'enviado' ELSE 'entregado' END;
        ELSIF dias >= 4 THEN
            v_estado := CASE WHEN i % 2 = 0 THEN 'enviado' ELSE 'preparando' END;
        ELSE
            v_estado := CASE WHEN i % 2 = 0 THEN 'pendiente' ELSE 'preparando' END;
        END IF;

        INSERT INTO pedidos (usuario_id, cliente_nombre, cliente_email, direccion, ciudad, telefono,
                             metodo_pago, total, estado, comisiones_calculadas, created_at)
        VALUES (uid, u_nombre, u_email,
                calles[1 + (i % array_length(calles, 1))] || ' ' || (100 + i * 7),
                ciudades[1 + ((i * 3) % array_length(ciudades, 1))],
                '09' || lpad(((i * 7919011) % 100000000)::text, 8, '0'),
                metodos[1 + (i % 3)], 0, v_estado, TRUE, v_fecha)
        RETURNING id INTO v_pedido;

        -- Items: 1 a 3 productos distintos, 1 a 3 unidades cada uno (solo productos activos)
        n_items := 1 + (i % 3);
        usados  := ARRAY[]::INT[];
        v_total := 0;
        FOR k IN 1..n_items LOOP
            SELECT id, precio INTO pid, v_precio FROM productos
            WHERE activo AND id <> ALL (usados)
            ORDER BY id OFFSET ((i * 3 + k * 7) % n_prod) LIMIT 1;
            IF pid IS NULL THEN
                SELECT id, precio INTO pid, v_precio FROM productos WHERE activo AND id <> ALL (usados) ORDER BY id LIMIT 1;
            END IF;
            EXIT WHEN pid IS NULL;
            usados := usados || pid;
            qty    := 1 + ((i + k) % 3);

            INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (v_pedido, pid, qty, v_precio);
            v_total := v_total + v_precio * qty;
            IF v_estado <> 'cancelado' THEN
                UPDATE productos SET stock = GREATEST(stock - qty, 0) WHERE id = pid;
            END IF;
            pid := NULL;
        END LOOP;
        UPDATE pedidos SET total = v_total WHERE id = v_pedido;

        -- Comisiones (3 niveles ascendentes), solo si el comprador pertenece a la red
        IF u_nodo IS NOT NULL THEN
            IF v_estado <> 'cancelado' THEN
                UPDATE referidos SET ventas = ventas + v_total WHERE id = u_nodo;
            END IF;
            FOR a IN
                WITH RECURSIVE asc_ AS (
                    SELECT parent_id AS id, 1 AS dist FROM referidos WHERE id = u_nodo AND parent_id IS NOT NULL
                    UNION ALL
                    SELECT r.parent_id, x.dist + 1 FROM referidos r JOIN asc_ x ON r.id = x.id
                    WHERE r.parent_id IS NOT NULL AND x.dist < 3
                )
                SELECT id, dist FROM asc_ ORDER BY dist
            LOOP
                v_monto := round(v_total * tasas[a.dist], 2);
                INSERT INTO comisiones (pedido_id, referido_id, nivel, porcentaje, monto, estado, created_at)
                VALUES (v_pedido, a.id, a.dist, tasas[a.dist], v_monto,
                        CASE WHEN v_estado = 'cancelado' THEN 'revertida' ELSE 'pendiente' END, v_fecha);
                IF v_estado <> 'cancelado' THEN
                    UPDATE referidos SET saldo = saldo + v_monto WHERE id = a.id;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
    END IF;

    -- =====================================================================
    -- 5) LIQUIDACIONES: se pagan las comisiones de pedidos con más de 30 días
    --    de los 6 primeros nodos de la red (el resto queda 'pendiente').
    -- =====================================================================
    FOR a IN SELECT id FROM referidos WHERE id BETWEEN 0 AND 5 ORDER BY id LOOP
        SELECT COALESCE(SUM(monto), 0) INTO v_suma
        FROM comisiones WHERE referido_id = a.id AND estado = 'pendiente' AND created_at < now() - interval '30 days';
        CONTINUE WHEN v_suma <= 0;

        INSERT INTO liquidaciones (referido_id, total, estado, creado_en, pagada_en)
        VALUES (a.id, v_suma, 'pagada', now() - interval '28 days', now() - interval '28 days')
        RETURNING id INTO v_liq;

        UPDATE comisiones SET estado = 'pagada', liquidacion_id = v_liq
        WHERE referido_id = a.id AND estado = 'pendiente' AND created_at < now() - interval '30 days';

        UPDATE referidos SET saldo = GREATEST(saldo - v_suma, 0) WHERE id = a.id;
    END LOOP;

    -- Escenarios de stock para probar el panel admin y el checkout
    UPDATE productos SET stock = 4 WHERE id = 25;  -- stock bajo
    UPDATE productos SET stock = 0 WHERE id = 26;  -- agotado

    INSERT INTO seed_aplicados (nombre) VALUES ('005_datos_demo');
END
$seed$;

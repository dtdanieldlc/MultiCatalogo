-- Migración 006 v2: UNA imagen distinta por producto (id % 24).
-- Pool Unsplash verificado. Actualiza TODOS los productos.

WITH pool AS (
  SELECT * FROM (VALUES
    (0,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop'),
    (1,  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop'),
    (2,  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop'),
    (3,  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=600&fit=crop'),
    (4,  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop'),
    (5,  'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&h=600&fit=crop'),
    (6,  'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop'),
    (7,  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop'),
    (8,  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop'),
    (9,  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&h=600&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&h=600&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=600&h=600&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=600&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&h=600&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1506617420156-8e4536971650?w=600&h=600&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=600&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=600&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=600&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop'),
    (22, 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&h=600&fit=crop'),
    (23, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop')
  ) AS t(idx, url)
),
gal AS (
  SELECT * FROM (VALUES
    (0, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop'),
    (1, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=600&fit=crop'),
    (2, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop')
  ) AS g(idx, url)
)
UPDATE productos p
SET
  img = (SELECT url FROM pool WHERE idx = (p.id % 24)),
  galeria = ARRAY[
    (SELECT url FROM pool WHERE idx = (p.id % 24)),
    (SELECT url FROM gal WHERE idx = (p.id % 3)),
    (SELECT url FROM gal WHERE idx = ((p.id + 1) % 3))
  ];

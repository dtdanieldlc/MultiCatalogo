-- Migración 006: imágenes reales de cosméticos (reemplaza picsum / URLs incorrectas).
-- Fotos Unsplash verificadas (HTTP 200). Idempotente.

UPDATE productos SET img = CASE
  WHEN categoria ILIKE '%serum%' OR nombre ILIKE '%serum%' OR nombre ILIKE '%retinol%'
    OR nombre ILIKE '%niacinamida%' OR nombre ILIKE '%vitamina c%'
    THEN 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%crema%' OR nombre ILIKE '%crema%' OR nombre ILIKE '%contorno%'
    OR nombre ILIKE '%corporal%' OR nombre ILIKE '%gel-agua%' OR nombre ILIKE '%cremita%'
    THEN 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%tónico%' OR categoria ILIKE '%tonico%' OR nombre ILIKE '%tónico%'
    OR nombre ILIKE '%tonico%' OR nombre ILIKE '%exfoliante%'
    THEN 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%mascarilla%' OR nombre ILIKE '%mascarilla%' OR nombre ILIKE '%arcilla%'
    OR nombre ILIKE '%papaya%'
    THEN 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%limpiador%' OR nombre ILIKE '%limpiador%' OR nombre ILIKE '%micelar%'
    OR nombre ILIKE '%espuma%' OR nombre ILIKE '%bifásico%' OR nombre ILIKE '%bifasico%'
    THEN 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%protector%' OR nombre ILIKE '%solar%' OR nombre ILIKE '%fps%'
    THEN 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%aceite%' OR nombre ILIKE '%aceite%' OR nombre ILIKE '%jojoba%'
    OR nombre ILIKE '%argán%' OR nombre ILIKE '%argan%' OR nombre ILIKE '%rosa mosqueta%'
    THEN 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=600&fit=crop'
  WHEN categoria ILIKE '%kit%' OR nombre ILIKE '%kit%' OR nombre ILIKE '%maquillaje%'
    OR nombre ILIKE '%beute%' OR nombre ILIKE '%l-beute%'
    THEN 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=600&fit=crop'
END
WHERE img LIKE '%picsum.photos%'
   OR img LIKE '%encrypted-tbn%'
   OR img IS NULL
   OR img = ''
   OR img LIKE '%loreal%'
   OR img LIKE '%grupobillingham%'
   OR img LIKE '%lbeaute%'
   OR img LIKE '%gstatic%';

UPDATE productos SET galeria = ARRAY[
  img,
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=600&fit=crop'
]
WHERE cardinality(COALESCE(galeria, '{}')) = 0
   OR COALESCE(galeria[1], '') LIKE '%picsum.photos%'
   OR COALESCE(galeria[1], '') = '';

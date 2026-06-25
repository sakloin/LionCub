-- ════════════════════════════════════════════════════════════════════════
-- Sync products.image_url from product_images for any product that has
-- gallery images but an empty image_url field.
--
-- This fixes a data consistency gap: products added via the gallery system
-- (product_images table) after 2026-06-11 may have gallery images stored
-- in product_images but an empty products.image_url field if the admin
-- uploaded images but never re-saved the product form.
--
-- Priority:  is_primary image > lowest sort_order image
-- Safe to run multiple times (only updates rows where image_url IS NULL or empty).
-- ════════════════════════════════════════════════════════════════════════

UPDATE public.products p
SET image_url = (
  SELECT pi.url
  FROM public.product_images pi
  WHERE pi.product_id = p.id
  ORDER BY pi.is_primary DESC, pi.sort_order ASC
  LIMIT 1
)
WHERE (p.image_url IS NULL OR p.image_url = '')
  AND EXISTS (
    SELECT 1 FROM public.product_images pi2
    WHERE pi2.product_id = p.id
  );

-- Show which products were updated
SELECT id, name, image_url AS new_image_url
FROM public.products
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND image_url NOT LIKE '/products/%'
ORDER BY id;

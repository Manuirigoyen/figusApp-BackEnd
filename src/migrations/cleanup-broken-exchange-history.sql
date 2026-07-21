-- Limpieza de historial de intercambios con figurita ofrecida irrecuperable (NULL).
-- Ejecutar en Supabase → SQL Editor.
-- ⚠️ IRREVERSIBLE: hacé primero el SELECT de preview y revisá los resultados.

-- ─────────────────────────────────────────────
-- 1) PREVIEW: qué se va a borrar (solo mirar)
-- ─────────────────────────────────────────────
SELECT
  o.id AS offer_id,
  o.status,
  o.offerer_user_id,
  o.offered_sticker_name,
  o.offered_sticker_id,
  o.offer_wallet_id,
  o.request_sticker_name,
  e.id AS exchange_id,
  e.offered_sticker_name AS exchange_offered_name
FROM offers o
LEFT JOIN exchanges e ON e.offer_id = o.id
WHERE
  o.offered_sticker_name IS NULL
  AND o.offered_sticker_id IS NULL
  AND o.offer_wallet_id IS NULL
ORDER BY o.id;

-- ─────────────────────────────────────────────
-- 2) BORRADO (descomentá y ejecutá si el preview está bien)
-- ─────────────────────────────────────────────
-- BEGIN;

-- Paso A: exchanges vinculados a ofertas rotas
-- DELETE FROM exchanges
-- WHERE offer_id IN (
--   SELECT id FROM offers
--   WHERE offered_sticker_name IS NULL
--     AND offered_sticker_id IS NULL
--     AND offer_wallet_id IS NULL
-- );

-- Paso B: ofertas rotas (offer_rejections se borra solo por CASCADE)
-- DELETE FROM offers
-- WHERE offered_sticker_name IS NULL
--   AND offered_sticker_id IS NULL
--   AND offer_wallet_id IS NULL;

-- COMMIT;

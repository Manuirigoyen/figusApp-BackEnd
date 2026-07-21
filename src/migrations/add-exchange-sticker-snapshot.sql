-- Snapshot de figuritas en exchanges (segunda parte del fix de historial)
-- Ejecutar en Supabase SQL Editor si preferís no usar npm run migration:run

ALTER TABLE exchanges
  ADD COLUMN IF NOT EXISTS offered_sticker_id INTEGER,
  ADD COLUMN IF NOT EXISTS offered_sticker_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS received_sticker_id INTEGER,
  ADD COLUMN IF NOT EXISTS received_sticker_name VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exchanges_offered_sticker_id_fkey'
  ) THEN
    ALTER TABLE exchanges
      ADD CONSTRAINT exchanges_offered_sticker_id_fkey
      FOREIGN KEY (offered_sticker_id) REFERENCES stickers(id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exchanges_received_sticker_id_fkey'
  ) THEN
    ALTER TABLE exchanges
      ADD CONSTRAINT exchanges_received_sticker_id_fkey
      FOREIGN KEY (received_sticker_id) REFERENCES stickers(id);
  END IF;
END $$;

-- Desde wallet del exchange (si aún existe)
UPDATE exchanges e
SET
  offered_sticker_id = sw.sticker_id,
  offered_sticker_name = s.name
FROM stickers_wallet sw
JOIN stickers s ON s.id = sw.sticker_id
WHERE e.offered_wallet_id = sw.id
  AND (e.offered_sticker_id IS NULL OR e.offered_sticker_name IS NULL);

UPDATE exchanges e
SET
  received_sticker_id = sw.sticker_id,
  received_sticker_name = s.name
FROM stickers_wallet sw
JOIN stickers s ON s.id = sw.sticker_id
WHERE e.received_wallet_id = sw.id
  AND (e.received_sticker_id IS NULL OR e.received_sticker_name IS NULL);

-- Desde la oferta vinculada
UPDATE exchanges e
SET
  offered_sticker_id = o.offered_sticker_id,
  offered_sticker_name = o.offered_sticker_name
FROM offers o
WHERE e.offer_id = o.id
  AND (e.offered_sticker_id IS NULL OR e.offered_sticker_name IS NULL)
  AND o.offered_sticker_name IS NOT NULL;

UPDATE exchanges e
SET
  received_sticker_id = o.request_sticker_id,
  received_sticker_name = o.request_sticker_name
FROM offers o
WHERE e.offer_id = o.id
  AND (e.received_sticker_id IS NULL OR e.received_sticker_name IS NULL)
  AND o.request_sticker_name IS NOT NULL;

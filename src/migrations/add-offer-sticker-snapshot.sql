-- Preserva nombres de figuritas en el historial de intercambios
-- Ejecutar una vez en la base de datos antes de desplegar el backend actualizado.

ALTER TABLE offers
  ADD COLUMN IF NOT EXISTS offered_sticker_id INTEGER,
  ADD COLUMN IF NOT EXISTS offered_sticker_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS request_sticker_name VARCHAR(255);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'offers_offered_sticker_id_fkey'
  ) THEN
    ALTER TABLE offers
      ADD CONSTRAINT offers_offered_sticker_id_fkey
      FOREIGN KEY (offered_sticker_id) REFERENCES stickers(id);
  END IF;
END $$;

-- Rellenar datos existentes desde wallet (ofertas que aún tienen offer_wallet_id)
UPDATE offers o
SET
  offered_sticker_id = sw.sticker_id,
  offered_sticker_name = s.name
FROM stickers_wallet sw
JOIN stickers s ON s.id = sw.sticker_id
WHERE o.offer_wallet_id = sw.id
  AND (o.offered_sticker_id IS NULL OR o.offered_sticker_name IS NULL);

-- Rellenar nombres de figuritas solicitadas
UPDATE offers o
SET request_sticker_name = s.name
FROM stickers s
WHERE o.request_sticker_id = s.id
  AND o.request_sticker_name IS NULL;

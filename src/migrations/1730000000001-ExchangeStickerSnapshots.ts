import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExchangeStickerSnapshots1730000000001
  implements MigrationInterface
{
  name = 'ExchangeStickerSnapshots1730000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exchanges
        ADD COLUMN IF NOT EXISTS offered_sticker_id INTEGER,
        ADD COLUMN IF NOT EXISTS offered_sticker_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS received_sticker_id INTEGER,
        ADD COLUMN IF NOT EXISTS received_sticker_name VARCHAR(255);
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
      UPDATE exchanges e
      SET
        offered_sticker_id = sw.sticker_id,
        offered_sticker_name = s.name
      FROM stickers_wallet sw
      JOIN stickers s ON s.id = sw.sticker_id
      WHERE e.offered_wallet_id = sw.id
        AND (e.offered_sticker_id IS NULL OR e.offered_sticker_name IS NULL);
    `);

    await queryRunner.query(`
      UPDATE exchanges e
      SET
        received_sticker_id = sw.sticker_id,
        received_sticker_name = s.name
      FROM stickers_wallet sw
      JOIN stickers s ON s.id = sw.sticker_id
      WHERE e.received_wallet_id = sw.id
        AND (e.received_sticker_id IS NULL OR e.received_sticker_name IS NULL);
    `);

    await queryRunner.query(`
      UPDATE exchanges e
      SET
        offered_sticker_id = o.offered_sticker_id,
        offered_sticker_name = o.offered_sticker_name
      FROM offers o
      WHERE e.offer_id = o.id
        AND (e.offered_sticker_id IS NULL OR e.offered_sticker_name IS NULL)
        AND o.offered_sticker_name IS NOT NULL;
    `);

    await queryRunner.query(`
      UPDATE exchanges e
      SET received_sticker_name = o.request_sticker_name
      FROM offers o
      WHERE e.offer_id = o.id
        AND e.received_sticker_name IS NULL
        AND o.request_sticker_name IS NOT NULL;
    `);

    await queryRunner.query(`
      UPDATE exchanges e
      SET received_sticker_id = o.request_sticker_id
      FROM offers o
      WHERE e.offer_id = o.id
        AND e.received_sticker_id IS NULL
        AND o.request_sticker_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE exchanges DROP CONSTRAINT IF EXISTS exchanges_offered_sticker_id_fkey;
    `);
    await queryRunner.query(`
      ALTER TABLE exchanges DROP CONSTRAINT IF EXISTS exchanges_received_sticker_id_fkey;
    `);
    await queryRunner.query(`
      ALTER TABLE exchanges
        DROP COLUMN IF EXISTS offered_sticker_id,
        DROP COLUMN IF EXISTS offered_sticker_name,
        DROP COLUMN IF EXISTS received_sticker_id,
        DROP COLUMN IF EXISTS received_sticker_name;
    `);
  }
}

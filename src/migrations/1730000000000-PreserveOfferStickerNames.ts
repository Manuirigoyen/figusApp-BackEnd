import { MigrationInterface, QueryRunner } from 'typeorm';

export class PreserveOfferStickerNames1730000000000
  implements MigrationInterface
{
  name = 'PreserveOfferStickerNames1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE offers
        ADD COLUMN IF NOT EXISTS offered_sticker_id INTEGER,
        ADD COLUMN IF NOT EXISTS offered_sticker_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS request_sticker_name VARCHAR(255);
    `);

    await queryRunner.query(`
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
    `);

    await queryRunner.query(`
      UPDATE offers o
      SET
        offered_sticker_id = sw.sticker_id,
        offered_sticker_name = s.name
      FROM stickers_wallet sw
      JOIN stickers s ON s.id = sw.sticker_id
      WHERE o.offer_wallet_id = sw.id
        AND (o.offered_sticker_id IS NULL OR o.offered_sticker_name IS NULL);
    `);

    await queryRunner.query(`
      UPDATE offers o
      SET request_sticker_name = s.name
      FROM stickers s
      WHERE o.request_sticker_id = s.id
        AND o.request_sticker_name IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_offered_sticker_id_fkey;
    `);
    await queryRunner.query(`
      ALTER TABLE offers
        DROP COLUMN IF EXISTS offered_sticker_id,
        DROP COLUMN IF EXISTS offered_sticker_name,
        DROP COLUMN IF EXISTS request_sticker_name;
    `);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTopicTable1687298255838 implements MigrationInterface {
  name = 'CreateTopicTable1687298255838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "topics" (
                "id" SERIAL NOT NULL,
                "title" character varying(100) NOT NULL,
                "user_id" integer NOT NULL,
                CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "topics_title_user_key" ON "topics" ("title", "user_id")
        `);
    await queryRunner.query(`
            ALTER TABLE "topics"
            ADD CONSTRAINT "FK_d6c99a7b01054f5178882192940" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "topics" DROP CONSTRAINT "FK_d6c99a7b01054f5178882192940"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."topics_title_user_key"
        `);
    await queryRunner.query(`
            DROP TABLE "topics"
        `);
  }
}

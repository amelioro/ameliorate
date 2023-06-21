import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1687294693169 implements MigrationInterface {
  name = 'CreateUserTable1687294693169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL,
                "username" character varying(39) NOT NULL,
                "auth_id" character varying NOT NULL,
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "users_auth_id_key" ON "users" ("auth_id")
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "users_username_key" ON "users" ("username")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "public"."users_username_key"
        `);
    await queryRunner.query(`
            DROP INDEX "public"."users_auth_id_key"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
  }
}

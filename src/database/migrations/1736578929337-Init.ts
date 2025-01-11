import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1736578929337 implements MigrationInterface {
    name = 'Init1736578929337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "originalUrl" character varying NOT NULL, "driveFileId" character varying NOT NULL, "fileName" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file"`);
    }

}

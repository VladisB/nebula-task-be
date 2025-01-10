import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1736505840996 implements MigrationInterface {
    name = 'Init1736505840996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file_entity" ("id" SERIAL NOT NULL, "originalUrl" character varying NOT NULL, "driveFileId" character varying NOT NULL, "fileName" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_d8375e0b2592310864d2b4974b2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "file_entity"`);
    }

}

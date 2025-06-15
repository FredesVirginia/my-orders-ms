import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderSubTotal1750022848555 implements MigrationInterface {
    name = 'OrderSubTotal1750022848555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "subTotal" numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "subTotal"`);
    }

}

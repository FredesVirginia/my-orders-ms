import { MigrationInterface, QueryRunner } from "typeorm";

export class CouponChangeDate1750358159430 implements MigrationInterface {
    name = 'CouponChangeDate1750358159430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupon" DROP COLUMN "validUntil"`);
        await queryRunner.query(`ALTER TABLE "coupon" ADD "validUntil" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "coupon" DROP COLUMN "validUntil"`);
        await queryRunner.query(`ALTER TABLE "coupon" ADD "validUntil" TIMESTAMP`);
    }

}

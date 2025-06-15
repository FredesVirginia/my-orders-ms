import { MigrationInterface, QueryRunner } from "typeorm";

export class OrderAndCoupon1750008036795 implements MigrationInterface {
    name = 'OrderAndCoupon1750008036795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" ADD "coupon_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_baced9282892a60354aaa789fb4" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_baced9282892a60354aaa789fb4"`);
        await queryRunner.query(`ALTER TABLE "order" DROP COLUMN "coupon_id"`);
    }

}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRole1700000000001 implements MigrationInterface {
  name = 'AddAdminRole1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const enumName = 'admin_role_enum';
    const enumExists = await queryRunner.query(
      `SELECT 1 FROM pg_type WHERE typname = '${enumName.replace(/'/g, "''")}'`,
    );
    if (!enumExists.length) {
      await queryRunner.query(`CREATE TYPE "${enumName}" AS ENUM ('ADMIN','SUPER_ADMIN')`);
    }

    const hasRoleColumn = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role'`,
    );
    if (!hasRoleColumn.length) {
      await queryRunner.query(
        `ALTER TABLE "admins" ADD COLUMN "role" "${enumName}" NOT NULL DEFAULT 'ADMIN'`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasRoleColumn = await queryRunner.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role'`,
    );
    if (hasRoleColumn.length) {
      await queryRunner.query('ALTER TABLE "admins" DROP COLUMN "role"');
    }

    const enumExists = await queryRunner.query("SELECT 1 FROM pg_type WHERE typname = 'admin_role_enum'");
    if (enumExists.length) {
      await queryRunner.query('DROP TYPE "admin_role_enum"');
    }
  }
}

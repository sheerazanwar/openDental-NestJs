import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const ensureEnum = async (name: string, definitionSql: string) => {
      const existing = await queryRunner.query(
        `SELECT 1 FROM pg_type WHERE typname = '${name.replace(/'/g, "''")}'`,
      );
      if (!existing.length) {
        await queryRunner.query(definitionSql);
      }
    };

    const ensureTable = async (table: Table) => {
      const exists = await queryRunner.hasTable(table.name);
      if (!exists) {
        await queryRunner.createTable(table);
      }
    };

    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await ensureEnum(
      'appointment_status_enum',
      "CREATE TYPE \"appointment_status_enum\" AS ENUM('SCHEDULED','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW')",
    );
    await ensureEnum(
      'eligibility_status_enum',
      "CREATE TYPE \"eligibility_status_enum\" AS ENUM('PENDING','APPROVED','REJECTED')",
    );
    await ensureEnum(
      'claim_status_enum',
      "CREATE TYPE \"claim_status_enum\" AS ENUM('NOT_SUBMITTED','SUBMITTED','IN_REVIEW','APPROVED','REJECTED','PAID')",
    );
    await ensureEnum(
      'payment_status_enum',
      "CREATE TYPE \"payment_status_enum\" AS ENUM('PENDING','PARTIALLY_PAID','PAID','FAILED')",
    );
    await ensureEnum('user_type_enum', "CREATE TYPE \"user_type_enum\" AS ENUM('ADMIN','CLINIC')");
    await ensureEnum(
      'activity_action_enum',
      "CREATE TYPE \"activity_action_enum\" AS ENUM('LOGIN','LOGOUT','CREATE','UPDATE','DELETE','POLL','SYSTEM')",
    );

    await ensureTable(
      new Table({
        name: 'admins',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'character varying',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'passwordHash',
            type: 'character varying',
            isNullable: false,
          },
          {
            name: 'fullName',
            type: 'character varying',
            isNullable: false,
          },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'clinics',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          { name: 'name', type: 'character varying', isUnique: true },
          { name: 'addressLine1', type: 'character varying' },
          { name: 'addressLine2', type: 'character varying', isNullable: true },
          { name: 'city', type: 'character varying' },
          { name: 'state', type: 'character varying' },
          { name: 'postalCode', type: 'character varying' },
          { name: 'country', type: 'character varying' },
          { name: 'contactEmail', type: 'character varying' },
          { name: 'contactPhone', type: 'character varying' },
          {
            name: 'timezone',
            type: 'character varying',
            default: "'America/New_York'",
          },
          { name: 'openDentalApiKey', type: 'character varying', isNullable: true },
          { name: 'openDentalApiSecret', type: 'character varying', isNullable: true },
          { name: 'adminId', type: 'uuid' },
        ],
        foreignKeys: [
          {
            columnNames: ['adminId'],
            referencedTableName: 'admins',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'patients',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'externalId', type: 'character varying', isUnique: true },
          { name: 'firstName', type: 'character varying' },
          { name: 'lastName', type: 'character varying' },
          { name: 'birthDate', type: 'date', isNullable: true },
          { name: 'email', type: 'character varying', isNullable: true },
          { name: 'phoneNumber', type: 'character varying', isNullable: true },
          { name: 'clinicId', type: 'uuid' },
        ],
        foreignKeys: [
          {
            columnNames: ['clinicId'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
            onDelete: 'NO ACTION',
            onUpdate: 'NO ACTION',
          },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'appointments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'externalAptId', type: 'character varying', isUnique: true },
          { name: 'clinicId', type: 'uuid' },
          { name: 'patientId', type: 'uuid' },
          { name: 'scheduledStart', type: 'timestamp with time zone' },
          { name: 'scheduledEnd', type: 'timestamp with time zone' },
          {
            name: 'status',
            type: 'enum',
            enumName: 'appointment_status_enum',
            enum: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            default: "'SCHEDULED'",
          },
          { name: 'reason', type: 'character varying', isNullable: true },
          { name: 'notes', type: 'character varying', isNullable: true },
          {
            name: 'eligibilityStatus',
            type: 'enum',
            enumName: 'eligibility_status_enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
          },
          { name: 'eligibilityDetails', type: 'text', isNullable: true },
          { name: 'insuranceCoverageAmount', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'patientResponsibilityAmount', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'discountAmount', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'operatory', type: 'character varying', isNullable: true },
          { name: 'providerName', type: 'character varying', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['clinicId'],
            referencedTableName: 'clinics',
            referencedColumnNames: ['id'],
          },
          {
            columnNames: ['patientId'],
            referencedTableName: 'patients',
            referencedColumnNames: ['id'],
          },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'claims',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'externalClaimId', type: 'character varying', isUnique: true },
          { name: 'clinicId', type: 'uuid' },
          { name: 'patientId', type: 'uuid' },
          { name: 'appointmentId', type: 'uuid' },
          {
            name: 'status',
            type: 'enum',
            enumName: 'claim_status_enum',
            enum: ['NOT_SUBMITTED', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PAID'],
            default: "'NOT_SUBMITTED'",
          },
          { name: 'amountBilled', type: 'numeric', precision: 12, scale: 2 },
          { name: 'amountApproved', type: 'numeric', precision: 12, scale: 2, isNullable: true },
          { name: 'rejectionReason', type: 'character varying', isNullable: true },
          { name: 'notes', type: 'character varying', isNullable: true },
          { name: 'metadata', type: 'text', isNullable: true },
          { name: 'lastPolledAt', type: 'timestamp with time zone', isNullable: true },
        ],
        uniques: [
          {
            name: 'UQ_claims_appointmentId',
            columnNames: ['appointmentId'],
          },
        ],
        foreignKeys: [
          { columnNames: ['clinicId'], referencedTableName: 'clinics', referencedColumnNames: ['id'] },
          { columnNames: ['patientId'], referencedTableName: 'patients', referencedColumnNames: ['id'] },
          { columnNames: ['appointmentId'], referencedTableName: 'appointments', referencedColumnNames: ['id'] },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'clinicId', type: 'uuid' },
          { name: 'claimId', type: 'uuid' },
          { name: 'amount', type: 'numeric', precision: 12, scale: 2 },
          {
            name: 'status',
            type: 'enum',
            enumName: 'payment_status_enum',
            enum: ['PENDING', 'PARTIALLY_PAID', 'PAID', 'FAILED'],
            default: "'PENDING'",
          },
          { name: 'method', type: 'character varying', isNullable: true },
          { name: 'externalPaymentId', type: 'character varying', isNullable: true },
          { name: 'receivedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'metadata', type: 'text', isNullable: true },
        ],
        uniques: [
          {
            name: 'UQ_payments_claimId',
            columnNames: ['claimId'],
          },
        ],
        foreignKeys: [
          { columnNames: ['clinicId'], referencedTableName: 'clinics', referencedColumnNames: ['id'] },
          { columnNames: ['claimId'], referencedTableName: 'claims', referencedColumnNames: ['id'] },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'userType', type: 'enum', enumName: 'user_type_enum', enum: ['ADMIN', 'CLINIC'] },
          { name: 'userId', type: 'character varying' },
          { name: 'refreshTokenHash', type: 'character varying', isUnique: true },
          { name: 'expiresAt', type: 'timestamp with time zone' },
          { name: 'userAgent', type: 'character varying', isNullable: true },
          { name: 'ipAddress', type: 'character varying', isNullable: true },
          { name: 'revokedAt', type: 'timestamp with time zone', isNullable: true },
          { name: 'adminId', type: 'uuid', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['adminId'],
            referencedTableName: 'admins',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
    );

    await ensureTable(
      new Table({
        name: 'activity_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'createdAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp with time zone', default: 'CURRENT_TIMESTAMP' },
          { name: 'userType', type: 'enum', enumName: 'user_type_enum', enum: ['ADMIN', 'CLINIC'] },
          { name: 'userId', type: 'character varying' },
          {
            name: 'action',
            type: 'enum',
            enumName: 'activity_action_enum',
            enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'POLL', 'SYSTEM'],
          },
          { name: 'metadata', type: 'text', isNullable: true },
          { name: 'ipAddress', type: 'character varying', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const dropIfExists = async (table: string) => {
      const exists = await queryRunner.hasTable(table);
      if (exists) {
        await queryRunner.dropTable(table);
      }
    };

    const dropEnumIfExists = async (name: string) => {
      const existing = await queryRunner.query(
        `SELECT 1 FROM pg_type WHERE typname = '${name.replace(/'/g, "''")}'`,
      );
      if (existing.length) {
        await queryRunner.query(`DROP TYPE "${name}"`);
      }
    };

    await dropIfExists('activity_logs');
    await dropIfExists('sessions');
    await dropIfExists('payments');
    await dropIfExists('claims');
    await dropIfExists('appointments');
    await dropIfExists('patients');
    await dropIfExists('clinics');
    await dropIfExists('admins');

    await dropEnumIfExists('activity_action_enum');
    await dropEnumIfExists('user_type_enum');
    await dropEnumIfExists('payment_status_enum');
    await dropEnumIfExists('claim_status_enum');
    await dropEnumIfExists('eligibility_status_enum');
    await dropEnumIfExists('appointment_status_enum');
  }
}

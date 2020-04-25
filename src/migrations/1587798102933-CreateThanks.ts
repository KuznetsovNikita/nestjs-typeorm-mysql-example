import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialMigration1587798102933 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.createTable(new Table({
        name: "thanks",
        columns: [
            { name: "id", type: "VARCHAR(23)", isPrimary: true, isNullable: false },
            { name: "fromUserId", type: "VARCHAR(16)", isNullable: true },
            { name: "toUserId", type: "VARCHAR(16)" },
            { name: "reason", type: "TEXT" }
        ]
      }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.dropDatabase(`testdb`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class LoadTestData1587798483304 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
      
      for(let user = 1; user <= 2; user++) {
        for(let reason = 0; reason <= 15; reason++) {
          const toUserId = `user-id-${user}`;
          const id = `${toUserId}#${reason.toString().padStart(6, '0')}`;
          await queryRunner.query(`INSERT INTO testdb.thanks VALUES('${id}', null, '${toUserId}', CONCAT('reason-', ${reason}))`);
          ;
        }
      }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
      await queryRunner.query(`DELETE FROM testdb.thanks`);
    }

}

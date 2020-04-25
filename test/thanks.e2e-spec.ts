import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import * as supertest from 'supertest';
import { Repository } from "typeorm";
import { Thanks } from "../src/thanks/thanks.entity";
import { ThanksModule } from "../src/thanks/thanks.module";

describe('ThanksModule', () => {

  const testConfig: TypeOrmModuleOptions = {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'testuser',
    password: 'testpassword',
    database: 'testdb',
    entities: ['./**/*.entity.ts'],
    synchronize: true
  }; 
  describe('POST /add', () => {
    let app: INestApplication;
    let repository: Repository<Thanks>;
    
    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ThanksModule,
          TypeOrmModule.forRoot(testConfig),
          TypeOrmModule.forFeature([Thanks])
        ]
      }).compile();
      app = module.createNestApplication();
      repository = module.get('ThanksRepository')
      await app.init();
    });
  
    afterAll(async () => {
      await app.close();
      await repository.query('DELETE FROM thanks WHERE toUserId = "test-user";');
    });
  
    beforeEach(async () => {
      await repository.query('DELETE FROM thanks WHERE toUserId = "test-user";');
    });
  
    it('Should add thank', async () => {
  
      const { body } = await supertest.agent(app.getHttpServer())
        .post('/add')
        .send({ from: null, to: 'test-user', reason: 'some-reason'})
        .expect(201);
      
      expect(body.id).toBe('test-user#000000');
      expect(body.toUserId).toBe('test-user');
      expect(body.reason).toBe('some-reason');
    });
  
    it('Should add 5 thanks at the same time', async () => {
      const result = await Promise.all([1, 2, 3, 4, 5]
        .map(index => supertest.agent(app.getHttpServer())
          .post('/add')
          .send({ from: null, to: 'test-user', reason: 'some-reason-' + index})
          .expect(201)
        )
      );
      console.log(result.map(item => item.body));
      
      const count = await repository.count({ toUserId: 'test-user'});
      expect(count).toBe(5);
    });
  });

  describe('GET /list', () => {
    let app: INestApplication;
    let repository: Repository<Thanks>;
    
    beforeAll(async () => {
      const module = await Test.createTestingModule({
        imports: [
          ThanksModule,
          TypeOrmModule.forRoot(testConfig),
          TypeOrmModule.forFeature([Thanks])
        ]
      }).compile();
      app = module.createNestApplication();
      repository = module.get('ThanksRepository')
      await app.init();

      await repository.query('DELETE FROM thanks WHERE toUserId = "test-user";');
      // Pre-populate the DB with some dummy thanks
      await supertest.agent(app.getHttpServer()).post('/add')
        .send({ from: null, to: 'test-user', reason: 'some-reason-1'})
      await supertest.agent(app.getHttpServer()).post('/add')
        .send({ from: null, to: 'test-user', reason: 'some-reason-2'})
      await supertest.agent(app.getHttpServer()).post('/add')
        .send({ from: null, to: 'test-user', reason: 'some-reason-3'})
    });
  
    afterAll(async () => {
      await app.close();
      await repository.query('DELETE FROM thanks WHERE toUserId = "test-user";');
    });
    
    it('Should return thanks by id', async () => {
      const { body } = await supertest(app.getHttpServer())
        .get('/list?id=test-user')
        .expect(200);

      expect(body.total).toBe(3);
      expect(body.nextCursor).toBeNull();
    });

    it('Should return thanks by id and page', async () => {
      const { body } = await supertest(app.getHttpServer())
        .get('/list?id=test-user&perPage=2')
        .expect(200);

      expect(body.total).toBe(3);
      expect(body.items.length).toBe(2);
      expect(body.items[0].id).toBe('test-user#000002');
      expect(body.items[1].id).toBe('test-user#000001');
      expect(body.nextCursor).not.toBeNull();
    });

    it('Should return thanks by cursor', async () => {
      const { body: { nextCursor } } = await supertest(app.getHttpServer())
        .get('/list?id=test-user&perPage=2')
        .expect(200);

      const { body } = await supertest(app.getHttpServer())
        .get(`/list?id=test-user&perPage=2&cursor=${nextCursor}`)
        .expect(200);

      expect(body.total).toBe(3);
      expect(body.items.length).toBe(1);
      expect(body.items[0].id).toBe('test-user#000000');
      expect(body.nextCursor).toBeNull();
    })
  });
});

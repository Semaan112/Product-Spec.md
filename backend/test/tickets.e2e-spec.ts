import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { afterAll, beforeAll, describe, it } from '@jest/globals';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Ticket Service Request Flow (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should DENY request if user is not AGENT (403 Forbidden)', () => {
    return request(app.getHttpServer())
      .patch('/tickets/TCK-101/status')
      .set('x-user-role', 'REQUESTER')
      .send({ status: 'IN_PROGRESS' })
      .expect(403);
  });

  it('should REJECT invalid payload (400 Bad Request)', () => {
    return request(app.getHttpServer())
      .patch('/tickets/TCK-101/status')
      .set('x-user-role', 'AGENT')
      .send({ status: 'INVALID_STATUS_VALUE' })
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
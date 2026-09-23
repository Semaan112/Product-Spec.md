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
      .set('x-user-id', 'requester-001')
      .send({ status: 'IN_PROGRESS' })
      .expect(403);
  });

  it('should UPDATE status for an authorized AGENT (200 OK)', () => {
    return request(app.getHttpServer())
      .patch('/tickets/TCK-101/status')
      .set('x-user-role', 'AGENT')
      .set('x-user-id', 'agent-001')
      .send({ status: 'IN_PROGRESS' })
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe('TCK-101');
        expect(body.status).toBe('IN_PROGRESS');
      });
  });

  it('should REJECT invalid payload (400 Bad Request)', () => {
    return request(app.getHttpServer())
      .patch('/tickets/TCK-101/status')
      .set('x-user-role', 'AGENT')
      .set('x-user-id', 'agent-001')
      .send({ status: 'INVALID_STATUS_VALUE' })
      .expect(400);
  });

  it('should return NOT FOUND for an unknown ticket', () => {
    return request(app.getHttpServer())
      .patch('/tickets/TCK-999/status')
      .set('x-user-role', 'AGENT')
      .set('x-user-id', 'agent-001')
      .send({ status: 'IN_PROGRESS' })
      .expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
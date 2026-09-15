import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketStatus } from './enums/ticket-status.enum';

describe('Ticket Database Integration Test', () => {
  let repo: Repository<Ticket>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Ticket],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Ticket]),
      ],
    }).compile();

    repo = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
  });

  it('should persist and retrieve a ticket record', async () => {
    const ticket = repo.create({ id: 'TCK-999', status: TicketStatus.OPEN });
    await repo.save(ticket);

    const retrieved = await repo.findOne({ where: { id: 'TCK-999' } });
    expect(retrieved).toBeDefined();
    expect(retrieved?.status).toBe(TicketStatus.OPEN);
  });
});
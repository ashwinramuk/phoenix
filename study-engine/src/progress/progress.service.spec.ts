import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgressService } from './progress.service';
import { Progress } from './entities/progress.entity';

// Unit tests for the SM-2 spaced-repetition logic — no database required.
describe('ProgressService (spaced repetition)', () => {
  let service: ProgressService;
  let store: Progress | null;

  const repo = {
    findOne: jest.fn(async () => store),
    create: jest.fn(
      (x: Partial<Progress>) =>
        ({ ease: 2.5, intervalDays: 0, repetitions: 0, status: 'new', ...x }) as Progress,
    ),
    save: jest.fn(async (p: Progress) => {
      store = p;
      return p;
    }),
    find: jest.fn(),
  };

  beforeEach(async () => {
    store = null;
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: getRepositoryToken(Progress), useValue: repo },
      ],
    }).compile();
    service = moduleRef.get(ProgressService);
  });

  it('schedules 1 day out after a first good review', async () => {
    const p = await service.review(1, 5);
    expect(p.repetitions).toBe(1);
    expect(p.intervalDays).toBe(1);
    expect(p.nextDueAt).toBeInstanceOf(Date);
  });

  it('resets interval and repetitions on a failing grade (<3)', async () => {
    store = { ease: 2.5, intervalDays: 20, repetitions: 5, status: 'review' } as Progress;
    const p = await service.review(1, 1);
    expect(p.repetitions).toBe(0);
    expect(p.intervalDays).toBe(1);
  });

  it('grows the interval and reaches "mastered" on repeated good reviews', async () => {
    let p = await service.review(1, 5); // rep 1 → interval 1
    p = await service.review(1, 5); // rep 2 → interval 6
    expect(p.intervalDays).toBe(6);
    p = await service.review(1, 5); // rep 3 → interval round(6 * ease)
    expect(p.intervalDays).toBeGreaterThan(6);
    expect(p.status).toBe('mastered');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';

describe('CalendarService', () => {
  let service: CalendarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarService],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get calendar events', async () => {
    const calendarId = 'hallysonhugo17@gmail.com';
    const events = await service.getEventsFromCalendar(calendarId);
    expect(events).toBeDefined();
    expect(Array.isArray(events)).toBe(true);
  }, 20000); // Increased timeout for the test

  //same test with more timeout
});

import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { PwnedService } from './pwned.service';
import { EvaluatePasswordDto } from './dto/evaluate-password.dto';

describe('PasswordService', () => {
  let service: PasswordService;
  let pwnedService: jest.Mocked<PwnedService>;

  beforeEach(async () => {
    const mockPwnedService = {
      isPasswordPwned: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        { provide: PwnedService, useValue: mockPwnedService },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
    pwnedService = module.get(PwnedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return score 0 and critical warning if password is pwned', async () => {
    pwnedService.isPasswordPwned.mockResolvedValue(true);
    const dto: EvaluatePasswordDto = { password: 'Password123' };

    const result = await service.evaluate(dto);

    expect(result.score).toBe(0);
    expect(result.isStrongEnough).toBe(false);

    expect(result.feedback.warning).toContain('data breaches');
  });

  it('should penalize password if it contains the username', async () => {
    pwnedService.isPasswordPwned.mockResolvedValue(false);
    const dto: EvaluatePasswordDto = {
      username: 'okenobi',
      password: 'okenobi123',
    };

    const result = await service.evaluate(dto);

    expect(result.score).toBeLessThan(3);
    expect(result.isStrongEnough).toBe(false);
  });

  it('should evaluate a strong password correctly', async () => {
    pwnedService.isPasswordPwned.mockResolvedValue(false);
    const dto: EvaluatePasswordDto = {
      email: 'user@example.com',
      password: 'Tr0ub4dour&3_Unpredictable!',
    };

    const result = await service.evaluate(dto);

    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.isStrongEnough).toBe(true);
    expect(result.feedback.suggestions).toContain('Excellent password! Highly secure.');
  });
  it('should evaluate password successfully even if username and email are not provided', async () => {
    pwnedService.isPasswordPwned.mockResolvedValue(false);
    const dto: EvaluatePasswordDto = {
      password: 'Tr0ub4dour&3_Unpredictable!',
    };

    const result = await service.evaluate(dto);

    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.isStrongEnough).toBe(true);
    expect(result.feedback.suggestions).toContain('Excellent password! Highly secure.');
  });

  it('should penalize password heavily if it consists only of the email prefix', async () => {
    pwnedService.isPasswordPwned.mockResolvedValue(false);
    const dto: EvaluatePasswordDto = {
      email: 'jedi.master@example.com',
      password: 'jedi.master',
    };

    const result = await service.evaluate(dto);

    expect(result.score).toBeLessThan(3);
    expect(result.isStrongEnough).toBe(false);
    expect(result.feedback.warning).toContain('very weak and predictable');
  });
});
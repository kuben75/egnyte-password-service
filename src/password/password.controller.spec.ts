import { Test, TestingModule } from '@nestjs/testing';
import { PasswordController } from './password.controller';
import { PasswordService } from './password.service';
import { EvaluatePasswordDto } from './dto/evaluate-password.dto';

describe('PasswordController', () => {
  let controller: PasswordController;
  let service: jest.Mocked<PasswordService>;

  beforeEach(async () => {
    const mockPasswordService = {
      evaluate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordController],
      providers: [
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    controller = module.get<PasswordController>(PasswordController);
    service = module.get(PasswordService);
  });

  it('should call evaluate on the service and return the result', async () => {
    const dto: EvaluatePasswordDto = { password: 'TestPassword123!' };
    const expectedResult = {
      score: 4,
      isStrongEnough: true,
      feedback: { warning: '', suggestions: ['Excellent password! Highly secure.'] }
    };

    service.evaluate.mockResolvedValue(expectedResult);

    const result = await controller.evaluatePassword(dto);


    expect(result).toEqual(expectedResult);
    expect(service.evaluate).toHaveBeenCalledWith(dto);
    expect(service.evaluate).toHaveBeenCalledTimes(1);
  });
});
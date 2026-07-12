import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordService } from './password.service';
import { EvaluatePasswordDto } from './dto/evaluate-password.dto';
import { PasswordEvaluationResult } from './interfaces/evaluation-result.interface';

@ApiTags('Password Security')
@Controller('password')
export class PasswordController {

  constructor (private readonly passwordService: PasswordService) {}

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate password strength',
    description: 'Evaluates the password strength and provides feedback on how to improve it. Checks for weaknesses such as common passwords, dictionary words, and user inputs (username and email).',
  })
  @ApiResponse({
    status: 200,
    description: 'Password evaluated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  public async evaluatePassword(@Body() evaluatePasswordDto: EvaluatePasswordDto): Promise<PasswordEvaluationResult> {
    return this.passwordService.evaluate(evaluatePasswordDto);
  }
}

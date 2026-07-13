import { Injectable } from '@nestjs/common';
import { EvaluatePasswordDto } from './dto/evaluate-password.dto';
import { PasswordEvaluationResult } from './interfaces/evaluation-result.interface';
import zxcvbn from 'zxcvbn';
import { PwnedService } from './pwned.service';

/**
 * Service for evaluating password strength
 *
 * @remarks
 * uses zxcvbn lib to calculate entropy and provides user inputs as a custom dictionary
 * to punish passwords containing email or username parts.
 * Integrates with PwnedService to check for known data breaches
 * Implements policy that requires strong passwords to contain at least one number and one special character.
 */

@Injectable()
export class PasswordService {
  constructor(private readonly pwnedService: PwnedService) {}

  public async evaluate(dto: EvaluatePasswordDto): Promise<PasswordEvaluationResult> {
    const isPwned = await this.pwnedService.isPasswordPwned(dto.password);
    if (isPwned) {
      return this.getPwnedResult();
    }

    const userDictionary = this.buildUserDictionary(dto)
    const analysis = zxcvbn(dto.password, userDictionary);

    const finalScore = this.applyComplexityPolicy(analysis.score, dto.password)
    const isStrongEnough = finalScore >= 3;

    return {
      score: finalScore,
      isStrongEnough: isStrongEnough,
      feedback: this.generateFeedback(finalScore, analysis)
    }
  }

  private getPwnedResult(): PasswordEvaluationResult {
    return {
      score: 0,
      isStrongEnough: false,
      feedback: {
        warning: 'This password has been found in known data breaches and should not be used.',
        suggestions: ['Please choose a different password.']
      }
    };
  }

  private buildUserDictionary(dto: EvaluatePasswordDto): string[] {
    const dictionary: string[] = ['egnyte', `egnyte${new Date().getFullYear()}`];
    if (dto.username) dictionary.push(dto.username);
    if (dto.email) dictionary.push(dto.email, dto.email.split('@')[0]);
    return dictionary;
  }

  private applyComplexityPolicy(baseScore: number, password: string): number {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9\s]/.test(password);

    if (baseScore === 4 && (!hasNumber || !hasSpecialChar)) {
      return 3;
    }
    return baseScore;
  }

  private generateFeedback(score: number, analysis: ReturnType<typeof zxcvbn>) {
    let defaultWarning = '';
    let defaultSuggestions: string[] = [];

    switch (score) {
      case 0:
      case 1:
        defaultWarning = 'Password is very weak and predictable.';
        defaultSuggestions = ['Add multiple unrelated words, numbers, and special symbols.'];
        break;
      case 2:
        defaultWarning = 'Password is okay, but vulnerable to dictionary attacks.';
        defaultSuggestions = ['Consider making it longer or adding unexpected characters.'];
        break;
      case 3:
        defaultWarning = score < analysis.score ? 'Password is long, but lacks character variety.' : '';
        defaultSuggestions = ['Good password, but you can always improve security by adding more length.'];
        break;
      case 4:
        defaultWarning = '';
        defaultSuggestions = ['Excellent password! Highly secure.'];
        break;
    }

    return {
      warning: analysis.feedback.warning || defaultWarning,
      suggestions: analysis.feedback.suggestions?.length > 0
          ? analysis.feedback.suggestions
          : defaultSuggestions,
    };
  }
}

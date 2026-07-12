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
 */

@Injectable()
export class PasswordService {

  constructor(private readonly pwnedService: PwnedService) {}

  public async evaluate(dto: EvaluatePasswordDto): Promise<PasswordEvaluationResult> {

    const isPwned = await this.pwnedService.isPasswordPwned(dto.password);

    if(isPwned) {
      return {
        score: 0,
        isStrongEnough: false,
        feedback: {
          warning: 'This password has beed found in known data breaches and should not be used',
          suggestions: ['Please choose a different password.']
        }
      }
    }

    const userDictionary = [] as string[];

    if(dto.username) {
      userDictionary.push(dto.username);
    }

    if(dto.email) {
      userDictionary.push(dto.email, dto.email.split('@')[0]);
    }
    const analysis = zxcvbn(dto.password, userDictionary);
    const isStrongEnough = analysis.score >= 3;

    let defaultWarning = '';
    let defaultSuggestions = [] as string[];

    switch (analysis.score) {
      case 0:
      case 1:
        defaultWarning = 'Password is very weak and predictable.';
        defaultSuggestions = ['Add multiple unrelated words, numbers, and special symbols.']
        break;
      case 2:
        defaultWarning = 'Password is okay, but vulnerable to dictionary attacks.';
        defaultSuggestions = ['Consider making it longer or adding unexpected characters.'];
        break;
      case 3:
        defaultWarning = '';
        defaultSuggestions = ['Good password, but you can always improve security by adding more length.'];
        break;
      case 4:
        defaultWarning = '';
        defaultSuggestions = ['Excellent password! Highly secure.'];
        break;
    }
    return {
      score: analysis.score,
      isStrongEnough: isStrongEnough,
      feedback: {
        warning: analysis.feedback.warning || defaultWarning,
        suggestions: analysis.feedback.suggestions && analysis.feedback.suggestions.length > 0
        ? analysis.feedback.suggestions
        : defaultSuggestions
      }
    }

  }
}

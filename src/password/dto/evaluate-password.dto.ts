import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString, Matches, MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO for evaluating password strength
 *
 * @remarks
 * This DTO is used to validate the input data for evaluating password strength.
 * It includes optional fields for username and email, which are used to check if the password contains these values.
 * The password field is required and must be at least 12 characters long.
 */

export class EvaluatePasswordDto {
  @ApiPropertyOptional({
    description:
      'The username associated with the account. Used to check if the password contains the username.',
    example: 'okenobi',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description:
      'The user email adress. Used to punish passwords that include email parts',
    example: 'o.kenobi@jedi-council.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email address'})
  email?: string;

  @ApiProperty({
    description: 'Password string to be evaluated.',
    example: 'Hello there!',
    minLength: 12,
  })
  @IsNotEmpty({ message: 'Password cannot be empty.'})
  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 character long.'})
  @MaxLength(128, { message: 'Password must be at most 128 character long.'})
  @Matches(/.*\S.*/, { message: 'Password cannot consist of only whitespaces.' })
  password: string;
}

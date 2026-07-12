import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
/**
 * Service for checking if a password has been pwned
 *
 * @remarks
 * uses the Have I Been Pwned API to check if a password has been exposed in a data breach
 */

@Injectable()
export class PwnedService {
  private readonly logger = new Logger(PwnedService.name);

  public async isPasswordPwned(password: string): Promise<boolean> {

    try {
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const response = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
      if(!response.ok) {
        this.logger.error(`Failed to fetch pwned passwords: ${response.statusText}`);
        return false;
      }
      const data = await response.text();

      const hashes = data.split('\n');
      const suffix = hash.slice(5);
      for (const h of hashes) {
        if(h.split(':')[0] === suffix) {
          return true;
        }
      }
        return false;
    }catch (e) {
    this.logger.error(`Error checking password: ${e instanceof Error ? e.message : 'Unknown error'}`);
    return false;
    }
  }
}
import crypto from 'crypto';

export class PaytmChecksum {
  private static iv = '@@@@&&&&####$$$$';

  static encrypt(src: string, key: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, this.iv);
    let encrypted = cipher.update(src, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  static decrypt(src: string, key: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, this.iv);
    let decrypted = decipher.update(src, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static generateSignature(params: string | Record<string, any>, key: string): string {
    let data = '';
    if (typeof params === 'string') {
      data = params;
    } else {
      data = this.getStringByParams(params);
    }
    const salt = this.generateRandomString(4);
    const sha256 = crypto.createHash('sha256').update(data + '|' + salt).digest('hex');
    const hashString = sha256 + salt;
    return this.encrypt(hashString, key);
  }

  static verifySignature(params: string | Record<string, any>, key: string, checksum: string): boolean {
    let data = '';
    if (typeof params === 'string') {
      data = params;
    } else {
      data = this.getStringByParams(params);
    }
    try {
      const decrypted = this.decrypt(checksum, key);
      const salt = decrypted.substring(decrypted.length - 4);
      const expectedChecksum = decrypted.substring(0, decrypted.length - 4);
      const sha256 = crypto.createHash('sha256').update(data + '|' + salt).digest('hex');
      return expectedChecksum === sha256;
    } catch (e) {
      return false;
    }
  }

  static generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  static getStringByParams(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    return sortedKeys
      .map((key) => {
        const val = params[key];
        return val !== null && val !== undefined && val !== 'null' && val !== 'undefined'
          ? `${key}=${val}`
          : '';
      })
      .filter(Boolean)
      .join('|');
  }
}

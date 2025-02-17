import {Injectable} from '@angular/core';
import {LOWER_CASE, NUMERIC, SPECIAL_CHARS, UPPER_CASE} from '../consts/password.const';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  public getItem<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (data != null) {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Parsing error:', error);
        return null;
      }
    }
    return null;
  }

  public setItem(key: string, data: object | string) {
    if (typeof data === 'string') {
      localStorage.setItem(key, data);
    }
    localStorage.setItem(key, JSON.stringify(data));
  }

  public removeItem(key: string) {
    localStorage.removeItem(key);
  }
}

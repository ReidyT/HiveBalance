import {inject, Injectable} from '@angular/core';
import {LOWER_CASE, NUMERIC, SPECIAL_CHARS, UPPER_CASE} from '../consts/password.const';
import {CacheService} from './cache.service';

const ACCESS_TOKEN_KEY = 'access_token' as const;
const REFRESH_TOKEN_KEY = 'refresh_token' as const;

@Injectable({
  providedIn: 'root'
})
export class JwtCacheService {

  private cache = inject(CacheService);

  public getAccessToken() {
    return this.cache.getItem<string>(ACCESS_TOKEN_KEY);
  }

  public getRefreshToken() {
    return this.cache.getItem<string>(REFRESH_TOKEN_KEY);
  }

  public synchronizeAccessToken(accessToken: string | null) {
    this.synchronizeCacheItem(accessToken, ACCESS_TOKEN_KEY);
  }

  public synchronizeRefreshToken(refreshToken: string | null) {
    this.synchronizeCacheItem(refreshToken, REFRESH_TOKEN_KEY);
  }

  private synchronizeCacheItem(value: string | null, key: string) {
    if (!value) {
      this.cache.removeItem(key);
    } else if (value && value !== this.cache.getItem(key)) {
      this.cache.setItem(key, value);
    }
  }
}

import { LRUCache } from 'lru-cache';
import { IUser } from '../models/User';

// Cache for storing user objects (TTL: 15 minutes)
// Key: userId string
export const userCache = new LRUCache<string, IUser>({
  max: 1000,
  ttl: 1000 * 60 * 15, // 15 mins
});

// Cache for storing daily usage rewrite counts (TTL: 1 hour)
// Key: 'userId-YYYY-MM-DD'
export const usageCache = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour
});

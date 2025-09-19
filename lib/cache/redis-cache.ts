import { Redis } from "@upstash/redis";

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache configuration
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
} as const;

// Cache key generators
export const cacheKeys = {
  farmers: {
    list: (params: Record<string, any>) => `farmers:list:${JSON.stringify(params)}`,
    detail: (id: number) => `farmers:detail:${id}`,
    search: (query: string) => `farmers:search:${query}`,
  },
  procurements: {
    list: (params: Record<string, any>) => `procurements:list:${JSON.stringify(params)}`,
    detail: (id: number) => `procurements:detail:${id}`,
  },
  processingBatches: {
    list: (params: Record<string, any>) => `processing-batches:list:${JSON.stringify(params)}`,
    detail: (id: number) => `processing-batches:detail:${id}`,
  },
  sales: {
    list: (params: Record<string, any>) => `sales:list:${JSON.stringify(params)}`,
    detail: (id: number) => `sales:detail:${id}`,
  },
  users: {
    list: (params: Record<string, any>) => `users:list:${JSON.stringify(params)}`,
    detail: (id: number) => `users:detail:${id}`,
  },
} as const;

// Cache utility functions
export class CacheService {
  // Get data from cache
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data as T | null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // Set data in cache with TTL
  static async set<T>(
    key: string,
    data: T,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // Delete data from cache
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  // Delete multiple keys with pattern
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error("Cache delete pattern error:", error);
    }
  }

  // Invalidate cache for a specific entity type
  static async invalidateEntity(entityType: keyof typeof cacheKeys): Promise<void> {
    try {
      const patterns = Object.values(cacheKeys[entityType]).map(key => 
        typeof key === 'function' ? key.toString().split(':')[0] + ':*' : key + '*'
      );
      
      for (const pattern of patterns) {
        await this.delPattern(pattern);
      }
    } catch (error) {
      console.error("Cache invalidate entity error:", error);
    }
  }

  // Get or set pattern for caching
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch data
      const data = await fetcher();
      
      // Store in cache
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error("Cache getOrSet error:", error);
      // If cache fails, still try to fetch data
      return await fetcher();
    }
  }

  // Cache with tags for easier invalidation
  static async setWithTags<T>(
    key: string,
    data: T,
    tags: string[],
    ttl: number = CACHE_TTL.MEDIUM
  ): Promise<void> {
    try {
      // Store the data
      await this.set(key, data, ttl);
      
      // Store tags for this key
      for (const tag of tags) {
        await redis.sadd(`cache:tags:${tag}`, key);
        await redis.expire(`cache:tags:${tag}`, ttl);
      }
    } catch (error) {
      console.error("Cache setWithTags error:", error);
    }
  }

  // Invalidate cache by tags
  static async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const keys = await redis.smembers(`cache:tags:${tag}`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        await redis.del(`cache:tags:${tag}`);
      }
    } catch (error) {
      console.error("Cache invalidateByTags error:", error);
    }
  }
}

// React Query cache integration
export const queryCacheConfig = {
  // Default stale time for different types of data
  staleTime: {
    farmers: CACHE_TTL.MEDIUM * 1000,
    procurements: CACHE_TTL.MEDIUM * 1000,
    processingBatches: CACHE_TTL.MEDIUM * 1000,
    sales: CACHE_TTL.MEDIUM * 1000,
    users: CACHE_TTL.LONG * 1000,
  },
  
  // Cache time (how long to keep unused data)
  cacheTime: {
    farmers: CACHE_TTL.LONG * 1000,
    procurements: CACHE_TTL.LONG * 1000,
    processingBatches: CACHE_TTL.LONG * 1000,
    sales: CACHE_TTL.LONG * 1000,
    users: CACHE_TTL.VERY_LONG * 1000,
  },
};

// Cache invalidation helpers for mutations
export const cacheInvalidation = {
  // Invalidate farmers cache
  farmers: {
    onCreate: () => CacheService.invalidateEntity('farmers'),
    onUpdate: (id: number) => CacheService.del(cacheKeys.farmers.detail(id)),
    onDelete: (id: number) => {
      CacheService.del(cacheKeys.farmers.detail(id));
      CacheService.invalidateEntity('farmers');
    },
    onBulkDelete: () => CacheService.invalidateEntity('farmers'),
  },
  
  // Invalidate procurements cache
  procurements: {
    onCreate: () => CacheService.invalidateEntity('procurements'),
    onUpdate: (id: number) => CacheService.del(cacheKeys.procurements.detail(id)),
    onDelete: (id: number) => {
      CacheService.del(cacheKeys.procurements.detail(id));
      CacheService.invalidateEntity('procurements');
    },
  },
  
  // Invalidate processing batches cache
  processingBatches: {
    onCreate: () => CacheService.invalidateEntity('processingBatches'),
    onUpdate: (id: number) => CacheService.del(cacheKeys.processingBatches.detail(id)),
    onDelete: (id: number) => {
      CacheService.del(cacheKeys.processingBatches.detail(id));
      CacheService.invalidateEntity('processingBatches');
    },
  },
  
  // Invalidate sales cache
  sales: {
    onCreate: () => CacheService.invalidateEntity('sales'),
    onUpdate: (id: number) => CacheService.del(cacheKeys.sales.detail(id)),
    onDelete: (id: number) => {
      CacheService.del(cacheKeys.sales.detail(id));
      CacheService.invalidateEntity('sales');
    },
  },
  
  // Invalidate users cache
  users: {
    onCreate: () => CacheService.invalidateEntity('users'),
    onUpdate: (id: number) => CacheService.del(cacheKeys.users.detail(id)),
    onDelete: (id: number) => {
      CacheService.del(cacheKeys.users.detail(id));
      CacheService.invalidateEntity('users');
    },
  },
};

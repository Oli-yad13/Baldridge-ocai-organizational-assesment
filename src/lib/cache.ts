import { AggregateData } from './aggregation'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache keys
  static getAggregatesKey(surveyId: string): string {
    return `aggregates:${surveyId}`
  }

  static getSurveyKey(surveyId: string): string {
    return `survey:${surveyId}`
  }

  static getOrganizationKey(orgId: string): string {
    return `organization:${orgId}`
  }

  static getReportKey(surveyId: string, reportType: string): string {
    return `report:${surveyId}:${reportType}`
  }
}

export const cache = new CacheService()

// Analytics service
export class AnalyticsService {
  static async trackSurveyStart(surveyId: string, userId?: string): Promise<void> {
    try {
      // In production, send to analytics service
      console.log('Analytics: Survey started', { surveyId, userId, timestamp: new Date() })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  static async trackSurveyComplete(surveyId: string, userId?: string, duration?: number): Promise<void> {
    try {
      // In production, send to analytics service
      console.log('Analytics: Survey completed', { surveyId, userId, duration, timestamp: new Date() })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  static async trackSurveyAbandon(surveyId: string, userId?: string, step?: string): Promise<void> {
    try {
      // In production, send to analytics service
      console.log('Analytics: Survey abandoned', { surveyId, userId, step, timestamp: new Date() })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  static async trackPageView(page: string, userId?: string): Promise<void> {
    try {
      // In production, send to analytics service
      console.log('Analytics: Page view', { page, userId, timestamp: new Date() })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  static async trackExport(type: string, surveyId: string, userId?: string): Promise<void> {
    try {
      // In production, send to analytics service
      console.log('Analytics: Export', { type, surveyId, userId, timestamp: new Date() })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }
}

// Static generation helper
export class StaticGenerationService {
  static async generateReportPage(surveyId: string): Promise<string> {
    // In production, this would generate static HTML for report pages
    // For now, return a placeholder
    return `Static report page for survey ${surveyId}`
  }

  static async shouldRegenerate(surveyId: string, lastModified: Date): Promise<boolean> {
    // Check if aggregates have changed since last generation
    const cacheKey = CacheService.getAggregatesKey(surveyId)
    const cached = cache.get<{ timestamp: number }>(cacheKey)

    if (!cached) {
      return true
    }

    return new Date(cached.timestamp) < lastModified
  }
}

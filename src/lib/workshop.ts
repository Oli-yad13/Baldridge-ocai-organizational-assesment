import { prisma } from './prisma'
import { INTERVENTIONS, Intervention } from './interventions'

export interface WorkshopData {
  id: string
  surveyId: string
  title: string
  description?: string
  status: string
  facilitatorId?: string
  scheduledAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  sessions: WorkshopSessionData[]
  actions: ActionData[]
}

export interface WorkshopSessionData {
  id: string
  workshopId: string
  title: string
  description?: string
  status: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
  pinnedCharts: PinnedChartData[]
  themes: ThemeData[]
  actions: ActionData[]
}

export interface PinnedChartData {
  id: string
  sessionId: string
  chartType: string
  title: string
  data: any
  position: number
  createdAt: Date
}

export interface ThemeData {
  id: string
  sessionId: string
  title: string
  description: string
  category?: string
  priority: string
  createdAt: Date
  updatedAt: Date
  actions: ActionData[]
}

export interface ActionData {
  id: string
  workshopId: string
  sessionId?: string
  themeId?: string
  title: string
  description?: string
  owner?: string
  status: string
  priority: string
  dueDate?: Date
  completedAt?: Date
  successMetrics?: any
  createdAt: Date
  updatedAt: Date
}

export class WorkshopService {
  /**
   * Create a new workshop
   */
  static async createWorkshop(data: {
    surveyId: string
    title: string
    description?: string
    facilitatorId?: string
    scheduledAt?: Date
  }): Promise<WorkshopData> {
    const workshop = await prisma.workshop.create({
      data: {
        surveyId: data.surveyId,
        title: data.title,
        description: data.description,
        facilitatorId: data.facilitatorId,
        scheduledAt: data.scheduledAt,
        status: 'draft'
      },
      include: {
        sessions: {
          include: {
            pinnedCharts: true,
            themes: {
              include: {
                actions: true
              }
            },
            actions: true
          }
        },
        actions: true
      }
    })

    return this.mapWorkshopData(workshop)
  }

  /**
   * Get workshop by ID
   */
  static async getWorkshop(id: string): Promise<WorkshopData | null> {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        sessions: {
          include: {
            pinnedCharts: true,
            themes: {
              include: {
                actions: true
              }
            },
            actions: true
          }
        },
        actions: true
      }
    })

    return workshop ? this.mapWorkshopData(workshop) : null
  }

  /**
   * Get workshops for a survey
   */
  static async getWorkshopsForSurvey(surveyId: string): Promise<WorkshopData[]> {
    const workshops = await prisma.workshop.findMany({
      where: { surveyId },
      include: {
        sessions: {
          include: {
            pinnedCharts: true,
            themes: {
              include: {
                actions: true
              }
            },
            actions: true
          }
        },
        actions: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return workshops.map(workshop => this.mapWorkshopData(workshop))
  }

  /**
   * Create a workshop session
   */
  static async createSession(data: {
    workshopId: string
    title: string
    description?: string
  }): Promise<WorkshopSessionData> {
    const session = await prisma.workshopSession.create({
      data: {
        workshopId: data.workshopId,
        title: data.title,
        description: data.description,
        status: 'planned'
      },
      include: {
        pinnedCharts: true,
        themes: {
          include: {
            actions: true
          }
        },
        actions: true
      }
    })

    return this.mapSessionData(session)
  }

  /**
   * Pin a chart to a session
   */
  static async pinChart(data: {
    sessionId: string
    chartType: string
    title: string
    data: any
  }): Promise<PinnedChartData> {
    // Get the next position
    const lastChart = await prisma.pinnedChart.findFirst({
      where: { sessionId: data.sessionId },
      orderBy: { position: 'desc' }
    })

    const position = lastChart ? lastChart.position + 1 : 0

    const chart = await prisma.pinnedChart.create({
      data: {
        sessionId: data.sessionId,
        chartType: data.chartType,
        title: data.title,
        data: data.data,
        position
      }
    })

    return this.mapChartData(chart)
  }

  /**
   * Create a theme
   */
  static async createTheme(data: {
    sessionId: string
    title: string
    description: string
    category?: string
    priority?: string
  }): Promise<ThemeData> {
    const theme = await prisma.theme.create({
      data: {
        sessionId: data.sessionId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority || 'medium'
      },
      include: {
        actions: true
      }
    })

    return this.mapThemeData(theme)
  }

  /**
   * Create an action
   */
  static async createAction(data: {
    workshopId: string
    sessionId?: string
    themeId?: string
    title: string
    description?: string
    owner?: string
    priority?: string
    dueDate?: Date
    successMetrics?: any
  }): Promise<ActionData> {
    const action = await prisma.action.create({
      data: {
        workshopId: data.workshopId,
        sessionId: data.sessionId,
        themeId: data.themeId,
        title: data.title,
        description: data.description,
        owner: data.owner,
        priority: data.priority || 'medium',
        dueDate: data.dueDate,
        successMetrics: data.successMetrics,
        status: 'planned'
      }
    })

    return this.mapActionData(action)
  }

  /**
   * Update action status
   */
  static async updateActionStatus(
    id: string, 
    status: string, 
    completedAt?: Date
  ): Promise<ActionData> {
    const action = await prisma.action.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'completed' ? (completedAt || new Date()) : null
      }
    })

    return this.mapActionData(action)
  }

  /**
   * Get recommended interventions based on culture gaps
   */
  static getRecommendedInterventions(
    currentScores: { Clan: number; Adhocracy: number; Market: number; Hierarchy: number },
    preferredScores: { Clan: number; Adhocracy: number; Market: number; Hierarchy: number }
  ): Intervention[] {
    const recommendations: Intervention[] = []
    const threshold = 5 // Minimum gap to recommend intervention

    // Calculate gaps
    const gaps = {
      Clan: preferredScores.Clan - currentScores.Clan,
      Adhocracy: preferredScores.Adhocracy - currentScores.Adhocracy,
      Market: preferredScores.Market - currentScores.Market,
      Hierarchy: preferredScores.Hierarchy - currentScores.Hierarchy
    }

    // Find interventions for significant gaps
    Object.entries(gaps).forEach(([quadrant, gap]) => {
      if (Math.abs(gap) >= threshold) {
        const direction = gap > 0 ? 'increase' : 'decrease'
        const interventions = INTERVENTIONS.filter(
          i => i.quadrant === quadrant.toLowerCase() && i.direction === direction
        )
        recommendations.push(...interventions)
      }
    })

    // Sort by impact and effort
    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      const effortOrder = { low: 3, medium: 2, high: 1 }
      
      const aScore = impactOrder[a.impact] + effortOrder[a.effort]
      const bScore = impactOrder[b.impact] + effortOrder[b.effort]
      
      return bScore - aScore
    })
  }

  /**
   * Get action summary for workshop
   */
  static async getActionSummary(workshopId: string): Promise<{
    total: number
    byStatus: Record<string, number>
    byPriority: Record<string, number>
    overdue: number
    completed: number
  }> {
    const actions = await prisma.action.findMany({
      where: { workshopId }
    })

    const now = new Date()
    const overdue = actions.filter(
      action => action.dueDate && action.dueDate < now && action.status !== 'completed'
    ).length

    const byStatus = actions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byPriority = actions.reduce((acc, action) => {
      acc[action.priority] = (acc[action.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: actions.length,
      byStatus,
      byPriority,
      overdue,
      completed: byStatus.completed || 0
    }
  }

  // Helper methods for data mapping
  private static mapWorkshopData(workshop: any): WorkshopData {
    return {
      id: workshop.id,
      surveyId: workshop.surveyId,
      title: workshop.title,
      description: workshop.description,
      status: workshop.status,
      facilitatorId: workshop.facilitatorId,
      scheduledAt: workshop.scheduledAt,
      completedAt: workshop.completedAt,
      createdAt: workshop.createdAt,
      updatedAt: workshop.updatedAt,
      sessions: workshop.sessions.map((session: any) => this.mapSessionData(session)),
      actions: workshop.actions.map((action: any) => this.mapActionData(action))
    }
  }

  private static mapSessionData(session: any): WorkshopSessionData {
    return {
      id: session.id,
      workshopId: session.workshopId,
      title: session.title,
      description: session.description,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      pinnedCharts: session.pinnedCharts.map((chart: any) => this.mapChartData(chart)),
      themes: session.themes.map((theme: any) => this.mapThemeData(theme)),
      actions: session.actions.map((action: any) => this.mapActionData(action))
    }
  }

  private static mapChartData(chart: any): PinnedChartData {
    return {
      id: chart.id,
      sessionId: chart.sessionId,
      chartType: chart.chartType,
      title: chart.title,
      data: chart.data,
      position: chart.position,
      createdAt: chart.createdAt
    }
  }

  private static mapThemeData(theme: any): ThemeData {
    return {
      id: theme.id,
      sessionId: theme.sessionId,
      title: theme.title,
      description: theme.description,
      category: theme.category,
      priority: theme.priority,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt,
      actions: theme.actions.map((action: any) => this.mapActionData(action))
    }
  }

  private static mapActionData(action: any): ActionData {
    return {
      id: action.id,
      workshopId: action.workshopId,
      sessionId: action.sessionId,
      themeId: action.themeId,
      title: action.title,
      description: action.description,
      owner: action.owner,
      status: action.status,
      priority: action.priority,
      dueDate: action.dueDate,
      completedAt: action.completedAt,
      successMetrics: action.successMetrics,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt
    }
  }
}

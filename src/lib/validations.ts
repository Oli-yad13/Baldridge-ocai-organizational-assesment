import { z } from 'zod'

// User schemas
export const userCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ORG_ADMIN', 'FACILITATOR', 'EMPLOYEE']),
  organizationId: z.string().min(1, 'Organization ID is required'),
})

export const userUpdateSchema = userCreateSchema.partial()

// Organization schemas
export const organizationCreateSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().optional(),
  size: z.string().optional(),
  country: z.string().optional(),
  logoUrl: z.string().url().optional(),
  settings: z.record(z.string(), z.any()).optional(),
})

export const organizationUpdateSchema = organizationCreateSchema.partial()

// Survey schemas
export const surveyCreateSchema = z.object({
  title: z.string().min(1, 'Survey title is required'),
  openAt: z.date().optional(),
  closeAt: z.date().optional(),
  allowAnonymous: z.boolean().default(false),
  requireOrgEmailDomain: z.boolean().default(true),
})

export const surveyUpdateSchema = surveyCreateSchema.partial().extend({
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).optional(),
})

// Response schemas
export const responseCreateSchema = z.object({
  demographics: z.record(z.string(), z.any()).optional(),
  nowScores: z.object({
    clan: z.number().min(0).max(100),
    adhocracy: z.number().min(0).max(100),
    market: z.number().min(0).max(100),
    hierarchy: z.number().min(0).max(100),
  }),
  preferredScores: z.object({
    clan: z.number().min(0).max(100),
    adhocracy: z.number().min(0).max(100),
    market: z.number().min(0).max(100),
    hierarchy: z.number().min(0).max(100),
  }),
})

// Invitation schemas
export const invitationCreateSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  email: z.string().email('Invalid email address'),
})

// Comment schemas
export const commentCreateSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  responseId: z.string().optional(),
  text: z.string().min(1, 'Comment text is required'),
})

// Report schemas
export const reportCreateSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  kind: z.enum(['ORG', 'TEAM', 'CUSTOM_SLICE']),
  payload: z.record(z.string(), z.any()),
})

// OCAI Score validation
export const ocaiScoresSchema = z.object({
  clan: z.number().min(0).max(100),
  adhocracy: z.number().min(0).max(100),
  market: z.number().min(0).max(100),
  hierarchy: z.number().min(0).max(100),
}).refine(
  (scores) => {
    const total = scores.clan + scores.adhocracy + scores.market + scores.hierarchy
    return Math.abs(total - 100) < 0.01 // Allow for small floating point errors
  },
  {
    message: 'OCAI scores must sum to 100',
  }
)

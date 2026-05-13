// Assessment Progress Tracking Utility
// Uses browser localStorage to track assessment progress and completion status

export interface AssessmentProgress {
  assessmentType: 'OCAI' | 'BALDRIGE';
  organizationId: string;
  accessKey: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: {
    currentStep?: number;
    totalSteps?: number;
    percentage?: number;
    data?: any; // Stores partial answers
  };
  timestamps: {
    startedAt?: string;
    lastUpdatedAt?: string;
    completedAt?: string;
    expiresAt?: string; // 7 days from last update for in_progress
  };
}

const PROGRESS_EXPIRATION_DAYS = 7;

// Generate unique storage key for assessment
function getStorageKey(assessmentType: string, organizationId: string, userId: string): string {
  return `assessment_progress_${assessmentType}_${organizationId}_${userId}`;
}

// Save assessment progress
export function saveAssessmentProgress(progress: AssessmentProgress): void {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PROGRESS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    const progressData: AssessmentProgress = {
      ...progress,
      timestamps: {
        ...progress.timestamps,
        lastUpdatedAt: now.toISOString(),
        expiresAt: progress.status === 'completed' ? undefined : expiresAt.toISOString(), // No expiration for completed
      },
    };

    const key = getStorageKey(progress.assessmentType, progress.organizationId, progress.userId);
    localStorage.setItem(key, JSON.stringify(progressData));

    // Also save to server if credential user (OCAI only)
    saveProgressToServer(progressData);
  } catch (error) {
    console.error('Failed to save assessment progress:', error);
  }
}

// Helper to save progress to server for credential users
const progressTimers: Record<string, ReturnType<typeof setTimeout>> = {};
async function saveProgressToServer(progress: AssessmentProgress): Promise<void> {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    if (user.role !== 'CREDENTIAL_USER') return;

    // Only the OCAI flow uses /api/assessments/progress persistence
    if (progress.assessmentType !== 'OCAI') return;

    // Get or create survey ID for this assessment
    const surveyId = localStorage.getItem(`currentSurveyId_${progress.assessmentType}`) || '';

    // If no valid surveyId, skip server persistence to avoid FK errors
    if (!surveyId) return;

    const key = `${progress.assessmentType}:${progress.organizationId}:${progress.userId}`;
    if (progressTimers[key]) {
      clearTimeout(progressTimers[key]);
    }
    progressTimers[key] = setTimeout(async () => {
      try {
        await fetch('/api/assessments/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credentialEmail: user.email,
            surveyId, // must be a real survey id
            progressData: progress.progress.data,
            demographics: {},
            nowScores: {},
            preferredScores: {},
            isComplete: progress.status === 'completed',
            ipHash: 'credential-user'
          })
        });
      } catch (e) {
        // swallow; localStorage remains source of truth for resume UX
      } finally {
        delete progressTimers[key];
      }
    }, 800);
  } catch (error) {
    console.error('Failed to save progress to server:', error);
    // Fail silently - localStorage still works
  }
}

// Load assessment progress
export function loadAssessmentProgress(
  assessmentType: string,
  organizationId: string,
  userId: string
): AssessmentProgress | null {
  try {
    const key = getStorageKey(assessmentType, organizationId, userId);
    const stored = localStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const progress: AssessmentProgress = JSON.parse(stored);

    // If completed, return it regardless of expiration
    if (progress.status === 'completed') {
      return progress;
    }

    // Check if in-progress data has expired
    if (progress.timestamps.expiresAt) {
      const expiresAt = new Date(progress.timestamps.expiresAt);
      const now = new Date();

      if (now > expiresAt) {
        // Progress expired, clear it
        clearAssessmentProgress(assessmentType, organizationId, userId);
        return null;
      }
    }

    return progress;
  } catch (error) {
    console.error('Failed to load assessment progress:', error);
    return null;
  }
}

// Mark assessment as completed (permanent)
export function markAssessmentCompleted(
  assessmentType: string,
  organizationId: string,
  userId: string,
  accessKey: string
): void {
  try {
    const progress: AssessmentProgress = {
      assessmentType: assessmentType as 'OCAI' | 'BALDRIGE',
      organizationId,
      accessKey,
      userId,
      status: 'completed',
      progress: {
        percentage: 100,
      },
      timestamps: {
        completedAt: new Date().toISOString(),
      },
    };

    const key = getStorageKey(assessmentType, organizationId, userId);
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to mark assessment as completed:', error);
  }
}

// Check if assessment is completed
export function isAssessmentCompleted(
  assessmentType: string,
  organizationId: string,
  userId: string
): boolean {
  const progress = loadAssessmentProgress(assessmentType, organizationId, userId);
  return progress?.status === 'completed';
}

// Clear assessment progress
export function clearAssessmentProgress(
  assessmentType: string,
  organizationId: string,
  userId: string
): void {
  try {
    const key = getStorageKey(assessmentType, organizationId, userId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear assessment progress:', error);
  }
}

// Get all assessment statuses for a user
export function getAllAssessmentStatuses(
  organizationId: string,
  userId: string
): {
  OCAI?: AssessmentProgress;
  BALDRIGE?: AssessmentProgress;
} {
  return {
    OCAI: loadAssessmentProgress('OCAI', organizationId, userId) || undefined,
    BALDRIGE: loadAssessmentProgress('BALDRIGE', organizationId, userId) || undefined,
  };
}

// Calculate progress percentage
export function calculateProgressPercentage(currentStep: number, totalSteps: number): number {
  if (totalSteps === 0) return 0;
  return Math.round((currentStep / totalSteps) * 100);
}

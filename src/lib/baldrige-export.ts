/**
 * Baldrige Assessment Export Utilities
 * 
 * This module provides utilities for exporting Baldrige assessment data
 * in a standardized Excel format with all 97 questions.
 */

import { baldrigeData } from './baldrige-data';

export interface BaldrigeQuestion {
  itemCode: string;
  questionText: string;
  category: string;
  subcategory: string;
  categoryOrder: number;
  subcategoryOrder: number;
  questionOrder: number;
}

export interface BaldrigeExportRow {
  assessmentId: string;
  organizationName: string;
  userName: string;
  userEmail: string;
  accessKey: string;
  loginMethod: 'Access Key' | 'Email Credentials';
  completedAt: string;
  responses: Record<string, string>; // itemCode -> responseText
}

/**
 * Generate the complete list of all 97 Baldrige questions in standard order
 */
export function generateAllBaldrigeQuestions(): BaldrigeQuestion[] {
  const questions: BaldrigeQuestion[] = [];
  let questionOrder = 1;

  // Process Organizational Profile (P1, P2)
  if (baldrigeData['organizational-profile']) {
    baldrigeData['organizational-profile'].forEach((section, sectionIndex) => {
      const categoryOrder = sectionIndex === 0 ? 0 : 1; // P1 = 0, P2 = 1
      const category = section.item;
      const subcategory = section.title;
      
      section.questions.forEach((question, qIndex) => {
        questions.push({
          itemCode: question.itemCode,
          questionText: question.text,
          category,
          subcategory,
          categoryOrder,
          subcategoryOrder: qIndex,
          questionOrder: questionOrder++
        });
      });
    });
  }

  // Process Main Categories (1-7)
  if (baldrigeData.categories) {
    baldrigeData.categories.forEach((category, catIndex) => {
      const categoryOrder = catIndex + 2; // Start from 2 (after P1, P2)
      
      category.items.forEach((item, itemIndex) => {
        const subcategory = item.title;
        
        item.questions.forEach((question, qIndex) => {
          questions.push({
            itemCode: question.itemCode,
            questionText: question.text,
            category: category.category,
            subcategory,
            categoryOrder,
            subcategoryOrder: itemIndex,
            questionOrder: questionOrder++
          });
        });
      });
    });
  }

  return questions;
}

/**
 * Generate Excel headers for Baldrige export
 */
export function generateBaldrigeExcelHeaders(): string[] {
  const questions = generateAllBaldrigeQuestions();
  
  return [
    'Assessment ID',
    'Organization',
    'User Name', 
    'User Email',
    'Access Key',
    'Login Method',
    'Completed At',
    ...questions.map(q => q.itemCode)
  ];
}

/**
 * Generate Excel column widths for Baldrige export
 */
export function generateBaldrigeExcelColumnWidths(): Array<{ wch: number }> {
  const questions = generateAllBaldrigeQuestions();
  
  return [
    { wch: 20 }, // Assessment ID
    { wch: 25 }, // Organization
    { wch: 20 }, // User Name
    { wch: 25 }, // User Email
    { wch: 15 }, // Access Key
    { wch: 15 }, // Login Method
    { wch: 20 }, // Completed At
    ...questions.map(() => ({ wch: 50 })) // Question columns
  ];
}

/**
 * Convert user assessment data to Excel row format
 */
export function convertToExcelRow(
  user: any, 
  organizationName: string, 
  allQuestions: BaldrigeQuestion[]
): string[] {
  // Create response map
  const responseMap: Record<string, string> = {};
  if (user.responses) {
    user.responses.forEach((response: any) => {
      responseMap[response.itemCode] = response.responseText || '';
    });
  }

  // Determine login method
  const loginMethod = user.credentialEmail ? 'Email Credentials' : 'Access Key';

  return [
    user.assessmentId || 'N/A',
    organizationName,
    user.userName || 'N/A',
    user.userEmail || 'N/A',
    user.accessKey || 'N/A',
    loginMethod,
    user.completedAt ? new Date(user.completedAt).toLocaleString() : 'N/A',
    ...allQuestions.map(q => responseMap[q.itemCode] || '')
  ];
}

/**
 * Generate category information for Excel metadata
 */
export function generateCategoryInfo(): Array<{
  category: string;
  title: string;
  startColumn: number;
  endColumn: number;
  questionCount: number;
}> {
  const questions = generateAllBaldrigeQuestions();
  const categoryInfo: Array<{
    category: string;
    title: string;
    startColumn: number;
    endColumn: number;
    questionCount: number;
  }> = [];

  let currentCategory = '';
  let startColumn = 8; // Start after user info columns
  let questionCount = 0;

  questions.forEach((question, index) => {
    if (question.category !== currentCategory) {
      // Save previous category info
      if (currentCategory !== '') {
        categoryInfo.push({
          category: currentCategory,
          title: getCategoryTitle(currentCategory),
          startColumn,
          endColumn: startColumn + questionCount - 1,
          questionCount
        });
      }

      // Start new category
      currentCategory = question.category;
      startColumn = 8 + index;
      questionCount = 1;
    } else {
      questionCount++;
    }
  });

  // Add last category
  if (currentCategory !== '') {
    categoryInfo.push({
      category: currentCategory,
      title: getCategoryTitle(currentCategory),
      startColumn,
      endColumn: startColumn + questionCount - 1,
      questionCount
    });
  }

  return categoryInfo;
}

/**
 * Get category title from category code
 */
function getCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    'P.1': 'Organizational Profile - Description',
    'P.2': 'Organizational Profile - Situation',
    '1': 'Leadership',
    '2': 'Strategy',
    '3': 'Customers',
    '4': 'Measurement, Analysis, and Knowledge Management',
    '5': 'Workforce',
    '6': 'Operations',
    '7': 'Results'
  };
  
  return titles[category] || category;
}

/**
 * Validate that we have all 97 questions
 */
export function validateQuestionCount(): { isValid: boolean; count: number; expected: number } {
  const questions = generateAllBaldrigeQuestions();
  const expected = 97;
  
  return {
    isValid: questions.length === expected,
    count: questions.length,
    expected
  };
}

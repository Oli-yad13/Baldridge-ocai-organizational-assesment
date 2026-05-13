/**
 * Helper function to generate CSV from survey responses
 */
export function generateSurveyCSV(responses: any[], surveyContent?: any, surveyType?: string): string {
    // 1. Collect all unique question IDs and create a mapping to their text
    const questionMap = new Map<string, string>();
    const questionOrder: string[] = [];

    // Helper to process sections and extract questions
    const processSections = (sections: any[]) => {
        if (!sections) return;
        sections.forEach(section => {
            section.questions.forEach((q: any) => {
                if (!questionMap.has(q.id)) {
                    questionMap.set(q.id, q.text);
                    questionOrder.push(q.id);
                }
            });
        });
    };

    // Helper to get sections - handles both { cso: { sections } } and { sections } formats
    const getSections = (contentObj: any, type: string) => {
        if (!contentObj) return [];
        if (contentObj[type]?.sections) return contentObj[type].sections;
        // Fallback for Sankofa stored without 'cso' wrapper
        if (type === 'cso' && contentObj.sections) return contentObj.sections;
        return [];
    };

    // Extract questions from content if available
    if (surveyContent) {
        if (surveyType === 'SANKOFA') {
            processSections(getSections(surveyContent, 'cso'));
        } else {
            processSections(getSections(surveyContent, 'employer'));
            processSections(getSections(surveyContent, 'employee'));
        }
    }

    // Also scan responses for any keys not in content (dynamic/legacy data)
    responses.forEach(r => {
        const data = r.data as any || {};
        Object.keys(data).forEach(key => {
            if (!questionMap.has(key)) {
                questionMap.set(key, key); // Use ID as text if no content
                questionOrder.push(key);
            }
        });
    });

    // 2. Create Header Row
    // Standard fields + Question Texts
    const headers = ['Response ID', 'Type', 'Date', 'Status', ...questionOrder.map(id => `"${questionMap.get(id)?.replace(/"/g, '""') || id}"`)];
    const csvRows = [headers.join(',')];

    // 3. Create Data Rows
    responses.forEach(r => {
        const data = r.data as any || {};
        const row = [
            r.id,
            r.respondentType,
            new Date(r.createdAt).toISOString(),
            r.isCompleted ? 'Completed' : 'In Progress',
            ...questionOrder.map(id => {
                const val = data[id];
                if (val === undefined || val === null) return '';

                // Handle different value types
                let stringVal = '';
                if (Array.isArray(val)) {
                    stringVal = val.join('; '); // Semicolon separated for arrays
                } else if (typeof val === 'object') {
                    stringVal = JSON.stringify(val);
                } else {
                    stringVal = String(val);
                }

                // Escape quotes and wrap in quotes for CSV safety
                return `"${stringVal.replace(/"/g, '""')}"`;
            })
        ];
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

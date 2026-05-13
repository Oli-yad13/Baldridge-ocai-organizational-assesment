// Wrapper to allow requiring the TS file in Node (simplified for testing)
// In a real env we'd use ts-node, but here we'll just copy the function logic
// to ensure we test the logic itself.

function generateSurveyCSV(responses, surveyContent, surveyType) {
    // 1. Collect all unique question IDs and create a mapping to their text
    const questionMap = new Map();
    const questionOrder = [];

    // Helper to process sections and extract questions
    const processSections = (sections) => {
        if (!sections) return;
        sections.forEach(section => {
            section.questions.forEach((q) => {
                if (!questionMap.has(q.id)) {
                    questionMap.set(q.id, q.text);
                    questionOrder.push(q.id);
                }
            });
        });
    };

    // Extract questions from content if available
    if (surveyContent) {
        if (surveyType === 'SANKOFA') {
            processSections(surveyContent.cso?.sections);
        } else {
            processSections(surveyContent.employer?.sections);
            processSections(surveyContent.employee?.sections);
        }
    }

    // Also scan responses for any keys not in content (dynamic/legacy data)
    responses.forEach(r => {
        const data = r.data || {};
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
        const data = r.data || {};
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

module.exports = { generateSurveyCSV }

export const FETAN_PAY_CONTENT = {
    employer: {
        title: "Questionnaire for Companies (Employers)",
        sections: [
            {
                id: "company_profile",
                title: "Company Profile",
                questions: [
                    {
                        id: "industry",
                        type: "text",
                        text: "1. Industry and Size: What industry do you operate in?",
                        placeholder: "e.g., Manufacturing, Retail, Tech"
                    },
                    {
                        id: "employees",
                        type: "radio",
                        text: "Approximately how many employees does your company have?",
                        options: ["1-9", "10-49", "50-250", "250+"]
                    },
                    {
                        id: "existing_systems",
                        type: "radio",
                        text: "2. Existing Systems: Do you currently use any software or service for payroll and HR management?",
                        options: [
                            "No, we manage payroll manually (e.g., spreadsheets, paper)",
                            "Yes, we use an in-house software or custom system",
                            "Yes, we use a third-party payroll service provider"
                        ],
                        hasOther: true
                    },
                    {
                        id: "payroll_responsibility",
                        type: "radio",
                        text: "3. Payroll Responsibility: Who primarily handles payroll and tax reporting in your company?",
                        options: [
                            "Business owner or general manager",
                            "Internal HR/payroll staff",
                            "External accountant or payroll service"
                        ],
                        hasOther: true
                    }
                ]
            },
            {
                id: "payroll_process",
                title: "Current Payroll Process & Challenges",
                questions: [
                    {
                        id: "time_spent",
                        type: "number",
                        text: "4. Time Spent on Payroll: Approximately how many hours per pay cycle (e.g., per month) do you or your staff spend processing payroll?",
                        placeholder: "Hours per month"
                    },
                    {
                        id: "calculation_method",
                        type: "radio",
                        text: "5. Payroll Calculation Method: How are employee salaries and deductions calculated?",
                        options: [
                            "Manually (e.g., by hand or spreadsheet)",
                            "Partially automated (some formulas or basic software)",
                            "Fully automated software (calculations are automatic)",
                            "Outsourced entirely to a service provider"
                        ]
                    },
                    {
                        id: "accuracy_confidence",
                        type: "rating",
                        text: "6. Payroll Accuracy: On a scale of 1–5, how confident are you that your payroll calculations are accurate each cycle?",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "common_issues",
                        type: "checkbox",
                        text: "7. Common Payroll Issues: What are the most frequent payroll issues or errors your company has experienced in the past year?",
                        options: [
                            "Incorrect wage or overtime calculations",
                            "Late or missed salary payments",
                            "Errors in calculating working hours or leave",
                            "Incorrect tax or pension deductions",
                            "We have not had any notable payroll errors"
                        ],
                        hasOther: true
                    },
                    {
                        id: "employee_trust",
                        type: "radio",
                        text: "8. Employee Trust: Have you encountered employee complaints or questions about payroll?",
                        options: [
                            "No, never",
                            "Yes, occasionally (a few times a year)",
                            "Yes, frequently (daily or monthly issues)"
                        ]
                    },
                    {
                        id: "employee_complaints_cause",
                        type: "text",
                        text: "If yes, what is the primary cause of complaints?",
                        placeholder: "Primary cause..."
                    },
                    {
                        id: "manual_vs_automation",
                        type: "checkbox",
                        text: "9. Manual vs. Automation Concerns: If you handle payroll manually, what are the biggest obstacles to switching to a more automated solution? (Select top two)",
                        options: [
                            "Cost of payroll software or services",
                            "Lack of in-house expertise to implement new system",
                            "Time required to set up and learn a new system",
                            "Concerns about software reliability or local support",
                            "We are satisfied with the current process"
                        ],
                        hasOther: true
                    }
                ]
            },
            {
                id: "tax_compliance",
                title: "Tax Reporting & Compliance",
                questions: [
                    {
                        id: "tax_complexity",
                        type: "rating",
                        text: "10. Tax Reporting Complexity: On a scale of 1–5, how would you rate the complexity of the current employee tax reporting and filing system?",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "tax_hours",
                        type: "number",
                        text: "11. Hours on Tax Compliance: Approximately how many hours per month do you spend specifically on tax-related paperwork?",
                        placeholder: "Hours/month"
                    },
                    {
                        id: "tax_challenges",
                        type: "checkbox",
                        text: "12. Primary Tax Challenges: What are the primary challenges you face in the employee tax withholding and reporting process?",
                        options: [
                            "Keeping up with frequent changes in tax regulations",
                            "Understanding the tax rules",
                            "Calculating and withholding the correct amount",
                            "Preparing and submitting monthly/annual tax reports",
                            "Using the government’s e-tax online filing system",
                            "Ensuring timely payments to avoid penalties"
                        ],
                        hasOther: true
                    },
                    {
                        id: "digital_filing",
                        type: "radio",
                        text: "13. Digital Tax Filing: Does your company use the Ministry of Revenues’ e-tax digital platform?",
                        options: [
                            "Yes, we file online every period",
                            "No, we still file in person/paper",
                            "Partially (some online, some manual)"
                        ]
                    },
                    {
                        id: "digital_filing_rating",
                        type: "rating",
                        text: "If you use the digital system, how user-friendly is it? (1 = Very difficult, 5 = Very easy)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "digital_filing_reason",
                        type: "text",
                        text: "If you do not use it, what are the reasons?",
                        placeholder: "Reasons..."
                    },
                    {
                        id: "penalties",
                        type: "radio",
                        text: "14. Penalties and Notices: Have you ever been penalized or received a warning from the tax authority?",
                        options: [
                            "No, never",
                            "Yes, once",
                            "Yes, more than once"
                        ]
                    },
                    {
                        id: "penalties_desc",
                        type: "text",
                        text: "If yes, please briefly describe the issue and impact:",
                        placeholder: "Issue description..."
                    },
                    {
                        id: "business_impact",
                        type: "radio",
                        text: "15. Impact on Business: How does the current tax reporting system affect your business’s cash flow and planning?",
                        options: [
                            "No significant effect",
                            "Minor strain (occasional cash crunch)",
                            "Major strain (regularly need to reserve funds)",
                            "It’s unpredictable, sometimes causing serious issues"
                        ],
                        hasOther: true
                    },
                    {
                        id: "improvement_suggestions",
                        type: "textarea",
                        text: "16. Improvement Suggestions: What recommendations would you give government authorities to improve the system?",
                        placeholder: "Your suggestions..."
                    }
                ]
            },
            {
                id: "payroll_financing",
                title: "Payroll Financing & Cash Flow",
                questions: [
                    {
                        id: "cash_flow_strain",
                        type: "radio",
                        text: "17. Payroll Cash Flow Strain: In the past year, have you ever encountered difficulty in paying salaries on schedule due to cash flow shortfalls?",
                        options: [
                            "No, never",
                            "Yes, once or twice",
                            "Yes, multiple times"
                        ]
                    },
                    {
                        id: "cash_flow_cause",
                        type: "radio",
                        text: "If yes, what typically caused the cash flow issue?",
                        options: [
                            "Delayed customer payments or sales revenue",
                            "Unexpected expenses",
                            "Economic conditions"
                        ],
                        hasOther: true
                    },
                    {
                        id: "handling_shortfalls",
                        type: "radio",
                        text: "18. Handling Shortfalls: If you did face a shortfall, how did you cover the gap?",
                        options: [
                            "Delayed paying salaries",
                            "Used personal funds or owner’s capital",
                            "Took a loan or line of credit",
                            "Negotiated an advance or overdraft",
                            "Not applicable"
                        ],
                        hasOther: true
                    },
                    {
                        id: "interest_credit",
                        type: "radio",
                        text: "19. Interest in Payroll Credit Service: Would you be interested in a service that provides short-term credit specifically for covering payroll?",
                        options: [
                            "Yes, definitely interested",
                            "Possibly, would consider it",
                            "Not really, only as a last resort",
                            "No, not interested at all"
                        ]
                    },
                    {
                        id: "credit_concerns",
                        type: "radio",
                        text: "If not interested, is it because of concerns about:",
                        options: [
                            "Cost/interest rates",
                            "Taking on debt/financial risk",
                            "Trust in provider"
                        ],
                        hasOther: true
                    },
                    {
                        id: "transaction_size_rating",
                        type: "rating",
                        text: "20. Transaction Size and Credit: How useful would credit based on payroll size and history be for your business? (1 = Not useful, 5 = Extremely useful)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "credit_comments",
                        type: "text",
                        text: "Any comments or conditions for such a service to be attractive?",
                        placeholder: "Comments..."
                    }
                ]
            },
            {
                id: "employee_benefits",
                title: "Employee Financial Benefits",
                questions: [
                    {
                        id: "salary_advances",
                        type: "radio",
                        text: "21. Current Salary Advances: Do your employees ever request salary advances or payday loans?",
                        options: [
                            "No, we do not offer any salary advances",
                            "Yes, rarely",
                            "Yes, sometimes",
                            "Yes, frequently"
                        ]
                    },
                    {
                        id: "manage_advances",
                        type: "radio",
                        text: "If yes, how do you manage these requests currently?",
                        options: [
                            "We advance from company funds and deduct later",
                            "We allow it only in certain cases",
                            "We partner with a third-party",
                            "It’s a pain point – we struggle to accommodate"
                        ],
                        hasOther: true
                    },
                    {
                        id: "impact_advances",
                        type: "checkbox",
                        text: "22. Impact of Advances: If you provide advances, how have they impacted the company?",
                        options: [
                            "Improved employee morale or loyalty",
                            "Strained our cash flow",
                            "Administrative burden to track",
                            "Some employees became too reliant",
                            "Not applicable"
                        ],
                        hasOther: true
                    },
                    {
                        id: "early_wage_access",
                        type: "radio",
                        text: "23. Early Wage Access Service: Would you support a system where employees can access part of their earned wages on-demand via an app?",
                        options: [
                            "Yes – we would actively encourage it",
                            "Maybe – as long as it doesn’t cost the company",
                            "Not sure – we have concerns",
                            "No – we prefer not to involve"
                        ]
                    },
                    {
                        id: "ewa_concern",
                        type: "text",
                        text: "If hesitant or no, what is your biggest concern?",
                        placeholder: "Concern..."
                    },
                    {
                        id: "bnpl_interest",
                        type: "rating",
                        text: "24. Employee Purchase Program (BNPL): How interested would you be in offering a program for employee purchases via salary deduction? (1 = Not interested, 5 = Very interested)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "bnpl_conditions",
                        type: "text",
                        text: "What would be your conditions or concerns?",
                        placeholder: "Conditions..."
                    },
                    {
                        id: "current_practices",
                        type: "radio",
                        text: "25. Current Practices: Does your company already have any arrangements for employee purchases or loans?",
                        options: [
                            "No, we don’t have such programs",
                            "Yes, informal",
                            "Yes, formal",
                            "I don’t know"
                        ]
                    },
                    {
                        id: "formal_practice_desc",
                        type: "text",
                        text: "If formal, please describe:",
                        placeholder: "Description..."
                    },
                    {
                        id: "perceived_benefits",
                        type: "checkbox",
                        text: "26. Perceived Benefits: In your opinion, would offering early wage access or BNPL help your business?",
                        options: [
                            "Improve employee retention",
                            "Increase employee productivity",
                            "Enhance company’s reputation",
                            "Minimal direct benefit to company",
                            "Could potentially reduce requests for traditional advances",
                            "Not sure / unlikely to have much effect"
                        ],
                        hasOther: true
                    }
                ]
            },
            {
                id: "integrated_solution",
                title: "Interest in an Integrated Solution",
                questions: [
                    {
                        id: "biggest_pain_point",
                        type: "textarea",
                        text: "27. Biggest Pain Point: What is the most time-consuming or stressful aspect of managing payroll currently?",
                        placeholder: "Describe..."
                    },
                    {
                        id: "desired_features",
                        type: "checkbox",
                        text: "28. Desired Features: Which features would you most like to have in a new solution? (Pick top 3)",
                        options: [
                            "Automatic calculation of salaries/taxes",
                            "One-click payment transfers",
                            "Generation of tax filings automatically",
                            "Online portal for employees",
                            "Option for early wage access",
                            "Integration with banks for financing",
                            "Integration for employee purchase programs",
                            "Analytics and forecasting",
                            "Mobile access",
                            "Local language support"
                        ],
                        hasOther: true
                    },
                    {
                        id: "new_system_concerns",
                        type: "checkbox",
                        text: "29. Concerns About New System: What concerns would you have about switching to a new integrated system?",
                        options: [
                            "Cost of the system",
                            "Data security/privacy",
                            "Reliability and accuracy",
                            "Training staff / ease of use",
                            "Compatibility with existing processes",
                            "Regulatory compliance"
                        ],
                        hasOther: true
                    },
                    {
                        id: "adoption_likelihood",
                        type: "rating",
                        text: "30. Likelihood to Adopt: If a solution met your needs, how likely would you be to adopt it in the next 6-12 months? (1 = Very unlikely, 5 = Very likely)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "adoption_factors",
                        type: "text",
                        text: "What factors most influence that decision?",
                        placeholder: "Factors..."
                    },
                    {
                        id: "additional_comments",
                        type: "textarea",
                        text: "31. Additional Comments: Any other comments or suggestions?",
                        placeholder: "Comments..."
                    }
                ]
            }
        ]
    },
    employee: {
        title: "Questionnaire for Employees (Workers)",
        sections: [
            {
                id: "employment_basics",
                title: "Employment & Payroll Basics",
                questions: [
                    {
                        id: "employment_type",
                        type: "radio",
                        text: "1. Employment Type: Are you employed full-time, part-time, or contract?",
                        options: ["Full-time employee", "Part-time employee", "Contract or freelance"],
                        hasOther: true
                    },
                    {
                        id: "pay_frequency",
                        type: "radio",
                        text: "2. Pay Frequency: How often do you get paid?",
                        options: ["Monthly", "Twice a month (bi-monthly)", "Weekly"],
                        hasOther: true
                    },
                    {
                        id: "pay_method",
                        type: "radio",
                        text: "3. Pay Method: How do you typically receive your salary?",
                        options: ["Bank transfer", "Cash", "Mobile money or digital wallet", "Cheque"],
                        hasOther: true
                    },
                    {
                        id: "payslip",
                        type: "radio",
                        text: "4. Payslip and Information: Does your employer provide a payslip each pay period?",
                        options: ["Yes, regularly", "Sometimes/occasionally", "No, I do not receive a detailed payslip"]
                    },
                    {
                        id: "payslip_understanding",
                        type: "radio",
                        text: "If yes, do you review it and understand the deductions?",
                        options: [
                            "Yes, I usually understand all details",
                            "I look at it but some parts are unclear",
                            "I rarely look at it or don’t understand it"
                        ]
                    },
                    {
                        id: "payroll_accuracy",
                        type: "radio",
                        text: "5. Payroll Accuracy: Have there been errors in your pay or deductions in the past year?",
                        options: [
                            "No, it’s always been correct",
                            "Maybe/Not sure",
                            "Yes, once",
                            "Yes, more than once"
                        ]
                    },
                    {
                        id: "error_type",
                        type: "text",
                        text: "If yes, what kind of error was it?",
                        placeholder: "Error type..."
                    },
                    {
                        id: "employer_trust",
                        type: "rating",
                        text: "6. Confidence in Employer: How much do you trust that your employer’s payroll system is accurate and compliant? (1 = Do not trust, 5 = Completely trust)",
                        min: 1,
                        max: 5
                    }
                ]
            },
            {
                id: "financial_situation",
                title: "Personal Financial Situation",
                questions: [
                    {
                        id: "end_of_month_strain",
                        type: "radio",
                        text: "7. End-of-Month Strain: In a typical month, do you run out of money before your next paycheck?",
                        options: [
                            "Never",
                            "Rarely",
                            "Sometimes",
                            "Often",
                            "Always"
                        ]
                    },
                    {
                        id: "coping_strategies",
                        type: "checkbox",
                        text: "8. Coping Strategies: If you run out of money, what do you usually do?",
                        options: [
                            "Borrow from friends or family",
                            "Take a personal loan or credit",
                            "Use a credit card",
                            "Borrow from informal lenders",
                            "Cut back on expenses",
                            "Request an advance from employer"
                        ],
                        hasOther: true
                    },
                    {
                        id: "savings_buffer",
                        type: "radio",
                        text: "9. Savings Buffer: If an unexpected expense of half your salary arose, could you cover it?",
                        options: [
                            "Yes, I have enough savings",
                            "Possibly, by redirecting money",
                            "No, I would need to find money",
                            "Not sure"
                        ]
                    },
                    {
                        id: "financial_stress",
                        type: "rating",
                        text: "10. Financial Stress: How much financial stress do you experience related to timing of your pay? (1 = No stress, 5 = Extreme stress)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "stress_desc",
                        type: "text",
                        text: "Optional: Describe your situation or main source of stress:",
                        placeholder: "Description..."
                    }
                ]
            },
            {
                id: "early_wage_access",
                title: "Early Wage Access (Salary Advances)",
                questions: [
                    {
                        id: "experience_advances",
                        type: "radio",
                        text: "11. Experience with Advances: Have you ever requested a salary advance?",
                        options: [
                            "No, never needed to or never allowed",
                            "Yes, once in the past",
                            "Yes, a few times",
                            "Yes, regularly"
                        ]
                    },
                    {
                        id: "advance_process",
                        type: "text",
                        text: "If yes, was the advance granted? What was the process?",
                        placeholder: "Process..."
                    },
                    {
                        id: "interest_early_access",
                        type: "rating",
                        text: "12. Interest in Early Access: If you could instantly access part of your earned wages via an app, how likely would you use it? (1 = Never, 5 = Definitely)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "usage_frequency",
                        type: "radio",
                        text: "13. Usage Frequency: How often might you use early wage access?",
                        options: [
                            "Rarely (only in real emergencies)",
                            "Occasionally",
                            "Frequently",
                            "Not sure"
                        ]
                    },
                    {
                        id: "amount_accessibility",
                        type: "radio",
                        text: "14. Amount Accessibility: What portion of your earned salary would you want to access early?",
                        options: [
                            "A small portion (<25%)",
                            "Around half",
                            "Most of it",
                            "Not sure"
                        ]
                    },
                    {
                        id: "ewa_concerns",
                        type: "checkbox",
                        text: "15. Concerns about Early Access: Do you have any concerns?",
                        options: [
                            "It might encourage me to overspend",
                            "Fees or charges might be too high",
                            "Privacy or employer judging me",
                            "Reliability of the service",
                            "No major concerns"
                        ],
                        hasOther: true
                    },
                    {
                        id: "employer_support",
                        type: "radio",
                        text: "16. Employer Support: Would you prefer it as an employer-provided benefit or private?",
                        options: [
                            "Employer-provided benefit",
                            "Private via third-party app",
                            "Doesn’t matter",
                            "I would not use it"
                        ]
                    }
                ]
            },
            {
                id: "bnpl",
                title: "Buy Now, Pay Later (BNPL)",
                questions: [
                    {
                        id: "current_credit",
                        type: "radio",
                        text: "17. Current Access to Credit: Do you currently have any form of consumer credit?",
                        options: [
                            "Yes, credit card or credit line",
                            "Yes, bought items on installment",
                            "No, I pay upfront"
                        ]
                    },
                    {
                        id: "interest_bnpl",
                        type: "radio",
                        text: "18. Interest in BNPL: Would you be interested in purchasing items via salary deductions?",
                        options: [
                            "Yes, definitely",
                            "Possibly",
                            "Not really",
                            "No, not interested"
                        ]
                    },
                    {
                        id: "likely_uses",
                        type: "checkbox",
                        text: "19. Likely Uses: What type of products would you consider financing?",
                        options: [
                            "Electronics",
                            "Home appliances",
                            "Furniture",
                            "Motorcycle or bicycle",
                            "Education or training fees",
                            "Medical expenses",
                            "None"
                        ],
                        hasOther: true
                    },
                    {
                        id: "affordability",
                        type: "rating",
                        text: "20. Affordability: How important is zero or low interest? (1 = Not important, 5 = Extremely important)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "bnpl_concerns",
                        type: "checkbox",
                        text: "21. Concerns about BNPL: What concerns would you have?",
                        options: [
                            "Reducing take-home pay too much",
                            "Over-committing",
                            "Privacy",
                            "Product choices limited",
                            "Leaving job before finishing payment",
                            "No major concerns"
                        ],
                        hasOther: true
                    }
                ]
            },
            {
                id: "tech_experience",
                title: "Tech Experience",
                questions: [
                    {
                        id: "smartphone_access",
                        type: "radio",
                        text: "22. Smartphone Access: Do you have a smartphone with internet access?",
                        options: [
                            "Yes, personal smartphone",
                            "Basic phone or limited access",
                            "Access via others/computer"
                        ]
                    },
                    {
                        id: "financial_apps",
                        type: "radio",
                        text: "23. Financial Apps Usage: Do you currently use any mobile apps for finance?",
                        options: [
                            "Yes, regularly",
                            "Yes, occasionally",
                            "No, not at all"
                        ]
                    },
                    {
                        id: "app_names",
                        type: "text",
                        text: "If yes, which apps?",
                        placeholder: "App names..."
                    },
                    {
                        id: "app_comfort",
                        type: "rating",
                        text: "24. Comfort with Apps: How comfortable are you with using new mobile apps for finance? (1 = Not comfortable, 5 = Very comfortable)",
                        min: 1,
                        max: 5
                    },
                    {
                        id: "self_service_desires",
                        type: "checkbox",
                        text: "25. Self-Service Desires: What would you like to access on an employee app?",
                        options: [
                            "View payslips and salary history",
                            "See tax and pension details",
                            "Request leave",
                            "Request salary advance",
                            "Browse BNPL offers",
                            "Update personal info",
                            "Chat with HR",
                            "I’m not very interested"
                        ],
                        hasOther: true
                    },
                    {
                        id: "digital_trust",
                        type: "radio",
                        text: "26. Trust in Digital Systems: Do you trust digital systems to handle your salary data?",
                        options: [
                            "Yes, I trust modern systems",
                            "I have some concerns",
                            "No, I prefer traditional methods",
                            "Not sure"
                        ]
                    }
                ]
            },
            {
                id: "overall_feedback",
                title: "Overall Feedback & Desires",
                questions: [
                    {
                        id: "biggest_frustration",
                        type: "textarea",
                        text: "27. Biggest Frustration: What is the biggest frustration you have regarding your pay or financial situation?",
                        placeholder: "Describe..."
                    },
                    {
                        id: "desired_support",
                        type: "textarea",
                        text: "28. Desired Employer Support: What’s one thing you wish your employer would do to support your financial well-being?",
                        placeholder: "Describe..."
                    },
                    {
                        id: "feature_priority",
                        type: "radio",
                        text: "29. Priority of Features: If you could pick only one, which would be most valuable?",
                        options: [
                            "Getting paid on-demand",
                            "Access to affordable credit/purchase plans",
                            "Having pay and taxes 100% correct and on-time"
                        ],
                        hasOther: true
                    },
                    {
                        id: "additional_comments",
                        type: "textarea",
                        text: "30. Additional Comments: Any other comments or suggestions?",
                        placeholder: "Comments..."
                    }
                ]
            }
        ]
    }
}

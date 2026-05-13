export const SANKOFA_CONTENT = {
    cso: {
        title: "Questionnaire for Ethiopian Civil Society Organizations (CSOs)",
        sections: [
            {
                id: "organizational_profile",
                title: "Section A – Organisational Profile",
                questions: [
                    {
                        id: "org_name",
                        type: "text",
                        text: "1. Organisation name and acronym",
                        placeholder: "Name and acronym"
                    },
                    {
                        id: "email",
                        type: "text",
                        text: "2. Email address (optional)",
                        placeholder: "email@example.com"
                    },
                    {
                        id: "phone_number",
                        type: "text",
                        text: "3. Phone number (optional)",
                        placeholder: "+251..."
                    },
                    {
                        id: "org_stage",
                        type: "radio",
                        text: "4. Stage of organisation – please select one of the following:",
                        options: [
                            "Start-up/planning stage (not yet legally established)",
                            "Less than 1 year old",
                            "1–3 years old",
                            "4–10 years old",
                            "More than 10 years old"
                        ]
                    },
                    {
                        id: "registration_status",
                        type: "radio",
                        text: "5. Registration status (tick one)",
                        options: [
                            "Registered with the Ethiopian CSO Authority",
                            "Registration in progress",
                            "Not yet registered",
                            "Not applicable (operates informally or under a parent organisation)"
                        ]
                    },
                    {
                        id: "legal_form",
                        type: "checkbox",
                        text: "6. Legal form – choose the option(s) that best describe your organisation (select all that apply):",
                        options: [
                            "NGO / non-profit association",
                            "Charity",
                            "Network or umbrella organisation",
                            "Professional society",
                            "Faith-based organisation",
                            "Social enterprise"
                        ],
                        hasOther: true
                    },
                    {
                        id: "geographic_coverage",
                        type: "checkbox",
                        text: "7. Geographic coverage (tick all that apply)",
                        options: [
                            "National (operates across Ethiopia)",
                            "Regional/State",
                            "Woreda/District",
                            "Community-level",
                            "International (cross-border)",
                            "Not yet active (planning stage)"
                        ]
                    },
                    {
                        id: "primary_sectors",
                        type: "checkbox",
                        text: "8. Primary sectors/working areas – select up to three sectors that reflect your current or intended focus:",
                        options: [
                            "Environment / climate",
                            "Community development",
                            "Health",
                            "Human rights & democracy",
                            "Education",
                            "Livelihoods & economic empowerment",
                            "Gender equality"
                        ],
                        hasOther: true
                    },
                    {
                        id: "mission_statement",
                        type: "textarea",
                        text: "9. Mission statement and goals – briefly describe your organisation’s purpose and the social issues you aim to address. (If your organisation is new, state your planned mission or vision.)",
                        placeholder: "Mission statement..."
                    },
                    {
                        id: "target_beneficiaries",
                        type: "checkbox",
                        text: "10. Target beneficiaries – check all groups that your organisation currently serves or plans to serve:",
                        options: [
                            "Women and girls",
                            "Youth (15-29)",
                            "Children",
                            "Persons with disabilities",
                            "Elderly people",
                            "Internally displaced persons / refugees",
                            "Farmers / pastoralists",
                            "Urban poor / informal settlement dwellers"
                        ],
                        hasOther: true
                    },
                    {
                        id: "staff_fulltime",
                        type: "radio",
                        text: "11a. Number of full-time staff",
                        options: [
                            "0 (volunteer-run)",
                            "1–5",
                            "6–20",
                            "21–50",
                            "More than 50",
                            "Not applicable (new organisation)"
                        ]
                    },
                    {
                        id: "staff_parttime",
                        type: "radio",
                        text: "11b. Number of part-time staff",
                        options: [
                            "0",
                            "1–5",
                            "6–20",
                            "More than 20",
                            "Not applicable"
                        ]
                    },
                    {
                        id: "volunteers",
                        type: "radio",
                        text: "11c. Number of volunteers",
                        options: [
                            "0",
                            "1–10",
                            "11–30",
                            "More than 30",
                            "Not applicable"
                        ]
                    },
                    {
                        id: "annual_budget",
                        type: "radio",
                        text: "11d. Annual operating budget",
                        options: [
                            "No budget / under 500,000 ETB",
                            "500,000 – 2 million ETB",
                            "2–5 million ETB",
                            "More than 5 million ETB",
                            "Not applicable (new organisation)"
                        ]
                    },
                    {
                        id: "achievements",
                        type: "textarea",
                        text: "12. Achievements or planned activities – for established organisations, list up to three notable achievements or programmes from the past three years. For new organisations, describe any pilot activities or planned initiatives for the coming year.",
                        placeholder: "Achievements or planned activities..."
                    }
                ]
            },
            {
                id: "funding_resource_mobilisation",
                title: "Section B – Funding and Resource Mobilisation",
                questions: [
                    {
                        id: "funding_sources",
                        type: "checkbox",
                        text: "11. Current or intended funding sources (tick all that apply)",
                        options: [
                            "International donors (bilateral or multilateral agencies)",
                            "Foundations / philanthropic organisations",
                            "Corporate donors / private-sector partnerships",
                            "Community contributions / membership fees",
                            "Government grants (local or national)",
                            "Income-generating activities (e.g., social enterprises)",
                            "Crowdfunding / individual donations",
                            "Not yet seeking funding (new organisation)"
                        ],
                        hasOther: true
                    },
                    {
                        id: "proposals_submitted",
                        type: "radio",
                        text: "12. Number of grant proposals submitted in the past 12 months – choose one:",
                        options: [
                            "0 (none submitted)",
                            "1–3 proposals",
                            "4–6 proposals",
                            "7 or more proposals",
                            "Not applicable (new or no grant activity)"
                        ]
                    },
                    {
                        id: "proposals_funded",
                        type: "radio",
                        text: "13. Number of grant proposals funded in the past 12 months – choose one:",
                        options: [
                            "0 (none funded)",
                            "1 proposal",
                            "2–4 proposals",
                            "5 or more proposals",
                            "Not applicable (new or no grant activity)"
                        ]
                    },
                    {
                        id: "funding_challenges",
                        type: "checkbox",
                        text: "14. Major funding challenges – select up to three areas that hinder your organisation’s resource mobilisation:",
                        options: [
                            "Identifying relevant funding opportunities",
                            "Understanding donor priorities / eligibility requirements",
                            "Writing competitive proposals (problem analysis, theory of change, etc.)",
                            "Budgeting and financial planning",
                            "Meeting monitoring & evaluation requirements",
                            "Complying with donor reporting requirements",
                            "Lack of networking or partnerships",
                            "Over-reliance on a single donor / donor fatigue",
                            "Limited organisational capacity (staffing, systems)"
                        ],
                        hasOther: true
                    },
                    {
                        id: "donor_policy_impact",
                        type: "radio",
                        text: "15. Impact of donor policy changes – have you faced disruptions due to sudden changes in donor policies or aid cuts?",
                        options: [
                            "Yes",
                            "No",
                            "Not applicable (no external funding yet)"
                        ]
                    },
                    {
                        id: "donor_policy_impact_desc",
                        type: "text",
                        text: "If “Yes,” please briefly describe the impacts.",
                        placeholder: "Impact description..."
                    },
                    {
                        id: "funding_diversification",
                        type: "checkbox",
                        text: "16. Funding diversification strategies – which strategies are you currently using or planning to use? (tick all that apply)",
                        options: [
                            "Partnering with local businesses or private sector",
                            "Seeking grants from new international donors",
                            "Building community or membership contributions",
                            "Establishing income-generating activities",
                            "Forming consortia or alliances with other CSOs",
                            "Advocacy and dialogue to restore suspended aid",
                            "Not yet applicable (start-up stage)"
                        ],
                        hasOther: true
                    },
                    {
                        id: "financial_policy",
                        type: "radio",
                        text: "17a. Do you have a written financial or grant management policy?",
                        options: [
                            "Yes – fully developed",
                            "In draft",
                            "No – not yet",
                            "Not applicable"
                        ]
                    },
                    {
                        id: "financial_procedures",
                        type: "radio",
                        text: "17b. Does your policy (if any) include procedures for budgeting, accounting, internal controls and reporting?",
                        options: [
                            "Yes – comprehensive",
                            "Partially",
                            "No",
                            "Not applicable"
                        ]
                    },
                    {
                        id: "financial_support_needed",
                        type: "radio",
                        text: "17c. Would you like support in developing or strengthening your financial policies and systems?",
                        options: [
                            "Yes",
                            "No"
                        ]
                    }
                ]
            },
            {
                id: "capacity_building",
                title: "Section C – Capacity-Building Needs and Premium Services",
                questions: [
                    {
                        id: "capacity_building_experience",
                        type: "radio",
                        text: "18. Previous capacity-building experience – have you ever participated in training, consultancy or mentorship through CSO.et or other providers?",
                        options: [
                            "Yes – with CSO.et",
                            "Yes – with other providers",
                            "No – none to date",
                            "Not applicable (start-up phase)"
                        ]
                    },
                    {
                        id: "capacity_building_desc",
                        type: "text",
                        text: "If “Yes,” briefly describe the type of training and when it took place.",
                        placeholder: "Training description..."
                    },
                    {
                        id: "interest_trainings",
                        type: "radio",
                        text: "19a. Interest in Capacity-building trainings (general organisational development)",
                        options: ["High (urgent need)", "Moderate", "Low", "Not needed", "Not applicable"]
                    },
                    {
                        id: "interest_proposal_writing",
                        type: "radio",
                        text: "19b. Interest in Grant proposal writing workshops",
                        options: ["High (urgent need)", "Moderate", "Low", "Not needed", "Not applicable"]
                    },
                    {
                        id: "interest_leadership",
                        type: "radio",
                        text: "19c. Interest in Leadership development (strategic planning, governance, management)",
                        options: ["High (urgent need)", "Moderate", "Low", "Not needed", "Not applicable"]
                    },
                    {
                        id: "interest_hr",
                        type: "radio",
                        text: "19d. Interest in Human resource management (recruitment, retention, performance management)",
                        options: ["High (urgent need)", "Moderate", "Low", "Not needed", "Not applicable"]
                    },
                    {
                        id: "interest_grant_writing_services",
                        type: "radio",
                        text: "19e. Interest in Grant writing services (direct support in drafting proposals)",
                        options: ["High (urgent need)", "Moderate", "Low", "Not needed", "Not applicable"]
                    },
                    {
                        id: "interest_other",
                        type: "text",
                        text: "19f. Other (please specify)",
                        placeholder: "Other service..."
                    },
                    {
                        id: "priority_topics",
                        type: "checkbox",
                        text: "20. Priority topics for training/consultancy – choose up to five areas that are most important for your organisation:",
                        options: [
                            "Identifying and screening funding opportunities",
                            "Understanding donor goals and aligning your mission",
                            "Developing strong executive summaries and problem statements",
                            "Designing projects with clear objectives, methodology and SMART indicators",
                            "Budgeting and financial planning",
                            "Monitoring and evaluation frameworks",
                            "Evidence-based advocacy and stakeholder engagement",
                            "Organisational leadership and governance",
                            "Human resource management (policies, performance, succession planning)",
                            "Digital skills (data management, website management, social media)",
                            "Financial policy development and internal controls"
                        ],
                        hasOther: true
                    },
                    {
                        id: "learning_formats",
                        type: "checkbox",
                        text: "21. Preferred learning formats – select all that apply:",
                        options: [
                            "In-person workshops",
                            "Virtual webinars (live online sessions)",
                            "One-on-one mentorship or coaching",
                            "Peer-to-peer learning/networking sessions",
                            "Self-paced online courses",
                            "Resource toolkits / templates",
                            "Blended learning (combination of online and in-person)"
                        ]
                    },
                    {
                        id: "preferred_time",
                        type: "radio",
                        text: "22a. Preferred time of day:",
                        options: [
                            "Weekday daytime",
                            "Weekday evenings",
                            "Weekends",
                            "No preference"
                        ]
                    },
                    {
                        id: "training_frequency",
                        type: "radio",
                        text: "22b. Desired frequency of training:",
                        options: [
                            "Monthly",
                            "Quarterly",
                            "Twice per year",
                            "Annually",
                            "On demand",
                            "Not applicable (start-up phase)"
                        ]
                    },
                    {
                        id: "budget_allocation",
                        type: "radio",
                        text: "23. Budget for external services – does your organisation have funds allocated for training/consultancy?",
                        options: [
                            "Yes – less than 50,000 ETB",
                            "Yes – 50,000 – 150,000 ETB",
                            "Yes – more than 150,000 ETB",
                            "No dedicated budget but open to co-funding/subsidised arrangements",
                            "No budget available / not applicable"
                        ]
                    }
                ]
            },
            {
                id: "cso_et_experience",
                title: "Section D – Experience with CSO.et Platform",
                questions: [
                    {
                        id: "discovery_channel",
                        type: "radio",
                        text: "24. How did you first learn about CSO.et? – choose one:",
                        options: [
                            "Social media (Facebook, X/Twitter, LinkedIn, etc.)",
                            "Referral from a colleague or partner organisation",
                            "Web search",
                            "Government authority / regulator",
                            "Event or workshop",
                            "I have not visited the CSO.et website yet (this is my first interaction)"
                        ],
                        hasOther: true
                    },
                    {
                        id: "visit_frequency",
                        type: "radio",
                        text: "25. Frequency of use – how often do you visit CSO.et?",
                        options: [
                            "Never (have not used it yet)",
                            "Less than once per month",
                            "Monthly",
                            "Weekly",
                            "Daily"
                        ]
                    },
                    {
                        id: "useful_features",
                        type: "checkbox",
                        text: "26. Most useful features – which aspects of the CSO.et platform have been most beneficial to your organisation (or which do you anticipate using)? (select all that apply)",
                        options: [
                            "Funding opportunity listings by sector/working area",
                            "Blog articles and guidance (e.g., financial policies, donor shifts, grant writing)",
                            "Premium service enquiry form",
                            "Email alerts / newsletters",
                            "Networking or partner-search features (if any)",
                            "I have not used any features yet"
                        ],
                        hasOther: true
                    },
                    {
                        id: "navigation_ease",
                        type: "radio",
                        text: "27. Ease of navigation – rate how easy it is to find information on the website:",
                        options: [
                            "Very easy",
                            "Easy",
                            "Moderate",
                            "Difficult",
                            "Very difficult",
                            "Not applicable (have not used the site yet)"
                        ]
                    },
                    {
                        id: "content_gaps",
                        type: "checkbox",
                        text: "28. Content and sector gaps – are there topics or sectors not currently covered on CSO.et that you would like to see?",
                        options: [
                            "Agriculture and food security",
                            "Livelihoods and economic empowerment",
                            "Disability rights",
                            "Emergency and humanitarian response",
                            "Water, sanitation and hygiene (WASH)",
                            "Peacebuilding and conflict resolution",
                            "None / satisfied with current coverage"
                        ],
                        hasOther: true
                    },
                    {
                        id: "improvement_suggestions",
                        type: "textarea",
                        text: "29. Suggestions for improvement – provide any recommendations to improve the platform’s usability, content or services.",
                        placeholder: "Suggestions..."
                    }
                ]
            },
            {
                id: "challenges_support",
                title: "Section E – Organisational Challenges and Support Needs",
                questions: [
                    {
                        id: "top_challenges",
                        type: "checkbox",
                        text: "30. Top organisational challenges – select up to three that currently or potentially affect your organisation:",
                        options: [
                            "Limited funding / revenue instability",
                            "Weak internal systems (financial, HR, procurement)",
                            "Limited staff skills or capacity",
                            "Leadership or governance issues",
                            "High staff turnover",
                            "Inadequate monitoring and evaluation",
                            "Difficulty complying with legal/regulatory requirements",
                            "Lack of collaboration with other CSOs or government",
                            "Limited community engagement / participation",
                            "Not applicable (organisation not yet operational)"
                        ],
                        hasOther: true
                    },
                    {
                        id: "external_challenges",
                        type: "textarea",
                        text: "31. Emerging external challenges – are there external factors affecting your operations or plans (policy changes, political environment, economic shifts, donor priorities, climate-related crises)?",
                        placeholder: "Describe external challenges..."
                    },
                    {
                        id: "support_needed",
                        type: "checkbox",
                        text: "32. Support needed from CSO.et – beyond funding information, what types of support would be most valuable to you? (select all that apply)",
                        options: [
                            "Networking events and opportunities to connect with other CSOs",
                            "Advocacy platforms to voice civil society concerns",
                            "Partnerships with private sector organisations",
                            "Policy advice and regulatory guidance",
                            "Mentorship or peer-learning opportunities",
                            "Data and research on civil society trends",
                            "Capacity-building scholarships or subsidies"
                        ],
                        hasOther: true
                    }
                ]
            },
            {
                id: "final_comments",
                title: "Section F – Final Comments",
                questions: [
                    {
                        id: "additional_comments",
                        type: "textarea",
                        text: "33. Additional comments or questions – please use this space to share any further thoughts, expectations or concerns regarding CSO.et and how we can support you.",
                        placeholder: "Additional comments..."
                    },
                    {
                        id: "consent",
                        type: "radio",
                        text: "34. Consent – do you agree to allow CSO.et to store and process the information provided in this questionnaire for the purpose of improving its services and communications?",
                        options: [
                            "Yes",
                            "No"
                        ]
                    }
                ]
            }
        ]
    }
}

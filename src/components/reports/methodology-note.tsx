'use client'

export function MethodologyNote() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-blue-900 mb-3">Methodology & Data Privacy</h3>
      
      <div className="space-y-3 text-sm text-blue-800">
        <div>
          <h4 className="font-medium mb-1">K-Anonymity Protection</h4>
          <p>
            All demographic breakdowns are protected by k-anonymity (k≥7), meaning no group 
            with fewer than 7 responses is displayed. This ensures individual privacy while 
            allowing meaningful analysis of larger demographic segments.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Sample Size Considerations</h4>
          <p>
            Results with fewer than 7 responses are suppressed and marked as "insufficient 
            sample size." When sample sizes are small (7-20), results should be interpreted 
            as indicative rather than determinative. Larger sample sizes provide more reliable 
            insights.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Participation Rates</h4>
          <p>
            Participation rates are calculated as the percentage of invited participants who 
            completed the assessment. Higher participation rates generally indicate more 
            representative results, though voluntary participation may introduce some bias.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Cultural Congruence</h4>
          <p>
            Congruence indicators measure the alignment between current and preferred cultures 
            on a 0-1 scale, where 1 represents perfect alignment. These scores help identify 
            areas where the organization's current state matches its desired state.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-1">Data Aggregation</h4>
          <p>
            All individual responses are aggregated using mean scores across the four culture 
            types. Delta calculations show the difference between preferred and current scores, 
            indicating the magnitude and direction of desired cultural change.
          </p>
        </div>

        <div className="pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            This assessment is based on the Competing Values Framework and Organizational 
            Culture Assessment Instrument (OCAI). Results are for internal use and should 
            be considered alongside other organizational data and context.
          </p>
        </div>
      </div>
    </div>
  )
}

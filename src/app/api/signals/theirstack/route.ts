import { NextResponse } from 'next/server'

// TheirStack API for job posting signals
const THEIRSTACK_API_URL = 'https://api.theirstack.com/v1'

export async function POST(request: Request) {
  try {
    const { companies } = await request.json()
    
    if (!process.env.THEIRSTACK_API_KEY) {
      return NextResponse.json(
        { error: 'TheirStack API key not configured' },
        { status: 500 }
      )
    }

    // Fetch job postings for specified companies
    const jobSignals = await fetchJobPostings(companies)
    
    return NextResponse.json({ signals: jobSignals })
  } catch (error: any) {
    console.error('TheirStack API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job signals' },
      { status: 500 }
    )
  }
}

async function fetchJobPostings(companies: string[]) {
  const signals = []
  
  for (const company of companies) {
    try {
      const response = await fetch(THEIRSTACK_API_URL + '/jobs/search', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.THEIRSTACK_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: company,
          posted_at_max_age_days: 30,
          limit: 20,
        }),
      })

      if (!response.ok) {
        console.error('TheirStack error for ' + company + ': ' + response.status)
        continue
      }

      const data = await response.json()
      
      if (data.jobs && data.jobs.length > 0) {
        const jobCount = data.jobs.length
        const recentJobs = data.jobs.slice(0, 5)
        
        signals.push({
          company_name: company,
          signal_type: 'job_posting',
          details: jobCount + ' new job postings in the last 30 days',
          strength: calculateJobSignalStrength(jobCount, recentJobs),
          metadata: {
            job_count: jobCount,
            recent_titles: recentJobs.map((j: any) => j.title),
          },
        })
      }
    } catch (error) {
      console.error('Error fetching jobs for ' + company + ':', error)
    }
  }
  
  return signals
}

function calculateJobSignalStrength(count: number, jobs: any[]): number {
  let strength = Math.min(count * 5, 50)
  strength += Math.min(jobs.length * 10, 50)
  return Math.min(strength, 100)
}
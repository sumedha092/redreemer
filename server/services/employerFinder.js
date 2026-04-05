/**
 * Feature 9: Fair-Chance Employer Finder
 * Returns real Phoenix-area employers with fair-chance hiring policies.
 */

const EMPLOYERS = [
  {
    name: 'Chicanos Por La Causa',
    type: 'job training + placement',
    phone: '(602) 257-0700',
    address: '1112 E Buckeye Rd, Phoenix',
    notes: 'Explicitly hires people with records. Ask for workforce development.',
    priority: ['reentry', 'both'],
  },
  {
    name: 'Goodwill of Central AZ',
    type: 'retail + warehouse',
    phone: '(602) 371-6960',
    website: 'goodwillaz.org/jobs',
    notes: 'Fair chance policy. Apply online or walk in.',
    priority: ['homeless', 'reentry', 'both'],
  },
  {
    name: 'Arizona@Work Phoenix',
    type: 'free job training + placement',
    phone: '(602) 506-3880',
    address: '1789 W Jefferson St, Phoenix',
    notes: 'Free resume help, interview prep, and job matching.',
    priority: ['homeless', 'reentry', 'both'],
  },
  {
    name: "Dave's Killer Bread Foundation",
    type: 'food manufacturing (partner employers)',
    website: 'dkbfoundation.org/second-chance-employment',
    notes: 'Specifically second-chance hiring program.',
    priority: ['reentry', 'both'],
  },
  {
    name: 'PetSmart (HQ Phoenix)',
    type: 'retail',
    website: 'petsmart.com/careers',
    notes: 'Known for fair-chance hiring practices in AZ.',
    priority: ['homeless', 'reentry', 'both'],
  },
  {
    name: 'Maricopa County',
    type: 'government jobs',
    website: 'maricopa.gov/jobs',
    notes: 'Ban-the-box policy — apply before background check.',
    priority: ['reentry', 'both'],
  },
]

const CALL_SCRIPT = `When you call, you don't have to mention your record upfront — these employers have fair-chance policies which means they evaluate you as a person first.`

/**
 * Returns top 3 fair-chance employers for a user type.
 * Prioritizes employers that explicitly serve the user's situation.
 */
export function getFairChanceEmployers(userType = 'homeless') {
  const prioritized = EMPLOYERS.filter(e => e.priority.includes(userType))
  const others = EMPLOYERS.filter(e => !e.priority.includes(userType))
  const sorted = [...prioritized, ...others].slice(0, 3)
  return sorted
}

/**
 * Format employer list as plain text for SMS.
 */
export function formatEmployersForSMS(userType = 'homeless') {
  const employers = getFairChanceEmployers(userType)
  const lines = employers.map((e, i) => {
    const parts = [`${i + 1}. ${e.name} (${e.type})`]
    if (e.phone) parts.push(`   Call: ${e.phone}`)
    if (e.website) parts.push(`   Web: ${e.website}`)
    if (e.address) parts.push(`   ${e.address}`)
    parts.push(`   ${e.notes}`)
    return parts.join('\n')
  })
  return lines.join('\n\n') + '\n\n' + CALL_SCRIPT
}

/**
 * Detect job-seeking keywords in a message.
 */
export function detectJobKeywords(message) {
  const lower = message.toLowerCase()
  const keywords = ['job', 'work', 'hiring', 'employment', 'need a job', 'looking for work', 'find work', 'get a job', 'employer', 'career', 'busco trabajo', 'empleo', 'trabajo']
  return keywords.some(kw => lower.includes(kw))
}

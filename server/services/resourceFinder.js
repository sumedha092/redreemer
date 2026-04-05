/**
 * Step-aware resource finder.
 * Returns real local resources for Phoenix, AZ based on the user's current step.
 */

const RESOURCES = {
  homeless: {
    1: [
      { name: 'Human Services Campus', address: '204 S 12th Ave Phoenix', phone: '(602) 256-6945', note: 'Largest shelter campus in AZ' },
      { name: 'St. Vincent de Paul', address: '420 W Watkins St', phone: '(602) 261-6850', note: 'Meals + shelter' },
      { name: 'UMOM New Day Centers', phone: '(602) 343-0333', note: 'Families + individuals' },
      { name: 'Salvation Army', address: '2707 E Van Buren St', phone: '(602) 267-4100', note: 'Emergency shelter' },
    ],
    2: [
      { name: 'AZ DES Document Recovery', url: 'des.az.gov/node/366', note: 'Free ID recovery program' },
      { name: 'Free Birth Certificate', url: 'azdhs.gov', note: '$20 fee waived for homeless with shelter letter' },
      { name: 'Free State ID at MVD', phone: '(602) 255-0072', note: 'MVD Now kiosks — no appointment needed' },
      { name: 'Maricopa County Recorder', phone: '(602) 506-3535', note: 'Vital records' },
    ],
    3: [
      { name: "St. Mary's Food Bank", phone: '(602) 242-3663', note: 'Free groceries' },
      { name: 'André House', address: '1112 S 12th Ave', note: 'Daily meals 5pm — no ID required' },
      { name: 'CASS Overflow', phone: '(602) 256-6945', note: 'Emergency shelter + hygiene' },
    ],
    4: [
      { name: 'Chase Bank On Checking', note: 'No minimum, no overdraft fees, no monthly fee. Bring state ID.' },
      { name: 'Wells Fargo Clear Access', note: '$5/month, no overdraft. Bank On certified.' },
      { name: 'OneUnited Bank', note: 'Designed for communities rebuilding credit.' },
      { name: 'How to open', note: 'Bring state ID or passport. Some accept foreign ID. $25 opening deposit (waived at some locations).' },
    ],
    5: [
      { name: 'Chicanos Por La Causa', address: '1112 E Buckeye Rd, Phoenix', phone: '(602) 257-0700', note: 'Fair chance hiring + job training' },
      { name: 'Goodwill of Central AZ', url: 'goodwillaz.org/jobs', phone: '(602) 371-6960', note: 'Fair chance policy' },
      { name: 'Arizona@Work', url: 'arizonaatwork.com', phone: '(602) 506-3880', note: 'Free job training + placement' },
      { name: "Dave's Killer Bread Foundation", url: 'dkbfoundation.org', note: 'Second chance employment program' },
    ],
    6: [
      { name: 'Self Financial Credit Builder', url: 'self.inc', note: '$25-$150/month, reports to all 3 bureaus' },
      { name: 'Discover It Secured Card', note: 'No annual fee, graduates to regular card in 7 months' },
      { name: 'TruWest Credit Union', note: 'Accepts limited credit history' },
    ],
    7: [
      { name: 'AZ Rental Assistance', url: '211arizona.org', note: 'Emergency rental help' },
      { name: 'HUD Housing Counselors', url: 'hud.gov/findacounselor', note: 'Free housing guidance' },
      { name: 'Section 8 Waitlist', url: 'maricopa.gov/3564/Housing', note: 'Maricopa County housing authority' },
    ],
    8: [
      { name: 'CPLC Financial Coaching', phone: '(602) 257-0700', note: 'Free financial counseling' },
      { name: 'Accion Opportunity Fund', url: 'accionopportunity.org', note: 'IDA matched savings programs' },
    ],
  },
  reentry: {
    1: [
      { name: 'Human Services Campus', address: '204 S 12th Ave Phoenix', phone: '(602) 256-6945', note: 'Accepts people with records' },
      { name: 'Salvation Army', address: '2707 E Van Buren St', phone: '(602) 267-4100', note: 'Reentry-friendly shelter' },
    ],
    2: [
      { name: 'AZ Dept of Corrections Reentry', phone: '(602) 542-5497', note: 'Parole check-in + reentry services' },
      { name: 'Community Legal Services', address: 'clsaz.org', phone: '(602) 258-3434', note: 'Free legal help for reentry' },
    ],
    3: [
      { name: 'AZ DES Document Recovery', url: 'des.az.gov/node/366', note: 'Free ID — parole paperwork waives fee' },
      { name: 'Free State ID at MVD', phone: '(602) 255-0072', note: 'Parole paperwork waives the $12 fee' },
    ],
    4: [
      { name: 'OneUnited Bank', note: 'Specifically serves people rebuilding credit. No ChexSystems barrier.' },
      { name: 'Wells Fargo Clear Access', note: 'Bank On certified. $5/month. Accepts people with banking history issues.' },
    ],
    5: [
      { name: 'Chicanos Por La Causa', address: '1112 E Buckeye Rd, Phoenix', phone: '(602) 257-0700', note: 'Explicitly hires people with records' },
      { name: 'Arizona@Work Phoenix', address: '1789 W Jefferson St', phone: '(602) 506-3880', note: 'Free resume + interview prep' },
      { name: 'Maricopa County Jobs', url: 'maricopa.gov/jobs', note: 'Ban-the-box policy — apply before background check' },
    ],
    6: [
      { name: 'Community Legal Services', phone: '(602) 258-3434', note: 'Free help reducing court debt' },
      { name: 'AZ Justice Project', url: 'azjusticeproject.org', note: 'Free legal aid for record issues' },
    ],
    7: [
      { name: 'Self Financial Credit Builder', url: 'self.inc', note: 'No credit check to start' },
      { name: 'Discover It Secured Card', note: 'No annual fee, builds credit in 7 months' },
    ],
    8: [
      { name: 'CPLC Financial Coaching', phone: '(602) 257-0700', note: 'Free financial counseling' },
      { name: 'Accion Opportunity Fund', url: 'accionopportunity.org', note: 'Small business + savings programs' },
    ],
  }
}

/**
 * Returns resources for a given step and user type.
 * Falls back to homeless resources if reentry-specific not found.
 */
export function getResourcesForStep(stepNumber, userType = 'homeless') {
  const step = Math.max(1, Math.min(8, stepNumber))
  const type = userType === 'reentry' ? 'reentry' : 'homeless'
  const resources = RESOURCES[type][step] || RESOURCES.homeless[step] || []
  return resources
}

/**
 * Format resources as a plain-text string for injection into Gemini system prompt.
 */
export function formatResourcesForPrompt(stepNumber, userType = 'homeless') {
  const resources = getResourcesForStep(stepNumber, userType)
  if (!resources.length) return ''

  return resources.map(r => {
    const parts = [r.name]
    if (r.address) parts.push(r.address)
    if (r.phone) parts.push(r.phone)
    if (r.url) parts.push(r.url)
    if (r.note) parts.push(`(${r.note})`)
    return parts.join(' — ')
  }).join('\n')
}

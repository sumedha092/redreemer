export const MOCK_CLIENTS = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    name: 'Marcus',
    phone_number: '+15550000001',
    user_type: 'homeless',
    city: 'Chicago',
    current_step: 4,
    last_active: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    caseworker_id: 'a0000000-0000-0000-0000-000000000001',
    conversations: [
      { role: 'user', content: 'I need food tonight', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Greater Chicago Food Depository is open until 7pm at 4100 W Ann Lurie Pl. They have hot meals tonight. Also, Pacific Garden Mission at 1458 S Canal St serves dinner at 5:30pm — no ID required. Bank On accounts have no minimum balance, so every dollar you save is safe.', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'How do I open a bank account without an address?', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'You can use your shelter address — Pacific Garden Mission allows this. Go to Chase Bank at 21 S Clark St with your state ID and shelter letter. Ask for a Bank On account. Takes 20 minutes, no credit check. Bank On accounts have no minimum balance and no ChexSystems check — opening one starts your credit journey.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
      { step_number: 2, completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Got free state ID at Chicago DMV' },
      { step_number: 3, completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Using Pacific Garden Mission address for mail' },
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    name: 'James',
    phone_number: '+15550000002',
    user_type: 'reentry',
    city: 'Atlanta',
    current_step: 3,
    last_active: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    caseworker_id: 'a0000000-0000-0000-0000-000000000001',
    conversations: [
      { role: 'user', content: "I just got out. I don't know where to go.", created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'First thing: your parole check-in. Atlanta Parole Office is at 156 Pryor St SW, open 8am-5pm. Take the MARTA Gold Line to Five Points station, 3 minute walk. Bring your release papers. SNAP benefits average $200/month — you qualify and can apply at dfcs.georgia.gov.', created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'user', content: 'Where can I get my ID?', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Georgia DDS office at 2206 Eastview Pkwy, Conyers — bring your release papers, they count as proof of identity. Free for people recently released. Hours: Mon-Fri 8am-4:30pm. An ID is your financial passport — without it, no bank will open an account for you.', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
      { step_number: 2, completed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Completed first parole check-in at Atlanta Parole Office' },
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Darnell',
    phone_number: '+15550000003',
    user_type: 'both',
    city: 'Detroit',
    current_step: 2,
    last_active: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // inactive 6 days — will show flag
    caseworker_id: 'a0000000-0000-0000-0000-000000000001',
    crisis_flag: false,
    conversations: [
      { role: 'user', content: 'I need help with everything', created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: "Got it. You're dealing with a lot. Let's start with the most urgent thing — do you have a safe place to sleep tonight?", created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
    ]
  }
]

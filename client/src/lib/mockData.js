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
      { role: 'assistant', content: 'Greater Chicago Food Depository is open until 7pm at 4100 W Ann Lurie Pl. They have hot meals tonight. Also, Pacific Garden Mission at 1458 S Canal St serves dinner at 5:30pm — no ID required.', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
      { role: 'user', content: 'How do I open a bank account without an address?', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'You can use your shelter address — Pacific Garden Mission allows this. Go to Chase Bank at 21 S Clark St with your state ID and shelter letter. Ask for a Bank On account. Takes 20 minutes, no credit check. Bank On accounts have no minimum balance and no ChexSystems check — opening one starts your credit journey.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
      { step_number: 2, completed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Got free state ID at Chicago DMV' },
      { step_number: 3, completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Using Pacific Garden Mission address for mail' },
    ],
    notes: [
      { id: 1, content: 'Called shelter coordinator — Marcus is on waitlist for transitional housing. Follow up in 2 weeks.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, content: 'Helped Marcus complete Bank On application at Chase. Account opened — gave him the app download link.', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    reminders: [
      { id: 1, reminder_text: 'Follow up on transitional housing waitlist', send_at: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), sent: false },
      { id: 2, reminder_text: 'Check if SNAP benefits were approved', send_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), sent: true },
    ],
    financial_health_score: 48,
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
      { role: 'assistant', content: 'First thing: your parole check-in. Atlanta Parole Office is at 156 Pryor St SW, open 8am-5pm. Take the MARTA Gold Line to Five Points station, 3 minute walk. Bring your release papers. SNAP benefits average $200/month — you qualify and can apply at dfcs.georgia.gov.', created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
      { role: 'user', content: 'Where can I get my ID?', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: 'Georgia DDS office at 2206 Eastview Pkwy, Conyers — bring your release papers, they count as proof of identity. Free for people recently released. Hours: Mon-Fri 8am-4:30pm.', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
      { step_number: 2, completed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Completed first parole check-in at Atlanta Parole Office' },
    ],
    notes: [
      { id: 3, content: 'James has a job interview at Dollar General next Thursday. Reminded him about dress code and to bring ID.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
    reminders: [
      { id: 3, reminder_text: 'Job interview at Dollar General — check in with James', send_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), sent: false },
      { id: 4, reminder_text: 'Parole check-in due', send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), sent: false },
    ],
    financial_health_score: 35,
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    name: 'Darnell',
    phone_number: '+15550000003',
    user_type: 'both',
    city: 'Detroit',
    current_step: 2,
    last_active: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    caseworker_id: 'a0000000-0000-0000-0000-000000000001',
    crisis_flag: false,
    conversations: [
      { role: 'user', content: 'I need help with everything', created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { role: 'assistant', content: "Got it. You're dealing with a lot. Let's start with the most urgent thing — do you have a safe place to sleep tonight?", created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 30000).toISOString() },
    ],
    stepLogs: [
      { step_number: 1, completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Connected to Redreemer' },
    ],
    notes: [],
    reminders: [
      { id: 5, reminder_text: 'Darnell has not responded in 6 days — try calling', send_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), sent: false },
    ],
    financial_health_score: 22,
  },
]

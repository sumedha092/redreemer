/**
 * Money Personality Quiz — SMS version.
 * 4 questions, one at a time. Classifies into survivor/planner/builder.
 * Stores result in user_meta JSONB.
 */

export const QUIZ_QUESTIONS_EN = [
  `Quick question — when you had money in the past, what usually happened to it?
A) I spent it right away on things I needed or wanted
B) I tried to save but emergencies kept coming up
C) I avoided thinking about money — it stressed me out
D) I was pretty careful with it`,

  `If someone gave you $200 right now, what's the first thing you'd do?
A) Spend it on something I've been needing
B) Put most of it away somewhere safe
C) I honestly don't know — I'd probably panic a little
D) Make a plan for exactly how to use it`,

  `When a bill or expense comes up that you weren't expecting, how do you usually feel?
A) I deal with it — figure something out
B) Stressed but I try to handle it
C) Completely overwhelmed
D) I had a backup plan`,

  `What feels true about your relationship with money?
A) Money controls me more than I control it
B) I know what I should do, I just don't always do it
C) I don't really understand how money works
D) I feel pretty capable when I'm not in crisis`,
]

export const QUIZ_QUESTIONS_ES = [
  `Pregunta rápida — cuando tenías dinero en el pasado, ¿qué solía pasar?
A) Lo gastaba de inmediato en cosas que necesitaba o quería
B) Intentaba ahorrar pero las emergencias seguían llegando
C) Evitaba pensar en el dinero — me estresaba
D) Era bastante cuidadoso/a con él`,

  `Si alguien te diera $200 ahora mismo, ¿qué harías primero?
A) Gastar en algo que he necesitado
B) Guardar la mayor parte en algún lugar seguro
C) Honestamente no sé — probablemente me entraría pánico
D) Hacer un plan exacto de cómo usarlo`,

  `Cuando surge un gasto inesperado, ¿cómo te sientes normalmente?
A) Lo manejo — encuentro la manera
B) Estresado/a pero trato de manejarlo
C) Completamente abrumado/a
D) Tenía un plan de respaldo`,

  `¿Qué es verdad sobre tu relación con el dinero?
A) El dinero me controla más de lo que yo lo controlo
B) Sé lo que debo hacer, simplemente no siempre lo hago
C) No entiendo muy bien cómo funciona el dinero
D) Me siento bastante capaz cuando no estoy en crisis`,
]

const RESULTS_EN = {
  survivor: {
    type: 'survivor',
    message: `You're a Survivor — you make things work under pressure. That's a real skill. We're going to build on that by making sure money stops feeling like an emergency and starts feeling manageable.`,
  },
  planner: {
    type: 'planner',
    message: `You're a Planner at heart — you want to do the right thing but life keeps getting in the way. We're going to remove the obstacles one by one.`,
  },
  builder: {
    type: 'builder',
    message: `You're a Builder — you think ahead and you're ready to learn. Let's put that energy to work and get your foundation solid fast.`,
  },
}

const RESULTS_ES = {
  survivor: {
    type: 'survivor',
    message: `Eres un Sobreviviente — haces que las cosas funcionen bajo presión. Esa es una habilidad real. Vamos a construir sobre eso para que el dinero deje de sentirse como una emergencia.`,
  },
  planner: {
    type: 'planner',
    message: `Eres un Planificador de corazón — quieres hacer lo correcto pero la vida sigue interponiéndose. Vamos a eliminar los obstáculos uno por uno.`,
  },
  builder: {
    type: 'builder',
    message: `Eres un Constructor — piensas con anticipación y estás listo para aprender. Pongamos esa energía a trabajar y construyamos tu base rápidamente.`,
  },
}

/**
 * Classify quiz answers into a money personality type.
 * answers: array of 4 strings like ['A', 'B', 'C', 'D']
 */
export function classifyMoneyPersonality(answers) {
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  for (const a of answers) {
    const letter = a.trim().toUpperCase().charAt(0)
    if (counts[letter] !== undefined) counts[letter]++
  }

  // Mostly A or C → survivor
  if (counts.A + counts.C >= 2) return 'survivor'
  // Mostly D → builder
  if (counts.D >= 2) return 'builder'
  // Default → planner
  return 'planner'
}

/**
 * Get the result message for a personality type.
 */
export function getPersonalityResult(type, lang = 'en') {
  const results = lang === 'es' ? RESULTS_ES : RESULTS_EN
  return results[type] || results.survivor
}

/**
 * Get quiz question by index (0-3).
 */
export function getQuizQuestion(index, lang = 'en') {
  const questions = lang === 'es' ? QUIZ_QUESTIONS_ES : QUIZ_QUESTIONS_EN
  return questions[index] || null
}

/**
 * Check if a message looks like a quiz answer (A/B/C/D).
 */
export function isQuizAnswer(message) {
  return /^[abcdABCD][\s\.\)]*$/.test(message.trim()) || /^[abcdABCD]\b/.test(message.trim())
}

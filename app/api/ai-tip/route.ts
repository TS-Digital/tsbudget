import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request) {
  const { net, committed, savings, biggestCategory } = await request.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ tip: null, error: 'AI not configured' }, { status: 503 })
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: `You are TSBudget AI, a UK-focused personal finance assistant.
You help people understand their take-home pay, budget their money, and make
smarter financial decisions. Always give practical, concise advice in exactly 3 bullet
points (use • as bullet). Never give regulated financial advice. Tone: clear, warm, direct.
Format: return ONLY the 3 bullet points, no preamble, no header.`,
    messages: [
      {
        role: 'user',
        content: `My monthly net income is £${net}. I spend £${committed} on fixed costs.
I save £${savings}/month. My biggest expense category is ${biggestCategory}.
Give me 3 specific, actionable budgeting tips.`,
      },
    ],
  })

  const content = message.content[0]
  const tip = content.type === 'text' ? content.text : null

  return Response.json({ tip })
}

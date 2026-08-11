import { openrouter } from "./client"

// Free models rotate constantly on OpenRouter.
// We use openrouter/free as primary — it auto-picks the best available free model.
// Specific models are kept as named fallbacks but the autorouter handles availability.
export const FREE_MODELS = {
  autoRouter: "openrouter/free",
  coding: "cohere/north-mini-code:free",
  reasoning: "nvidia/nemotron-3-ultra-550b-a55b:free",
  general: "google/gemma-4-31b-it:free",
  gptOss: "openai/gpt-oss-20b:free",
  nemotron: "nvidia/nemotron-3-super-120b-a12b:free",
  gemma: "google/gemma-4-26b-a4b-it:free",
} as const

// Both tools use autoRouter as primary — always available
// Falls back through specific models if autoRouter somehow fails
export const MODEL_FOR_TOOL = {
  legal: FREE_MODELS.autoRouter,
  code: FREE_MODELS.autoRouter,
} as const

// Fallback chain — autoRouter first, then specific models
const FALLBACK_CHAIN = [
  FREE_MODELS.autoRouter,
  FREE_MODELS.coding,
  FREE_MODELS.reasoning,
  FREE_MODELS.gptOss,
  FREE_MODELS.general,
  FREE_MODELS.nemotron,
  FREE_MODELS.gemma,
]

export async function streamWithFallback(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[]
  toolType: "legal" | "code"
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (err: string) => void
}): Promise<void> {
  for (const model of FALLBACK_CHAIN) {
    try {
      const stream = await openrouter.chat.completions.create({
        model,
        messages: options.messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.1,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (!delta) continue
        try {
          options.onChunk(delta)
        } catch {
          return
        }
      }

      options.onDone()
      return

    } catch (err: unknown) {
      const error = err as { status?: number; message?: string }
      if (error?.status === 429 || error?.status === 503 || error?.status === 502) {
        console.warn(`[AI] Model ${model} unavailable (${error.status}), trying next...`)
        if (error?.status === 429) {
          await new Promise((r) => setTimeout(r, 2000))
        }
        continue
      }
      // Unknown error — try next model instead of crashing
      console.warn(`[AI] Model ${model} failed: ${error?.message}, trying next...`)
      continue
    }
  }

  options.onError(
    "All AI models are temporarily unavailable. Please try again in a moment."
  )
}

import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { analyzeWallet } from "@/lib/reputation-engine";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const BodySchema = z.object({
  wallet: z.string().regex(BASE58, "Invalid Solana wallet address"),
});

export const Route = createFileRoute("/api/reputation")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
        }

        const result = analyzeWallet(parsed.data.wallet);

        // Optional AI-generated explainability layer.
        const apiKey = process.env.LOVABLE_API_KEY;
        if (apiKey) {
          try {
            const gateway = createLovableAiGatewayProvider(apiKey);
            const model = gateway("google/gemini-3-flash-preview");

            const { text } = await generateText({
              model,
              prompt: `You are CredLayer's AI reputation engine. Given the wallet analysis below, return STRICT JSON (no markdown, no code fences) with exactly these keys:
{
  "summary": "<one sentence executive summary>",
  "insights": ["<bullet 1>", "<bullet 2>", "<bullet 3>"]
}
Be specific to the data. 3-5 insights. No hype.

Wallet: ${result.wallet}
Trust score: ${result.trust_score}/100 (${result.risk_level})
Confidence: ${result.confidence}
Flags: ${result.flags.join(", ") || "none"}
Features: ${JSON.stringify(result.features)}`,
            });

            const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
            const parsedAi = JSON.parse(cleaned) as { summary?: string; insights?: string[] };

            return Response.json({
              ...result,
              ai_summary: parsedAi.summary,
              insights: Array.isArray(parsedAi.insights) && parsedAi.insights.length ? parsedAi.insights : result.insights,
            });
          } catch (err) {
            console.error("[reputation] AI error:", err, (err as any)?.cause?.value);
            const status = (err as { statusCode?: number })?.statusCode;
            if (status === 429) {
              return Response.json({ ...result, ai_error: "Rate limited — using rule-based insights." });
            }
            if (status === 402) {
              return Response.json({ ...result, ai_error: "AI credits exhausted — using rule-based insights." });
            }
            // Fall through with deterministic result
            return Response.json({ ...result, ai_error: "AI insights unavailable." });
          }
        }

        return Response.json(result);
      },
    },
  },
});

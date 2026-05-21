/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback response in case GEMINI_API_KEY is not defined or fails
function getFallbackAnalysis(data: any) {
  const { name, monthlyIncome, rent, bills, foodLifestyle, debtPayments, subscriptions, otherSpending } = data;
  
  const totalSpending = rent + bills + foodLifestyle + debtPayments + subscriptions + otherSpending;
  const netRemaining = monthlyIncome - totalSpending;
  const housingRatioPercent = ((rent / monthlyIncome) * 100).toFixed(1);
  const debtPressurePercent = ((debtPayments / monthlyIncome) * 100).toFixed(1);

  return {
    freeInsights: [
      `Strategic Balance Alert: Your housing ratio is currently ${housingRatioPercent}% of total incoming revenue. Wealth advisory standards suggest keeping this under 30% for high capital efficiency.`,
      `Analysis: Fixed monthly recurring charges (bills + subscriptions) lock in $${(bills + subscriptions).toLocaleString()} before accounting for lifestyle assets or debt relief.`,
      `Efficiency: Your remaining discretionary liquid margin of $${netRemaining.toLocaleString()} allows for a maximum capital growth rate of ${((netRemaining / monthlyIncome) * 100).toFixed(1)}% if optimized.`,
    ],
    premiumStrategy: `
# WEALTHYNX PREMIUM: DISCRETIONARY CAPITAL OPTIMIZATION PORTFOLIO
Prepared for **${name}** (${data.email || 'Client Node'}) | *Educational & Wealth Strategy Reference Only*

### SECTION 1: SYSTEM DIAGNOSTIC ANALYSIS
Your budget highlights a net monthly remainder of **$${netRemaining.toLocaleString()}** (net monthly cash surplus). Here are the structural elements our system identified:
- **Rent/Housing load**: At ${housingRatioPercent}%, your shelter costs represent a ${parseFloat(housingRatioPercent) > 30 ? "high drag coefficient relative to optimal wealth preservation" : "healthy baseline footprint"}.
- **Debt Pressure**: Your debt payment burden uses ${debtPressurePercent}% of monthly resources. Eliminating high-yield interest traps represents your fastest route to compound interest benefits.

### SECTION 2: THE 3-STAGE WEALTH ACCELERATION PROTOCOL

#### Phase 1: Subscription Audit & Rate Optimization (Month 1)
Audit your current monthly subscription volume ($${subscriptions.toLocaleString()}). Consolidate any services with less than 3 active uses per month. For core utility bills ($${bills.toLocaleString()}), use direct negotiations to lower baseline rates or move to high-retention promotion tiers.

#### Phase 2: Systematic Debt Elimination (Months 2-6)
Allocate 70% of your remaining $${netRemaining > 0 ? netRemaining.toLocaleString() : "0"} discretionary surplus exclusively to your highest-interest debt accounts. Maintain basic minimum balances elsewhere. Once the primary high-interest target is eliminated, redirect the full weight of that payment to the next tier.

#### Phase 3: The 3-Month Liquidity Core (Months 6-12)
Accumulate a pristine liquidity reserve of at least $${(totalSpending * 3).toLocaleString()} (representing 3 months of emergency baseline expenditure). Place this reserve in separate high-yield interest accounts distinct from your transactional checking vector.

### SECTION 3: PORTFOLIO OUTCOME PROJECTIONS
By securing lower fixed rates and optimizing leisure spending from $${foodLifestyle.toLocaleString()} to $${(foodLifestyle * 0.8).toLocaleString()} (a direct 20% savings yield), you can feed an extra **$${(foodLifestyle * 0.2).toLocaleString()}** into capital wealth projects monthly, turning historical lifestyle expenses into long-term compounding assets.
    `.trim(),
    downloadBlueprint: `
=========================================
     WEALTHYNX PREMIUM WEALTH BLUEPRINT
=========================================
User: ${name}
Email: ${data.email || 'N/A'}
Date Generated: ${new Date().toISOString().split('T')[0]}
-----------------------------------------

FINANCIAL STATEMENT OVERVIEW:
- Gross Income:       $${monthlyIncome.toLocaleString()}
- Total Expenditures: $${totalSpending.toLocaleString()}
- Net Monthly Margin: $${netRemaining.toLocaleString()}

EXPENDITURE BREAKDOWN:
- Rent & Shelter:     $${rent.toLocaleString()} (${housingRatioPercent}%)
- Standard Utilities: $${bills.toLocaleString()}
- Lifestyle & Food:   $${foodLifestyle.toLocaleString()}
- Active Debt Service: $${debtPayments.toLocaleString()} (${debtPressurePercent}%)
- Subscriptions:      $${subscriptions.toLocaleString()}
- Other Friction:     $${otherSpending.toLocaleString()}

-----------------------------------------
      PORTFOLIO STABILIZATION STRATEGY
-----------------------------------------
[ ] STEP 1: SHELTER RISK MITIGATION
    Your shelter ratio is ${housingRatioPercent}%. If this exceeds 30%, evaluate
    refinancing, sharing costs, or renegotiating lease options at completion lock.

[ ] STEP 2: INTEREST EXPEDITION
    Eliminate the highest-interest debt immediately by dedicating 70% of your
    $${netRemaining.toLocaleString()} remainder to it. Retain remaining 30% for emergency cushion.

[ ] STEP 3: LIFESTYLE REDUCTION (Target 15% reduction)
    Target Lifestyle ($${foodLifestyle.toLocaleString()}) and other spending. Small 
    micro-adjustments yield massive long-term compound growth.

DISCLAIMER: This is an educational document generated by Wealthynx Premium. 
It does not constitute certified legal, tax, or investment advice.
-----------------------------------------
Thank you for choosing Wealthynx Premium!
=========================================
    `.trim(),
  };
}

// REST Endpoint to generate budget insights
app.post("/api/gemini/generate", async (req, res) => {
  const data = req.body;
  
  if (!data || !data.name || typeof data.monthlyIncome === "undefined") {
    res.status(400).json({ error: "Missing required budget inputs." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("No valid GEMINI_API_KEY, using rule-based algorithmic analysis fallback.");
    const fallback = getFallbackAnalysis(data);
    res.json(fallback);
    return;
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are Wealthynx Premium's professional senior financial analyst and wealth optimizer. Analyze the following budget inputs precisely (all values monthly):
    - Name: ${data.name}
    - Email: ${data.email || "Non-disclosed"}
    - Monthly Income: $${data.monthlyIncome}
    - Rent / Housing: $${data.rent}
    - Bills: $${data.bills}
    - Food & Lifestyle: $${data.foodLifestyle}
    - Debt Payments (Balance & Service): $${data.debtPayments}
    - Subscriptions (SaaS, Streaming, Gym): $${data.subscriptions}
    - Other Discretionary Spending: $${data.otherSpending}

    Respond ONLY in JSON format corresponding to this TypeScript interface:
    {
      freeInsights: string[]; // Exactly 3 bullet points, each a detailed analytical sentence (without bold markdown asterisks inside), pointing out exact ratios, pain points, or suggestions for this data. Do NOT use the words CPA or AI.
      premiumStrategy: string; // Dynamic fully customized strategy in rich beautiful Markdown format (approximately 300-400 words) containing structural solutions, debt reduction suggestions (Snowball/Avalanche) adjusted for their high pressure nodes, housing rule commentary, and actionable targets. Include clean markdown headers, bold items, and paragraph spacings. DO NOT use the words CPA or AI.
      downloadBlueprint: string; // A highly detailed blueprint structure in rich raw ASCII plain text (with box boundaries, section lines, and checkbox lists) suitable for a downloaded system recovery text file, including current scores, customized allocations, and disclaimers. DO NOT use the words CPA or AI.
    }
    
    Ensure raw compliance: return valid JSON, and write in an expert, highly encouraging, but scientifically objective wealth consultant tone. Do NOT use any CPA or AI acronyms or branding in the response text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            freeInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three expert budget observations highlighting specific friction nodes"
            },
            premiumStrategy: {
              type: Type.STRING,
              description: "A comprehensive personalized strategic recovery plan in Markdown"
            },
            downloadBlueprint: {
              type: Type.STRING,
              description: "Raw formatted text recovery blueprint file contents with dividers"
            }
          },
          required: ["freeInsights", "premiumStrategy", "downloadBlueprint"]
        }
      }
    });

    const parsedResponse = JSON.parse(response.text || "{}");
    res.json({
      freeInsights: parsedResponse.freeInsights || getFallbackAnalysis(data).freeInsights,
      premiumStrategy: parsedResponse.premiumStrategy || getFallbackAnalysis(data).premiumStrategy,
      downloadBlueprint: parsedResponse.downloadBlueprint || getFallbackAnalysis(data).downloadBlueprint,
    });
  } catch (error: any) {
    console.error("Gemini API call failed, serving robust rule-based fallback:", error);
    const fallback = getFallbackAnalysis(data);
    res.json(fallback);
  }
});

// Configure Vite or Production static assets
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wealthynx Server running at http://0.0.0.0:${PORT} / Env: ${process.env.NODE_ENV || "development"}`);
  });
}

bootstrap().catch((err) => {
  console.error("Express bootstrap failed:", err);
});

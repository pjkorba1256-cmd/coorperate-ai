import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[route.ts] Inside route.ts: Received body", body);

    const backendUrl = process.env.NODE_ENV === 'production' 
      ? "https://khyati11-corporate-advisor-ai-agent.hf.space/predict"
      : "http://127.0.0.1:8000/predict";
      
    console.log(`[route.ts] Before FastAPI call: Fetching ${backendUrl}`);
    const response = await fetch(
      backendUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    console.log("[route.ts] After FastAPI response. Status:", response.status);
    const result = await response.json();
    console.log("[route.ts] FastAPI Result:", result);

    if (!response.ok) {
      return NextResponse.json(result, { status: response.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[route.ts] Prediction Error:", error);

    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[route.ts] Inside route.ts: Received body", body);

    console.log("[route.ts] Before FastAPI call: Fetching http://127.0.0.1:8000/predict");
    const response = await fetch(
      "http://127.0.0.1:8000/predict",
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("[route.ts] Prediction Error:", error);

    return NextResponse.json(
      { error: "Prediction failed" },
      { status: 500 }
    );
  }
}
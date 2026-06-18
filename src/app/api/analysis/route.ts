import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@backend/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user ? (session.user as any).id : null;

    if (!userId) {
      const demoUser = await prisma.user.upsert({
        where: { email: "demo@company.com" },
        update: {},
        create: { email: "demo@company.com", name: "Demo Executive" }
      });
      userId = demoUser.id;
    }

    const analyses = await prisma.analysis.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error("GET /api/analysis error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user ? (session.user as any).id : null;

    if (!userId) {
      const demoUser = await prisma.user.upsert({
        where: { email: "demo@company.com" },
        update: {},
        create: { email: "demo@company.com", name: "Demo Executive" }
      });
      userId = demoUser.id;
    }

    const body = await req.json();
    const {
      companyName,
      industry,
      companySize,
      revenue,
      businessGoals,
      datasetUrl,
      // Mock ML outputs that might be passed from the frontend after calling /api/predict
      readinessScore,
      roiForecast,
      costReduction,
      maturityLevel,
      predictedBenefit,
      boardroomReport,
      shapFeatures,
    } = body;

    if (!companyName || !industry || !companySize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newAnalysis = await prisma.analysis.create({
      data: {
        userId: userId,
        companyName,
        industry,
        companySize,
        revenue,
        businessGoals,
        datasetUrl,
        readinessScore,
        roiForecast,
        costReduction,
        maturityLevel,
        predictedBenefit,
        boardroomReport,
        shapFeatures,
      }
    });

    return NextResponse.json(newAnalysis, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/analysis error:", error);
    return NextResponse.json({ error: "Internal server error: " + error.message, stack: error.stack }, { status: 500 });
  }
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@frontend/components/Sidebar";
import TopBar from "@frontend/components/TopBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  TrendingUp, Clock, Gauge, Award, Plus, Download,
  BarChart3, FileText, Sparkles, AlertTriangle, Lightbulb,
  CheckCircle2, Layers, ArrowRight, Activity, Target
} from "lucide-react";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const mockResult = {
  analysis_id: "demo-001",
  industry: "Healthcare",
  company_size: "Enterprise",
  country: "United States",
  use_case: "Predictive Analytics",
  readiness_score_total: 68.3,
  readiness_tier: "Developing",
  roi_prediction: {
    roi_predicted_pct: 142.5,
    confidence_pct: 78.2,
    roi_min: 96.9,
    roi_max: 186.7,
    payback_period_months: 14,
    success_probability: 0.73,
  },
  scenarios: { conservative: 96.9, moderate: 142.5, aggressive: 186.7 },
  shap_features: [
    { feature: "Data Infrastructure", importance: 31 },
    { feature: "Industry Sector", importance: 24 },
    { feature: "Investment Budget", importance: 18 },
    { feature: "Talent Readiness", importance: 14 },
    { feature: "Timeline Length", importance: 8 },
    { feature: "Leadership Alignment", importance: 5 },
  ],
  readiness_breakdown: [
    { dimension: "Data Integration", score: 7.5 },
    { dimension: "Talent Depth", score: 6.0 },
    { dimension: "Leadership Buy-In", score: 8.0 },
    { dimension: "Tech Stack Maturity", score: 7.0 },
    { dimension: "Change Management", score: 5.5 },
    { dimension: "Data Quality Focus", score: 7.0 },
  ],
  recommendations: [
    { rank: 1, title: "Strengthen Data Pipelines", rationale: "Structured ETL pipelines represent the highest-impact factor for long-term ROI success.", difficulty: "Medium", timeline: "3-6 months", resources: ["Data Engineer (1-2)", "Cloud Budget ~$50K"] },
    { rank: 2, title: "Upskill Core AI/ML Teams", rationale: "Closing internal training gaps reduces deployment friction by ~34% in healthcare.", difficulty: "High", timeline: "6-12 months", resources: ["ML Engineer hire (2)", "Training budget ~$30K"] },
    { rank: 3, title: "Deploy Small Pilot Trial", rationale: "Phased deployment establishes team familiarity and builds executive alignment.", difficulty: "Low", timeline: "2-3 months", resources: ["1 Data Scientist", "$20K pilot budget"] },
    { rank: 4, title: "Outline Formal AI Governance", rationale: "Establishes standard security protocols and ensures HIPAA regulatory compliance.", difficulty: "Medium", timeline: "3-4 months", resources: ["Compliance Officer", "Policy Templates"] },
    { rank: 5, title: "Adopt Modern MLOps Tooling", rationale: "Reduces model drift management and continuous calibration costs in production.", difficulty: "High", timeline: "4-6 months", resources: ["MLOps Architect", "$15K platform cost"] },
  ],
  insights: {
    executive_summary: "Based on your Healthcare Enterprise profile with a readiness score of 68.3/100, your organization is well-positioned to achieve an estimated 142.5% ROI from AI adoption over the next 14 months. Your strongest assets are leadership alignment and technology infrastructure, while data integration and change management represent the primary acceleration opportunities.",
    key_findings: [
      "Your AI readiness score of 68.3/100 places you in the Developing tier — approaching readiness for scaled AI adoption.",
      "The predicted 142.5% ROI is above the industry benchmark of ~120% for comparable healthcare organizations.",
      "Data infrastructure investment will have the single highest impact on actual ROI realization.",
      "A phased adoption approach (Pilot → Scale → Optimize) is recommended given current readiness levels.",
    ],
    risk_factors: [
      "Data quality gaps may extend the breakeven timeline by 2-4 months if not addressed early.",
      "Talent scarcity in AI/ML roles requires proactive hiring in healthcare.",
      "Regulatory considerations (HIPAA, FDA AI guidance) may require additional compliance investment.",
    ],
    opportunities: [
      "Quick-win automation opportunities in clinical workflows could deliver ROI within 60 days.",
      "Industry peers are at a similar adoption stage — first-mover advantage available in next 18 months.",
      "Cloud AI services can reduce infrastructure costs by 40-60% vs. on-premises deployment.",
    ],
  },
};

// ─── Insight Box & Metric Pill ─────────────────────────────────────────────────
function InsightBox({ title, icon: Icon, color, children }: {
  title: string; icon: React.ElementType; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#f9fafb", border: `1px solid #e5e7eb`, borderLeft: `3px solid ${color}`, padding: "1.1rem 1.2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: "0.68rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: "0.12em" }}>{title}</span>
      </div>
      <div style={{ fontSize: "0.8rem", color: "#374151", lineHeight: 1.65, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

function MetricPill({ icon: Icon, label, value, subtext, accent }: {
  icon: React.ElementType; label: string; value: string; subtext?: string; accent: string;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderTop: `2px solid ${accent}`, padding: "0.85rem 1rem", display: "flex", alignItems: "center", gap: "0.85rem", transition: "box-shadow 0.2s" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(0,0,0,0.06)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
    >
      <div style={{ width: "34px", height: "34px", background: `${accent}12`, border: `1px solid ${accent}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color={accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.15rem" }}>{label}</p>
        <p style={{ fontSize: "1.3rem", fontWeight: 900, color: "#111827", fontFamily: "var(--font-display)", lineHeight: 1 }}>{value}</p>
      </div>
      {subtext && (
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#9ca3af" }}>
          {subtext}
        </span>
      )}
    </div>
  );
}

// ─── ROI Gauge ─────────────────────────────────────────────────────────────────
function ROIGauge({ value, min, max, confidence }: { value: number; min: number; max: number; confidence: number }) {
  const angle = Math.min((value / 300) * 180, 180);
  const needleX = 100 + 70 * Math.cos((Math.PI * (180 - angle)) / 180);
  const needleY = 80 - 70 * Math.sin((Math.PI * (180 - angle)) / 180);

  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", textAlign: "center", width: "100%", height: "100%" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: "260px", aspectRatio: "200/110", margin: "auto" }}>
        <svg viewBox="0 0 200 110" style={{ width: "100%", height: "100%" }}>
          <path d="M 20 80 A 80 80 0 0 1 180 80" fill="none" stroke="#f3f4f6" strokeWidth={14} strokeLinecap="round" />
          <path d="M 120 28 A 80 80 0 0 1 180 80" fill="none" stroke="rgba(16,185,129,0.12)" strokeWidth={14} strokeLinecap="round" />
          <path d={`M 20 80 A 80 80 0 0 1 ${needleX} ${needleY}`} fill="none" stroke="url(#gaugeGradCorp)" strokeWidth={14} strokeLinecap="round" />
          <defs>
            <linearGradient id="gaugeGradCorp" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a3a5c" />
              <stop offset="60%" stopColor="#2d5a8a" />
              <stop offset="100%" stopColor="#c8a96e" />
            </linearGradient>
          </defs>
          <line x1="100" y1="80" x2={needleX} y2={needleY} stroke="#1a3a5c" strokeWidth={3} strokeLinecap="round" />
          <circle cx="100" cy="80" r="6" fill="#1a3a5c" />
          <circle cx="100" cy="80" r="3" fill="#ffffff" />
          <text x="100" y="70" textAnchor="middle" fill="#111827" fontSize="26" fontWeight="900">{value}%</text>
          <text x="100" y="90" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="700" letterSpacing="0.1em">PREDICTED ROI</text>
        </svg>
      </div>
      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", marginTop: "1rem" }}>
        Confidence: <span style={{ color: "#1a3a5c", fontWeight: 800 }}>{confidence}%</span>&nbsp;•&nbsp;
        Range: <span style={{ color: "#111827", fontWeight: 800 }}>{min}% – {max}%</span>
      </div>
    </div>
  );
}

// ─── Difficulty Badge ──────────────────────────────────────────────────────────
function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, { color: string; bg: string; border: string }> = {
    Low: { color: "#10B981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
    Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
    High: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
  };
  const s = styles[level] || styles.Medium;
  return (
    <span style={{
      padding: "0.35rem 0.8rem", fontSize: "0.72rem", fontWeight: 800,
      textTransform: "uppercase", letterSpacing: "0.08em",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {level}
    </span>
  );
}

import { toast } from "sonner";
import { useEffect, use } from "react";

interface ShapFeature {
  feature: string;
  importance: number;
}

// ─── Results Page ──────────────────────────────────────────────────────────────
export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;

  const [activeTab, setActiveTab] = useState<"roi" | "recommendations" | "insights">("roi");
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch(`/api/analysis/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAnalysisData(data);
        } else {
          toast.error("Failed to load analysis");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analysis");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [id]);

  const handleExport = async () => {
    toast.info("Generating PDF Brief...", { id: "export" });
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId: id, format: 'pdf' })
      });
      if (res.ok) {
        toast.success("Brief generated successfully", { id: "export" });
        // Simulating download action
        window.open("/reports", "_blank");
      } else {
        toast.error("Failed to generate brief", { id: "export" });
      }
    } catch (e) {
      toast.error("Error generating brief", { id: "export" });
    }
  };

  const card = {
    background: "#ffffff", border: "1px solid #e5e7eb", padding: "1.6rem",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-f3f4f6">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  // Merge DB data with mock structure for display purposes
  const r: any = analysisData ? {
    ...mockResult,
    analysis_id: analysisData.id,
    industry: analysisData.industry ?? mockResult.industry,
    company_size: analysisData.companySize ?? mockResult.company_size,
    use_case: analysisData.businessGoals ?? mockResult.use_case,
    readiness_score_total: analysisData.readinessScore ?? mockResult.readiness_score_total,
    roi_prediction: {
      ...mockResult.roi_prediction,
      roi_predicted_pct: analysisData.roiForecast ?? mockResult.roi_prediction.roi_predicted_pct,
    },
    predictedBenefit: analysisData.predictedBenefit,
    boardroomReport: analysisData.boardroomReport,
    shap_features: analysisData.shapFeatures ?? mockResult.shap_features
  } : mockResult;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      <Sidebar />

      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <TopBar
          title="Analysis Report"
          subtitle={`${r.industry} · ${r.company_size} · ${r.use_case} · ID: ${r.analysis_id}`}
          actions={
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2.5">
              <Link href="/analysis/new"
                className="group relative flex items-center justify-center sm:gap-2 w-10 h-10 sm:w-auto sm:h-auto overflow-hidden rounded-full bg-white border-2 border-gray-200 sm:px-6 sm:py-2.5 font-bold text-gray-700 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5"
                style={{ textDecoration: "none" }}>
                <Plus size={20} className="relative z-10 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:rotate-90 text-gray-700" /> 
                <span className="relative z-10 hidden sm:inline text-[0.75rem] tracking-[0.1em] uppercase">New Run</span>
              </Link>
              <button
                onClick={handleExport}
                className="group relative flex items-center justify-center sm:gap-2 w-10 h-10 sm:w-auto sm:h-auto overflow-hidden rounded-full bg-gradient-to-r from-[#1a3a5c] to-[#2d5a8a] sm:px-6 sm:py-2.5 font-bold text-white shadow-[0_4px_12px_rgba(26,58,92,0.25)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(26,58,92,0.4)] hover:-translate-y-0.5"
                style={{ cursor: "pointer" }}>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
                <div className="relative z-10 flex items-center justify-center sm:bg-[#c8a96e] rounded-full w-full h-full sm:w-5 sm:h-5 sm:shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
                  <Download size={18} className="text-white sm:w-3 sm:h-3" strokeWidth={2.5} />
                </div>
                <span className="relative z-10 hidden sm:inline text-[0.75rem] tracking-[0.1em] uppercase">Export Brief</span>
              </button>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">

          {/* ── Metric Pills Row ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricPill icon={TrendingUp} label="Predicted ROI"   value={`${r.roi_prediction.roi_predicted_pct}%`} accent="#10B981" />
            <MetricPill icon={Clock}      label="Payback Period"  value={`${r.roi_prediction.payback_period_months} mo`} accent="#c8a96e" />
            <MetricPill icon={Gauge}      label="Readiness Index" value={`${r.readiness_score_total}`} subtext="/100" accent="#1a3a5c" />
            <MetricPill icon={Award}      label="Success Odds"    value={`${(r.roi_prediction.success_probability * 100).toFixed(0)}%`} accent="#f59e0b" />
          </div>

          {/* ── Tab Navigation ─── */}
          <div className="border-b-2 border-gray-200 flex overflow-x-auto whitespace-nowrap bg-white" style={{ scrollbarWidth: "none", marginBottom: "1rem" }}>
            {[
              { id: "roi", label: "ROI Projections", icon: TrendingUp },
              { id: "recommendations", label: "Strategic Roadmap", icon: Layers },
              { id: "insights", label: "Boardroom Insights", icon: Sparkles },
            ].map((tab: any) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "1.25rem 2rem", cursor: "pointer",
                    background: "none", border: "none",
                    borderBottom: `3px solid ${isActive ? "#c8a96e" : "transparent"}`,
                    marginBottom: "-2px",
                    fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                    color: isActive ? "#1a3a5c" : "#9ca3af",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── ROI Tab (Redesigned matching Dashboard) ─── */}
          {activeTab === "roi" && (
            <div className="flex flex-col gap-5">

              {/* Row 1: ROI Gauge + Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Chart (2/3) */}
                <div style={{ ...card, gridColumn: "span 2", display: "flex", flexDirection: "column" }} className="lg:col-span-2">
                  <div style={{ marginBottom: "1.25rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Performance Projection</p>
                        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>ROI Prediction Analysis</h2>
                      </div>
                    </div>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem" }} />
                  </div>
                  <div style={{ flex: 1, minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ROIGauge value={r.roi_prediction.roi_predicted_pct} min={r.roi_prediction.roi_min} max={r.roi_prediction.roi_max} confidence={r.roi_prediction.confidence_pct} />
                  </div>
                </div>

                {/* Narrative (1/3) */}
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Scenario Modeling</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>What This Means</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem", marginBottom: "0.85rem" }} />
                    <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.7 }}>
                      The baseline prediction for this initiative is <strong style={{ color: "#10B981" }}>{r.roi_prediction.roi_predicted_pct}% ROI</strong>. The confidence interval of {r.roi_prediction.confidence_pct}% indicates strong predictive stability.
                    </p>
                  </div>
                  <InsightBox title="Aggressive Scenario" icon={TrendingUp} color="#10B981">
                    In the best case (Aggressive), ROI could reach <strong>{r.scenarios.aggressive}%</strong> if user adoption hits 90% in Q1.
                  </InsightBox>
                  <InsightBox title="Conservative Scenario" icon={AlertTriangle} color="#ef4444">
                    In the worst case (Conservative), ROI is floored at <strong>{r.scenarios.conservative}%</strong> assuming prolonged implementation delays.
                  </InsightBox>
                </div>
              </div>

              {/* Row 2: Industry Benchmarks (Similar Organizations) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Narrative (1/3) */}
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Market Comparison</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Industry Benchmarks</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem", marginBottom: "0.85rem" }} />
                    <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.7 }}>
                      Comparing your projected <strong style={{ color: "#10B981" }}>{r.roi_prediction.roi_predicted_pct}% ROI</strong> against similar organizations in {r.industry} implementing Predictive Analytics.
                    </p>
                  </div>
                  <InsightBox title="Competitive Advantage" icon={Award} color="#f59e0b">
                    Your readiness places you in the <strong>Top 25%</strong> of peers. Organizations in this bracket typically achieve ROI realization 3 months faster.
                  </InsightBox>
                </div>

                {/* Chart (2/3) */}
                <div style={{ ...card, gridColumn: "span 2", display: "flex", flexDirection: "column" }} className="lg:col-span-2">
                  <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Peer Analysis</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Similar Organizations ROI</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem" }} />
                  </div>
                  <div style={{ flex: 1, minHeight: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[
                          { name: "BioData Sys", roi: 155.0, isUser: false },
                          { name: "Your Organization", roi: r.roi_prediction.roi_predicted_pct, isUser: true },
                          { name: "MedAI Inc.", roi: 135.5, isUser: false },
                          { name: "Industry Avg", roi: 120.0, isUser: false },
                          { name: "CarePredict", roi: 110.2, isUser: false },
                        ]} 
                        layout="vertical" 
                        margin={{ left: 20, right: 10, top: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                        <YAxis dataKey="name" type="category" tick={(props: any) => {
                          const isUser = props.payload.value === "Your Organization";
                          return (
                            <text x={props.x} y={props.y} dy={4} textAnchor="end" fill={isUser ? "#c8a96e" : "#374151"} fontSize={13} fontWeight={isUser ? 800 : 600}>
                              {props.payload.value}
                            </text>
                          );
                        }} axisLine={false} tickLine={false} width={130} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          itemStyle={{ color: "#1a3a5c", fontWeight: 700, fontSize: 12 }}
                          formatter={(v: any) => [`${v}%`, "Projected ROI"]}
                        />
                        <Bar dataKey="roi" radius={[0, 2, 2, 0]}>
                          {/* Use different colors based on isUser flag implicitly mapped from data array index */}
                          <Cell fill="#1a3a5c" opacity={0.6} />
                          <Cell fill="#c8a96e" />
                          <Cell fill="#1a3a5c" opacity={0.6} />
                          <Cell fill="#9ca3af" opacity={0.4} />
                          <Cell fill="#1a3a5c" opacity={0.6} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 3: Narrative + SHAP Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Narrative (1/3) */}
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Model Drivers</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Feature Attributions</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem", marginBottom: "0.85rem" }} />
                    <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.7 }}>
                      The SHAP analysis indicates which operational factors had the most influence on pushing your predicted ROI to {r.roi_prediction.roi_predicted_pct}%.
                    </p>
                  </div>
                  <InsightBox title="Top Influencer" icon={Target} color="#1a3a5c">
                    <strong>{r.shap_features[0].feature}</strong> contributes {r.shap_features[0].importance}% to the overall predictive weight, making it the most critical success factor.
                  </InsightBox>
                  <InsightBox title="Key Vulnerability" icon={AlertTriangle} color="#f59e0b">
                    <strong>{r.shap_features[3].feature}</strong> is lagging. Investing here will significantly increase the likelihood of hitting the aggressive scenario.
                  </InsightBox>
                </div>

                {/* Chart (2/3) */}
                <div style={{ ...card, gridColumn: "span 2", display: "flex", flexDirection: "column" }} className="lg:col-span-2">
                  <div style={{ marginBottom: "1rem", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>SHAP Explanations</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Attribution Weights</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem" }} />
                  </div>
                  <div style={{ flex: 1, minHeight: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={r.shap_features} layout="vertical" margin={{ left: 20, right: 10, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" />
                        <YAxis dataKey="feature" type="category" tick={{ fill: "#374151", fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} width={120} />
                        <Tooltip
                          contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                          itemStyle={{ color: "#1a3a5c", fontWeight: 700, fontSize: 12 }}
                          formatter={(v: any) => [`${v}%`, "Contribution"]}
                        />
                        <Bar dataKey="importance" radius={[0, 2, 2, 0]}>
                          {r.shap_features.map((entry: ShapFeature, index: number) => {
                            const opacity = Math.max(0.3, 1 - index * 0.1);
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={index % 2 === 0 ? `rgba(26,58,92,${opacity})` : `rgba(200,169,110,${opacity})`}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Row 3: Readiness Bars + Narrative */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Readiness Breakdown Bars (2/3) */}
                <div style={{ ...card, gridColumn: "span 2", display: "flex", flexDirection: "column" }} className="lg:col-span-2">
                  <div style={{ marginBottom: "1.25rem", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Dimensions</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Readiness Assessment</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem", marginBottom: "1rem" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                    {r.readiness_breakdown.map((dim: any) => {
                      const isHigh = dim.score >= 7.0;
                      const isMid = dim.score >= 5.0 && dim.score < 7.0;
                      const barColor = isHigh ? "#10B981" : isMid ? "#f59e0b" : "#ef4444";
                      const scoreColor = isHigh ? "#10B981" : isMid ? "#f59e0b" : "#ef4444";
                      return (
                        <div key={dim.dimension} style={{ padding: "1.2rem", background: "#f9fafb", border: "1px solid #f3f4f6", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#374151" }}>{dim.dimension}</span>
                            <span style={{ fontSize: "1rem", fontWeight: 900, color: scoreColor }}>{dim.score.toFixed(1)}</span>
                          </div>
                          <div style={{ width: "100%", height: "4px", background: "#e5e7eb", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${dim.score * 10}%`, height: "100%", background: barColor, borderRadius: "2px", transition: "width 0.5s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Narrative (1/3) */}
                <div style={{ ...card, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "0.2rem" }}>Operational Setup</p>
                    <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>Maturity Evaluation</h2>
                    <div style={{ width: "24px", height: "2px", background: "#c8a96e", marginTop: "0.5rem", marginBottom: "0.85rem" }} />
                    <p style={{ fontSize: "0.82rem", color: "#6b7280", lineHeight: 1.7 }}>
                      Your organization scored an overall <strong style={{ color: "#111827" }}>{r.readiness_score_total} / 100</strong>.
                    </p>
                  </div>
                  <InsightBox title="Strongest Pillar" icon={CheckCircle2} color="#10B981">
                    <strong>{r.readiness_breakdown[2].dimension}</strong> ({r.readiness_breakdown[2].score}) shows excellent alignment from executives, a crucial factor for overcoming deployment friction.
                  </InsightBox>
                  <InsightBox title="Weakest Pillar" icon={Activity} color="#ef4444">
                    <strong>{r.readiness_breakdown[4].dimension}</strong> ({r.readiness_breakdown[4].score}) represents a severe risk to adoption. Without an adoption plan, ROI will lean towards the conservative projection.
                  </InsightBox>
                </div>
              </div>
            </div>
          )}

          {/* ── Recommendations Tab ─── */}
          {activeTab === "recommendations" && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "1.25rem" }}>
              {r.recommendations.map((rec: any) => (
                <div key={rec.rank} style={{...card, padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.25rem", flexWrap: "wrap" as const }}>
                    <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
                      <div style={{
                        width: "44px", height: "44px", background: "#1a3a5c",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", fontWeight: 900, color: "#ffffff", flexShrink: 0,
                      }}>
                        {rec.rank}
                      </div>
                      <div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827" }}>{rec.title}</h4>
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "0.3rem", lineHeight: 1.6 }}>{rec.rationale}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.625rem", flexShrink: 0 }}>
                      <DifficultyBadge level={rec.difficulty} />
                      <span style={{
                        padding: "0.35rem 0.8rem", fontSize: "0.72rem", fontWeight: 800,
                        textTransform: "uppercase", letterSpacing: "0.08em",
                        color: "#6b7280", background: "#f3f4f6", border: "1px solid #e5e7eb",
                      }}>
                        ⏱ {rec.timeline}
                      </span>
                    </div>
                  </div>
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.625rem" }}>
                      Required Resources
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" as const }}>
                      {rec.resources.map((res: any) => (
                        <span key={res} style={{
                          padding: "0.4rem 0.85rem", background: "#f9fafb",
                          border: "1px solid #e5e7eb", fontSize: "0.8rem",
                          color: "#374151", fontWeight: 600,
                        }}>
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Insights Tab ─── */}
          {activeTab === "insights" && (
            <div style={{ display: "flex", flexDirection: "column" as const, gap: "1.25rem" }}>
              {/* Executive Summary */}
              <div style={{ ...card, borderLeft: "4px solid #1a3a5c" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <FileText size={16} color="#1a3a5c" /> Executive Assessment Summary
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.8 }}>{r.boardroomReport || r.insights.executive_summary}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Key Findings */}
                <div style={{ ...card, borderTop: "3px solid #10B981" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <CheckCircle2 size={16} color="#10B981" /> Key Findings
                  </h3>
                  <ul style={{ display: "flex", flexDirection: "column" as const, gap: "0.85rem" }}>
                    {r.insights.key_findings.map((f: any, i: number) => (
                      <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", flexShrink: 0, marginTop: "6px" }} />
                        <span style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div style={{ ...card, borderTop: "3px solid #ef4444" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <AlertTriangle size={16} color="#ef4444" /> Risk Profiles
                  </h3>
                  <ul style={{ display: "flex", flexDirection: "column" as const, gap: "0.85rem" }}>
                    {r.insights.risk_factors.map((f: any, i: number) => (
                      <li key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", flexShrink: 0, marginTop: "6px" }} />
                        <span style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Opportunities */}
              <div style={card}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111827", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  <Lightbulb size={16} color="#c8a96e" /> Strategic Capital Opportunities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {r.insights.opportunities.map((o: any, i: number) => (
                    <div key={i} style={{
                      padding: "1.5rem", background: "rgba(16,185,129,0.04)",
                      border: "1px solid rgba(16,185,129,0.12)",
                    }}>
                      <div style={{ width: "26px", height: "26px", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.85rem" }}>
                        <ArrowRight size={13} color="#10B981" />
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{o}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

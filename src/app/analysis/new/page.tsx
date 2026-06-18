"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Sidebar from "@frontend/components/Sidebar";
import TopBar from "@frontend/components/TopBar";
import {
  Building2, MapPin, Calendar, Activity, Zap, Users, Shield, Target, Server, Lightbulb,
  ArrowRight, ArrowLeft, Loader2, Check, DollarSign, BarChart3, Rocket
} from "lucide-react";

interface FormState {
  industry: string;
  country: string;
  year: number | string;
  ai_adoption_level: number | string;
  automation_rate: number | string;
  productivity_gain: number | string;
  employee_ai_training_hours: number | string;
  ai_maturity_score: number | string;
  ai_investment_usd: number | string;
  deployment_count: number | string;
}

export default function NewAnalysisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");

  const [form, setForm] = useState<FormState>({
    industry: "",
    country: "",
    year: 2029,
    ai_adoption_level: 0.4987,
    automation_rate: 0.4119,
    productivity_gain: 0.3924,
    employee_ai_training_hours: 76.8,
    ai_maturity_score: 6.37,
    ai_investment_usd: 11747237,
    deployment_count: 29,
  });

  const getReadinessCategory = (score: number) => {
    const s = score * 10; // scale 0-10 to 0-100 for category
    if (s < 30) return "Beginner";
    if (s < 60) return "Intermediate";
    if (s < 85) return "Advanced";
    return "Leader";
  };

  const handleSubmit = async () => {
    if (!form.industry || !form.country || !form.year) {
      toast.error("Please complete the Organization Information.");
      setStep(1);
      return;
    }
    if (Number(form.ai_investment_usd) <= 0 || Number(form.deployment_count) < 1) {
      toast.error("Please provide valid Initiative Configuration.");
      setStep(3);
      return;
    }

    setLoading(true);
    const messages = [
      "Validating organizational dataset inputs...",
      "Mapping capability assessment to XGBoost tensors...",
      "Calling HuggingFace ROI Prediction Model...",
      "Extracting SHAP feature importances...",
      "Persisting analysis to Neon Postgres...",
    ];

    try {
      setLoadingMsg(messages[0]);
      await new Promise(r => setTimeout(r, 600));

      setLoadingMsg(messages[1]);
      const payload = {
        year: Number(form.year),
        ai_adoption_level: Number(form.ai_adoption_level),
        ai_investment_usd: Number(form.ai_investment_usd),
        automation_rate: Number(form.automation_rate),
        productivity_gain: Number(form.productivity_gain),
        employee_ai_training_hours: Number(form.employee_ai_training_hours),
        ai_maturity_score: Number(form.ai_maturity_score),
        deployment_count: Number(form.deployment_count),
        industry: form.industry,
        country: form.country
      };

      setLoadingMsg(messages[2]);
      const predictRes = await fetch(`/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!predictRes.ok) throw new Error(`Prediction API failed with status ${predictRes.status}`);

      setLoadingMsg(messages[3]);
      interface ShapFeature { feature: string; importance: number; }
      const rawPredictions: { 
        predicted_financial_benefit_usd: number; 
        roi_percentage: number; 
        boardroom_report: string;
        shap_features: ShapFeature[];
      } = await predictRes.json();

      setLoadingMsg(messages[4]);
      const saveRes = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: `${form.industry} Enterprise`, 
          industry: form.industry,
          companySize: "Enterprise", 
          revenue: "0", 
          businessGoals: "AI Strategy Projection", 
          datasetUrl: "",
          readinessScore: Number(form.ai_maturity_score) * 10,
          roiForecast: rawPredictions.roi_percentage,
          costReduction: rawPredictions.roi_percentage > 50 ? 25 : 10,
          maturityLevel: getReadinessCategory(Number(form.ai_maturity_score)),
          predictedBenefit: rawPredictions.predicted_financial_benefit_usd,
          boardroomReport: rawPredictions.boardroom_report,
          shapFeatures: rawPredictions.shap_features
        })
      });

      if (saveRes.ok) {
        const savedAnalysis = await saveRes.json();
        router.push(`/analysis/${savedAnalysis.id}`);
      } else {
        const errData = await saveRes.json();
        throw new Error(errData.error || "Failed to save analysis");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process prediction.");
      setLoading(false);
    }
  };

  const renderStepProgress = () => {
    const steps = ["Organization Info", "Capability Assessment", "Initiative Config"];
    return (
      <div className="flex items-center justify-between mb-10 w-full relative before:absolute before:top-1/2 before:left-0 before:h-0.5 before:w-full before:bg-gray-200 before:-z-10">
        {steps.map((title, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={title} className="flex flex-col items-center gap-2 bg-white px-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                isDone ? "bg-[#1a3a5c] text-white border-[#1a3a5c]" :
                isActive ? "bg-[#c8a96e] text-white border-[#c8a96e] shadow-md scale-110" :
                "bg-gray-50 text-gray-400 border-gray-200"
              }`}>
                {isDone ? <Check size={18} /> : num}
              </div>
              <span className={`text-[0.65rem] md:text-xs font-bold uppercase tracking-widest ${isActive ? "text-[#1a3a5c]" : "text-gray-400"}`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSidebar = () => (
    <div className="hidden lg:flex w-80 shrink-0 sticky top-6 h-fit flex-col gap-5">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 p-6 shadow-xl shadow-gray-200/40 rounded-2xl">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Activity size={14} className="text-[#1a3a5c]" /> Live Projections
        </h3>

        <div className="flex flex-col gap-5">
          {/* Readiness Score */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">AI Maturity Score</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-black text-[#1a3a5c] leading-none">{Number(form.ai_maturity_score).toFixed(2)}</span>
              <span className="text-xs font-bold text-gray-400 leading-none pb-0.5">/ 10</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Readiness Category</span>
            <span className="text-xs font-bold px-2 py-1 rounded bg-[#1a3a5c]/10 text-[#1a3a5c] border border-[#1a3a5c]/20 uppercase tracking-wider">
              {getReadinessCategory(Number(form.ai_maturity_score))}
            </span>
          </div>

          {/* Adoption Level */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Adoption Level</span>
            <span className="text-sm font-bold text-gray-800 text-right max-w-[120px] truncate">
              {Number(form.ai_adoption_level).toFixed(4)}
            </span>
          </div>

          {/* Investment Budget */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Investment Budget</span>
            <span className="text-base font-black text-[#10B981]">
              ${Number(form.ai_investment_usd).toLocaleString()}
            </span>
          </div>

          {/* Deployments */}
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-500">Deployments</span>
            <span className="text-base font-black text-gray-800">{form.deployment_count}</span>
          </div>

          {/* Prediction Confidence */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-semibold text-gray-500">ML Confidence</span>
            <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wider border border-green-200 flex items-center gap-1">
              <Shield size={12} /> High
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        <TopBar title="AI Strategy Configuration" subtitle="Define organizational parameters exactly matching the XGBoost dataset" />

        <div className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start justify-center">
          
          {/* Main Content Container (Centered) */}
          <div className="flex-1 w-full max-w-[800px] mx-auto">
            {renderStepProgress()}

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white border border-gray-200/80 p-12 text-center rounded-2xl shadow-sm">
                  <div className="w-16 h-16 bg-[#1a3a5c] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1a3a5c]/20">
                    <Loader2 size={32} color="white" className="animate-spin" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Computing Strategic Projections</h3>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">{loadingMsg}</p>
                </motion.div>
              ) : (
                <motion.div key={`step-${step}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white border border-gray-200/80 p-6 md:p-10 rounded-2xl shadow-sm">
                  
                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="flex flex-col gap-8">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Organization Information</h2>
                        <p className="text-sm text-gray-500 mt-1">Configure foundational dataset attributes.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Industry *</label>
                          <div className="relative">
                            <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block pl-11 p-3.5 transition-colors outline-none" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                              <option value="">Select industry...</option>
                              {["Education", "Energy", "Financial Services", "Healthcare", "Logistics", "Manufacturing", "Retail", "Technology", "Telecom", "Agriculture"].map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Country *</label>
                          <div className="relative">
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block pl-11 p-3.5 transition-colors outline-none" value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                              <option value="">Select country...</option>
                              {["Brazil", "Canada", "China", "France", "Germany", "India", "Japan", "Netherlands", "Singapore", "South Korea", "Sweden", "UAE", "United Kingdom", "United States"].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Analysis Year *</label>
                          <div className="relative">
                            <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block pl-11 p-3.5 transition-colors outline-none" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="flex flex-col gap-8">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">AI Capability Assessment</h2>
                        <p className="text-sm text-gray-500 mt-1">Input exact float values corresponding to the ML dataset schema.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Adoption Level */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">AI Adoption Level (0 - 1)</label>
                          <input type="number" step="0.0001" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block p-3.5 outline-none" value={form.ai_adoption_level} onChange={e => setForm({...form, ai_adoption_level: e.target.value})} />
                        </div>

                        {/* Automation Rate */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Automation Rate (0 - 1)</label>
                          <input type="number" step="0.0001" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block p-3.5 outline-none" value={form.automation_rate} onChange={e => setForm({...form, automation_rate: e.target.value})} />
                        </div>

                        {/* Productivity Gain */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Productivity Gain (-1 to 1)</label>
                          <input type="number" step="0.0001" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block p-3.5 outline-none" value={form.productivity_gain} onChange={e => setForm({...form, productivity_gain: e.target.value})} />
                        </div>

                        {/* AI Maturity Score */}
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">AI Maturity Score (0 - 10)</label>
                          <input type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#c8a96e] focus:border-[#c8a96e] block p-3.5 outline-none" value={form.ai_maturity_score} onChange={e => setForm({...form, ai_maturity_score: e.target.value})} />
                        </div>

                        {/* Employee AI Training Hours */}
                        <div className="flex flex-col gap-2 md:col-span-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Employee AI Training Hours</label>
                          <div className="relative">
                            <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="number" step="0.1" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block pl-11 p-3.5 outline-none" value={form.employee_ai_training_hours} onChange={e => setForm({...form, employee_ai_training_hours: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="flex flex-col gap-8">
                      <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Initiative Configuration</h2>
                        <p className="text-sm text-gray-500 mt-1">Finalize the investment parameters for ROI prediction mapping.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">AI Investment Budget (USD) *</label>
                          <div className="relative">
                            <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg font-black rounded-xl focus:ring-[#10B981] focus:border-[#10B981] block pl-11 p-4 transition-colors outline-none" value={form.ai_investment_usd} onChange={e => setForm({...form, ai_investment_usd: e.target.value})} />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Planned AI Deployments *</label>
                          <div className="relative">
                            <Rocket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="number" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-lg font-black rounded-xl focus:ring-[#1a3a5c] focus:border-[#1a3a5c] block pl-11 p-4 transition-colors outline-none" value={form.deployment_count} onChange={e => setForm({...form, deployment_count: e.target.value})} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t border-gray-100">
                    {step > 1 ? (
                      <button onClick={() => setStep(step - 1)} className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 font-bold text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs tracking-widest uppercase">Back</span>
                      </button>
                    ) : <div className="hidden sm:block" />}

                    {step < 3 ? (
                      <button onClick={() => setStep(step + 1)} className="group relative flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden rounded-xl bg-gradient-to-r from-[#1a3a5c] to-[#2d5a8a] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#1a3a5c]/20 hover:shadow-[#1a3a5c]/40 transition-all hover:-translate-y-0.5">
                        <span className="relative z-10 text-xs tracking-widest uppercase">Next Step</span>
                        <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                      </button>
                    ) : (
                      <button onClick={handleSubmit} className="group relative flex items-center justify-center gap-2 w-full sm:w-auto overflow-hidden rounded-xl bg-gradient-to-r from-[#c8a96e] to-[#b8944f] px-8 py-3.5 font-bold text-white shadow-lg shadow-[#c8a96e]/30 hover:shadow-[#c8a96e]/50 transition-all hover:-translate-y-0.5">
                        <span className="relative z-10 text-xs tracking-widest uppercase flex items-center gap-2"><BarChart3 size={16} /> Compute Strategy Projections</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right Sidebar */}
          {!loading && renderSidebar()}
        </div>
      </main>
    </div>
  );
}

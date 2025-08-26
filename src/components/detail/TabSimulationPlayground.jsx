import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { InvokeLLM } from "@/api/integrations";
import { Brain, Sparkles, Loader } from "lucide-react";

export default function TabSimulationPlayground({ application, onUpdate }) {
  const [simulatedData, setSimulatedData] = useState({
    fico_score: application.fico_score || 650,
    annual_income: application.annual_income || 50000,
    dti: application.dti || 30,
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSliderChange = (field, value) => {
    setSimulatedData(prev => ({ ...prev, [field]: value[0] }));
  };

  const runSimulation = async () => {
    setIsLoading(true);
    setSimulationResult(null);
    try {
      const prompt = `
        A loan applicant has the following original and simulated financial profiles. 
        Original FICO: ${application.fico_score}, Annual Income: $${application.annual_income}, DTI: ${application.dti}%.
        Simulated FICO: ${simulatedData.fico_score}, Annual Income: $${simulatedData.annual_income}, DTI: ${simulatedData.dti}%.

        1. Generate a new AI risk score (0-1000) for the simulated profile.
        2. Generate a new AI recommendation (approve/review/reject).
        3. Provide a brief, comparative analysis explaining how the changes affected the risk profile and recommendation. Focus on the 'why'.
      `;

      const result = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            simulated_score: { type: "number" },
            simulated_recommendation: { type: "string" },
            analysis: { type: "string" }
          }
        }
      });
      setSimulationResult(result);
    } catch (error) {
      console.error("Error running simulation:", error);
      setSimulationResult({ analysis: "Failed to run simulation." });
    }
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Simulation Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="fico_score" className="flex justify-between">
              <span>FICO Score</span>
              <span className="font-bold text-[#1a365d]">{simulatedData.fico_score}</span>
            </Label>
            <Slider
              id="fico_score"
              min={300}
              max={850}
              step={10}
              value={[simulatedData.fico_score]}
              onValueChange={(val) => handleSliderChange('fico_score', val)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="annual_income" className="flex justify-between">
              <span>Annual Income</span>
              <span className="font-bold text-[#1a365d]">${simulatedData.annual_income.toLocaleString()}</span>
            </Label>
            <Slider
              id="annual_income"
              min={10000}
              max={500000}
              step={1000}
              value={[simulatedData.annual_income]}
              onValueChange={(val) => handleSliderChange('annual_income', val)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="dti" className="flex justify-between">
              <span>Debt-to-Income Ratio (%)</span>
              <span className="font-bold text-[#1a365d]">{simulatedData.dti}%</span>
            </Label>
            <Slider
              id="dti"
              min={0}
              max={100}
              step={1}
              value={[simulatedData.dti]}
              onValueChange={(val) => handleSliderChange('dti', val)}
            />
          </div>
          <Button onClick={runSimulation} disabled={isLoading} className="w-full">
            {isLoading ? (
                <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Running Simulation...
                </>
            ) : (
                <>
                    <Brain className="w-4 h-4 mr-2" />
                    Run AI Simulation
                </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
        </CardHeader>
        <CardContent>
          {simulationResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">Original Score</p>
                  <p className="text-2xl font-bold">{application.ai_score}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Simulated Score</p>
                  <p className="text-2xl font-bold text-blue-600">{simulationResult.simulated_score}</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Simulated Recommendation</p>
                <p className="text-lg font-bold capitalize">{simulationResult.simulated_recommendation}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-blue-500" /> AI Analysis</h4>
                <p className="text-sm text-slate-700">{simulationResult.analysis}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-4" />
              <p>Adjust parameters and run the simulation to see AI-powered results.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
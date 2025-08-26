import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sliders, RefreshCw, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

export default function SimulationPlayground({ application }) {
  const [simulatedData, setSimulatedData] = useState({});
  const [simulationResult, setSimulationResult] = useState(null);

  useEffect(() => {
    if (application) {
      resetSimulation();
    }
  }, [application]);

  const resetSimulation = () => {
    setSimulatedData({
      AmountRequested: application.AmountRequested,
      years_in_business: application.years_in_business,
      SUGEF: application.SUGEF,
      CreateJob: application.CreateJob,
      NoEmp: application.NoEmp,
      NewBusiness: application.NewBusiness,
    });
    setSimulationResult(null);
  };

  const handleInputChange = (field, value) => {
    setSimulatedData(prev => ({ ...prev, [field]: value }));
  };

  const calculateScore = (data) => {
    let score = 70; // Base score
    if (data.SUGEF === 'A1') score += 15;
    else if (data.SUGEF === 'A2') score += 10;
    else if (data.SUGEF === 'B1') score += 5;
    else if (data.SUGEF === 'B2') score += 0;
    else if (data.SUGEF === 'C1') score -= 10;
    else if (data.SUGEF === 'C2') score -= 15;
    else if (data.SUGEF === 'D') score -= 25;
    
    const yearsInBusiness = parseFloat(data.years_in_business) || 0;
    if (yearsInBusiness >= 5) score += 10;
    else if (yearsInBusiness >= 2) score += 5;
    else if (yearsInBusiness < 1) score -= 10;
    
    if (data.NewBusiness === 1) score -= 5;
    
    const amountPerEmp = (parseFloat(data.AmountRequested) || 0) / (parseInt(data.NoEmp) || 1);
    if (amountPerEmp > 100000) score -= 10;
    else if (amountPerEmp > 50000) score -= 5;
    
    const jobsCreated = parseInt(data.CreateJob) || 0;
    if (jobsCreated >= 10) score += 5;
    else if (jobsCreated >= 5) score += 3;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const runSimulation = () => {
    const newScore = calculateScore(simulatedData);
    const originalScore = application.ML_Score;
    setSimulationResult({
      newScore: newScore,
      scoreChange: newScore - originalScore
    });
  };

  if (!application) return null;

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-[#1a365d]">
          <Sliders className="w-6 h-6" />
          "What-If" Simulation Playground
        </CardTitle>
        <CardDescription>Adjust key metrics to see the potential impact on the AI Risk Score.</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sim-amount">Loan Amount</Label>
                <Input id="sim-amount" type="number" value={simulatedData.AmountRequested || ''} onChange={(e) => handleInputChange('AmountRequested', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sim-years">Years in Business</Label>
                <Input id="sim-years" type="number" value={simulatedData.years_in_business || ''} onChange={(e) => handleInputChange('years_in_business', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sim-sugef">SUGEF Rating</Label>
              <Select value={simulatedData.SUGEF || ''} onValueChange={(value) => handleInputChange('SUGEF', value)}>
                <SelectTrigger id="sim-sugef"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 - Excellent</SelectItem>
                  <SelectItem value="A2">A2 - Very Good</SelectItem>
                  <SelectItem value="B1">B1 - Good</SelectItem>
                  <SelectItem value="B2">B2 - Satisfactory</SelectItem>
                  <SelectItem value="C1">C1 - Fair</SelectItem>
                  <SelectItem value="C2">C2 - Poor</SelectItem>
                  <SelectItem value="D">D - High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sim-jobs">Jobs Created</Label>
                <Input id="sim-jobs" type="number" value={simulatedData.CreateJob || ''} onChange={(e) => handleInputChange('CreateJob', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sim-emp">Total Employees</Label>
                <Input id="sim-emp" type="number" value={simulatedData.NoEmp || ''} onChange={(e) => handleInputChange('NoEmp', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={runSimulation} className="w-full bg-[#1a365d] hover:bg-[#2c5282]">Run Simulation</Button>
              <Button onClick={resetSimulation} variant="outline"><RefreshCw className="w-4 h-4" /></Button>
            </div>
          </div>
          {/* Results */}
          <div className="flex items-center justify-center bg-slate-50 rounded-lg p-6">
            <div className="text-center w-full">
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="text-center">
                  <p className="text-sm text-slate-500">Original Score</p>
                  <p className="text-3xl font-bold text-slate-500">{application.ML_Score}</p>
                </div>
                <div className="text-center">
                  {simulationResult ? (
                    <div className={`flex flex-col items-center justify-center ${getChangeColor(simulationResult.scoreChange)}`}>
                        {simulationResult.scoreChange > 0 && <ArrowUp className="w-8 h-8"/>}
                        {simulationResult.scoreChange < 0 && <ArrowDown className="w-8 h-8"/>}
                        {simulationResult.scoreChange === 0 && <ArrowRight className="w-8 h-8"/>}
                      <p className="text-xl font-bold">
                        {simulationResult.scoreChange > 0 ? '+' : ''}
                        {simulationResult.scoreChange}
                      </p>
                    </div>
                  ) : (
                    <ArrowRight className="w-8 h-8 text-slate-400 mx-auto" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500">Simulated Score</p>
                  <p className={`text-3xl font-bold ${simulationResult ? getChangeColor(simulationResult.scoreChange) : 'text-slate-400'}`}>
                    {simulationResult ? simulationResult.newScore : '?'}
                  </p>
                </div>
              </div>
              {simulationResult && (
                <div className="mt-4 bg-white p-3 rounded text-sm text-slate-700 border border-slate-200">
                  <p>By making these adjustments, the applicant's risk score could potentially change by <strong className={getChangeColor(simulationResult.scoreChange)}>{simulationResult.scoreChange > 0 ? '+' : ''}{simulationResult.scoreChange} points</strong>.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
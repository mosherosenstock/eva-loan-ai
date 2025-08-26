// Vercel serverless function for MLflow predictions
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { model_name, model_version, features, use_real_mlflow = false } = req.body

    if (!model_name || !features) {
      return res.status(400).json({ 
        error: 'Missing required fields: model_name and features' 
      })
    }

    let prediction

    // Feature flag to switch between real MLflow and stub
    if (use_real_mlflow && process.env.DATABRICKS_TOKEN) {
      // Real MLflow/Databricks integration
      prediction = await callRealMLflow(model_name, model_version, features)
    } else {
      // Stub implementation for Phase 0.5
      prediction = await simulateMLflowPrediction(features)
    }
    
    res.status(200).json({
      success: true,
      score: prediction.score,
      risk_level: prediction.risk_level,
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      run_id: prediction.run_id || `mlflow_run_${Date.now()}`,
      factors: prediction.factors,
      model_version: model_version || 'latest',
      timestamp: new Date().toISOString(),
      source: use_real_mlflow ? 'mlflow' : 'stub'
    })

  } catch (error) {
    console.error('MLflow prediction error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

/**
 * Call real MLflow/Databricks API
 */
async function callRealMLflow(modelName, modelVersion, features) {
  // TODO: Implement real MLflow/Databricks integration
  // This would use the DATABRICKS_TOKEN environment variable
  throw new Error('Real MLflow integration not yet implemented')
}

/**
 * Simulate MLflow prediction for development/testing
 * In production, this would be replaced with actual MLflow API calls
 */
async function simulateMLflowPrediction(features) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Simple rule-based scoring (replace with actual ML model)
  let score = 70 // Base score
  
  // SUGEF rating impact
  const sugefScores = {
    'A1': 20, 'A2': 15, 'B1': 10, 'B2': 5,
    'C1': -10, 'C2': -15, 'D': -25
  }
  score += sugefScores[features.sugef_rating] || 0
  
  // Amount requested impact
  const amount = parseFloat(features.amount_requested) || 0
  if (amount > 1000000) score -= 10
  else if (amount > 500000) score -= 5
  else if (amount < 100000) score += 5
  
  // Years in business impact
  const years = parseInt(features.years_in_business) || 0
  if (years >= 5) score += 10
  else if (years >= 2) score += 5
  else if (years < 1) score -= 10
  
  // New business penalty
  if (features.new_business) score -= 5
  
  // Amount per employee ratio
  const amountPerEmp = features.amount_per_employee || 0
  if (amountPerEmp > 100000) score -= 10
  else if (amountPerEmp > 50000) score -= 5
  
  // Job creation bonus
  const jobsCreated = parseInt(features.jobs_to_create) || 0
  if (jobsCreated >= 10) score += 5
  else if (jobsCreated >= 5) score += 3
  
  // Industry risk factors
  const highRiskIndustries = ['Construction', 'Real Estate', 'Hospitality']
  if (highRiskIndustries.includes(features.industry)) score -= 5
  
  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score))
  
  // Determine risk level and recommendation
  let riskLevel, recommendation
  if (score >= 80) {
    riskLevel = 'Low'
    recommendation = 'APPROVE'
  } else if (score >= 60) {
    riskLevel = 'Medium'
    recommendation = 'REVIEW'
  } else {
    riskLevel = 'High'
    recommendation = 'DENY'
  }
  
  // Generate confidence score
  const confidence = 0.7 + (Math.random() * 0.2) // 0.7-0.9 range
  
  // Generate risk factors
  const factors = []
  if (features.sugef_rating && ['C1', 'C2', 'D'].includes(features.sugef_rating)) {
    factors.push(`High SUGEF risk rating: ${features.sugef_rating}`)
  }
  if (features.new_business) {
    factors.push('New business with limited track record')
  }
  if (parseInt(features.years_in_business) < 2) {
    factors.push('Limited business history')
  }
  if (features.amount_per_employee > 100000) {
    factors.push('High amount per employee ratio')
  }
  if (highRiskIndustries.includes(features.industry)) {
    factors.push(`High-risk industry: ${features.industry}`)
  }
  
  if (factors.length === 0) {
    factors.push('Standard risk assessment completed')
  }

  return {
    score: Math.round(score),
    risk_level: riskLevel,
    recommendation: recommendation,
    confidence: Math.round(confidence * 100) / 100,
    factors: factors
  }
}

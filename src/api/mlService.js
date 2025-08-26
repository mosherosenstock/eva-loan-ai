import { db } from '@/lib/supabase'
import { InvokeRiskAssessment } from './aiGateway'

/**
 * ML Service for risk assessment and model predictions
 * This service integrates with MLflow/Databricks for production ML models
 * and provides fallback to AI-based risk assessment
 */

export const MLService = {
  /**
   * Calculate risk score for a business application
   * @param {string} applicationId - The application ID
   * @param {boolean} useMLModel - Whether to use MLflow model (default: true)
   * @returns {Promise<Object>} Risk assessment results
   */
  calculateRiskScore: async (applicationId, useMLModel = true) => {
    try {
      // Get application data
      const application = await db.applications.get(applicationId)
      if (!application) {
        throw new Error('Application not found')
      }

      let prediction
      let mlflowRunId = null

      if (useMLModel && import.meta.env.MLFLOW_TRACKING_URI) {
        // Try MLflow model first
        try {
          prediction = await MLService._invokeMLflowModel(application)
          mlflowRunId = prediction.runId
        } catch (mlflowError) {
          console.warn('MLflow model failed, falling back to AI assessment:', mlflowError)
          prediction = await MLService._invokeAIAssessment(application)
        }
      } else {
        // Use AI-based assessment
        prediction = await MLService._invokeAIAssessment(application)
      }

      // Update application with ML results
      const updatedApp = await db.applications.update(applicationId, {
        ml_score: prediction.risk_score,
        ml_recommendation: prediction.recommendation,
        risk_level: prediction.risk_level
      })

      // Store ML run details
      await db.mlRuns.create({
        application_id: applicationId,
        model_version: prediction.model_version || 'ai-fallback',
        input_features: MLService._prepareFeatures(application),
        prediction_score: prediction.risk_score,
        prediction_recommendation: prediction.recommendation,
        confidence_score: prediction.confidence,
        mlflow_run_id: mlflowRunId
      })

      return {
        ...updatedApp,
        prediction_details: prediction
      }
    } catch (error) {
      console.error('Error calculating risk score:', error)
      throw new Error(`Failed to calculate risk score: ${error.message}`)
    }
  },

  /**
   * Batch process multiple applications
   * @param {Array<string>} applicationIds - Array of application IDs
   * @param {boolean} useMLModel - Whether to use MLflow model
   * @returns {Promise<Array>} Results for each application
   */
  batchProcessApplications: async (applicationIds, useMLModel = true) => {
    const results = []
    
    for (const appId of applicationIds) {
      try {
        const result = await MLService.calculateRiskScore(appId, useMLModel)
        results.push({ 
          appId, 
          success: true, 
          result,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        results.push({ 
          appId, 
          success: false, 
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    return results
  },

  /**
   * Get ML model performance metrics
   * @returns {Promise<Object>} Performance metrics
   */
  getModelPerformance: async () => {
    try {
      const runs = await db.mlRuns.list(1000)
      
      const metrics = {
        total_predictions: runs.length,
        average_confidence: 0,
        model_usage: {},
        recent_accuracy: 0
      }

      if (runs.length > 0) {
        // Calculate average confidence
        const totalConfidence = runs.reduce((sum, run) => sum + (run.confidence_score || 0), 0)
        metrics.average_confidence = totalConfidence / runs.length

        // Model usage distribution
        const modelCounts = runs.reduce((acc, run) => {
          const model = run.model_version || 'unknown'
          acc[model] = (acc[model] || 0) + 1
          return acc
        }, {})
        metrics.model_usage = modelCounts

        // Recent accuracy (last 100 predictions)
        const recentRuns = runs.slice(0, 100)
        const highConfidenceRuns = recentRuns.filter(run => (run.confidence_score || 0) > 0.8)
        metrics.recent_accuracy = recentRuns.length > 0 ? (highConfidenceRuns.length / recentRuns.length) * 100 : 0
      }

      return metrics
    } catch (error) {
      console.error('Error getting model performance:', error)
      throw new Error(`Failed to get model performance: ${error.message}`)
    }
  },

  /**
   * Retrain model with new data
   * @param {Array} trainingData - Training data for model retraining
   * @returns {Promise<Object>} Retraining results
   */
  retrainModel: async (trainingData) => {
    try {
      // This would integrate with MLflow/Databricks for model retraining
      // For now, we'll simulate the process
      
      const retrainingJob = {
        id: `retrain_${Date.now()}`,
        status: 'completed',
        model_version: `v${Date.now()}`,
        training_samples: trainingData.length,
        accuracy: 0.85,
        timestamp: new Date().toISOString()
      }

      // In production, this would:
      // 1. Send training data to MLflow
      // 2. Trigger model retraining pipeline
      // 3. Update model registry
      // 4. Deploy new model version

      return retrainingJob
    } catch (error) {
      console.error('Error retraining model:', error)
      throw new Error(`Failed to retrain model: ${error.message}`)
    }
  },

  /**
   * Private method to invoke MLflow model
   */
  _invokeMLflowModel: async (application) => {
    // This would integrate with actual MLflow/Databricks
    // For now, we'll simulate the MLflow integration
    
    const features = MLService._prepareFeatures(application)
    
    // Simulate MLflow API call
    const response = await fetch('/api/mlflow-predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: 'eva-loan-risk-model',
        model_version: 'latest',
        features: features
      })
    })

    if (!response.ok) {
      throw new Error('MLflow prediction failed')
    }

    const prediction = await response.json()
    
    return {
      risk_score: prediction.score,
      risk_level: prediction.risk_level,
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      model_version: 'mlflow-latest',
      runId: prediction.run_id,
      factors: prediction.factors || []
    }
  },

  /**
   * Private method to invoke AI-based assessment
   */
  _invokeAIAssessment: async (application) => {
    const prediction = await InvokeRiskAssessment(application)
    
    return {
      risk_score: prediction.risk_score,
      risk_level: prediction.risk_level,
      recommendation: prediction.recommendation,
      confidence: prediction.confidence,
      model_version: 'ai-fallback',
      factors: prediction.key_factors,
      reasoning: prediction.reasoning
    }
  },

  /**
   * Private method to prepare features for ML model
   */
  _prepareFeatures: (application) => {
    return {
      sugef_rating: application.sugef_rating,
      amount_requested: parseFloat(application.amount_requested) || 0,
      years_in_business: parseInt(application.years_in_business) || 0,
      number_of_employees: parseInt(application.number_of_employees) || 0,
      new_business: application.new_business ? 1 : 0,
      jobs_to_create: parseInt(application.jobs_to_create) || 0,
      industry: application.industry,
      location: application.location,
      // Add derived features
      amount_per_employee: application.number_of_employees > 0 
        ? (parseFloat(application.amount_requested) || 0) / parseInt(application.number_of_employees)
        : 0,
      years_per_employee: application.number_of_employees > 0
        ? (parseInt(application.years_in_business) || 0) / parseInt(application.number_of_employees)
        : 0
    }
  },

  /**
   * Get risk distribution across portfolio
   */
  getRiskDistribution: async () => {
    try {
      const applications = await db.applications.list('created_date', 1000)
      
      const distribution = {
        low_risk: 0,
        medium_risk: 0,
        high_risk: 0,
        total: applications.length,
        average_score: 0
      }

      if (applications.length > 0) {
        let totalScore = 0
        
        applications.forEach(app => {
          if (app.risk_level === 'Low') distribution.low_risk++
          else if (app.risk_level === 'Medium') distribution.medium_risk++
          else if (app.risk_level === 'High') distribution.high_risk++
          
          totalScore += app.ml_score || 0
        })
        
        distribution.average_score = totalScore / applications.length
      }

      return distribution
    } catch (error) {
      console.error('Error getting risk distribution:', error)
      throw new Error(`Failed to get risk distribution: ${error.message}`)
    }
  }
}

export default MLService

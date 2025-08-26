// Client-side AI Gateway using /api/ai proxy

// Default configuration
const DEFAULT_MODEL = 'gpt-4'
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 2000

/**
 * Invoke LLM with basic prompt
 */
export const InvokeLLM = async ({ 
  prompt, 
  model = DEFAULT_MODEL, 
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS 
}) => {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        temperature,
        maxTokens
      })
    })

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.content
  } catch (error) {
    console.error('AI Gateway error:', error)
    throw new Error(`Failed to get AI response: ${error.message}`)
  }
}

/**
 * Invoke LLM with RAG (Retrieval-Augmented Generation) context
 */
export const InvokeLLMWithRAG = async ({ 
  prompt, 
  context, 
  model = DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE 
}) => {
  const enhancedPrompt = `
    Context Information:
    ${JSON.stringify(context, null, 2)}
    
    User Question: ${prompt}
    
    Please provide a comprehensive answer based on the context provided above. 
    If the context doesn't contain enough information to answer the question, 
    please state that clearly and suggest what additional information might be needed.
  `
  
  return await InvokeLLM({ 
    prompt: enhancedPrompt, 
    model, 
    temperature 
  })
}

/**
 * Invoke LLM with structured output (JSON response)
 */
export const InvokeLLMWithJSON = async ({ 
  prompt, 
  schema, 
  model = DEFAULT_MODEL,
  temperature = 0.1 // Lower temperature for more consistent structured output
}) => {
  try {
    const response = await ai.chat({
      messages: [
        { 
          role: 'system', 
          content: `You are a helpful assistant that responds with valid JSON according to the provided schema. Always respond with valid JSON only.` 
        },
        { 
          role: 'user', 
          content: `${prompt}\n\nPlease respond with valid JSON that matches this schema:\n${JSON.stringify(schema, null, 2)}` 
        }
      ],
      model,
      temperature,
      response_format: { type: "json_object" }
    })
    
    try {
      return JSON.parse(response.content)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      throw new Error('Invalid JSON response from AI')
    }
  } catch (error) {
    console.error('AI Gateway JSON error:', error)
    throw new Error(`Failed to get structured AI response: ${error.message}`)
  }
}

/**
 * Invoke LLM for risk assessment with structured output
 */
export const InvokeRiskAssessment = async (applicationData) => {
  const prompt = `
    Analyze the following loan application data and provide a risk assessment:
    
    Company: ${applicationData.company_name}
    Industry: ${applicationData.industry}
    SUGEF Rating: ${applicationData.sugef_rating}
    Amount Requested: $${applicationData.amount_requested}
    Years in Business: ${applicationData.years_in_business}
    Number of Employees: ${applicationData.number_of_employees}
    New Business: ${applicationData.new_business ? 'Yes' : 'No'}
    Jobs to Create: ${applicationData.jobs_to_create}
    
    Provide a comprehensive risk assessment including:
    1. Risk score (0-100)
    2. Risk level (Low/Medium/High)
    3. Recommendation (APPROVE/REVIEW/DENY)
    4. Key risk factors
    5. Confidence level (0-1)
  `
  
  const schema = {
    type: "object",
    properties: {
      risk_score: { type: "number", minimum: 0, maximum: 100 },
      risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
      recommendation: { type: "string", enum: ["APPROVE", "REVIEW", "DENY"] },
      key_factors: { type: "array", items: { type: "string" } },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reasoning: { type: "string" }
    },
    required: ["risk_score", "risk_level", "recommendation", "key_factors", "confidence", "reasoning"]
  }
  
  return await InvokeLLMWithJSON({ prompt, schema })
}

/**
 * Invoke LLM for portfolio analysis
 */
export const InvokePortfolioAnalysis = async (applications) => {
  const prompt = `
    Analyze the following loan portfolio and provide insights:
    
    Total Applications: ${applications.length}
    Applications Data: ${JSON.stringify(applications.slice(0, 10), null, 2)}
    
    Please provide:
    1. Portfolio overview
    2. Risk distribution analysis
    3. Industry concentration
    4. Recommendations for portfolio management
  `
  
  return await InvokeLLM({ prompt })
}

/**
 * Invoke LLM for document analysis
 */
export const InvokeDocumentAnalysis = async (documentContent, documentType) => {
  const prompt = `
    Analyze the following ${documentType} document and extract key information:
    
    Document Content:
    ${documentContent}
    
    Please extract and structure the following information:
    1. Company details
    2. Financial metrics
    3. Risk indicators
    4. Compliance requirements
    5. Recommendations
  `
  
  const schema = {
    type: "object",
    properties: {
      company_details: {
        type: "object",
        properties: {
          name: { type: "string" },
          industry: { type: "string" },
          location: { type: "string" }
        }
      },
      financial_metrics: {
        type: "object",
        properties: {
          revenue: { type: "number" },
          employees: { type: "number" },
          years_in_business: { type: "number" }
        }
      },
      risk_indicators: { type: "array", items: { type: "string" } },
      compliance_requirements: { type: "array", items: { type: "string" } },
      recommendations: { type: "array", items: { type: "string" } }
    }
  }
  
  return await InvokeLLMWithJSON({ prompt, schema })
}

/**
 * Invoke LLM for email generation
 */
export const InvokeEmailGeneration = async ({ 
  recipient, 
  subject, 
  context, 
  tone = 'professional' 
}) => {
  const prompt = `
    Generate a ${tone} email with the following details:
    
    Recipient: ${recipient}
    Subject: ${subject}
    Context: ${context}
    
    Please write a clear, professional email that addresses the context provided.
  `
  
  return await InvokeLLM({ prompt, temperature: 0.8 })
}

/**
 * Invoke LLM for report generation
 */
export const InvokeReportGeneration = async ({ 
  reportType, 
  data, 
  timeframe 
}) => {
  const prompt = `
    Generate a ${reportType} report for the ${timeframe} period.
    
    Data: ${JSON.stringify(data, null, 2)}
    
    Please include:
    1. Executive summary
    2. Key metrics and trends
    3. Risk analysis
    4. Recommendations
    5. Next steps
  `
  
  return await InvokeLLM({ prompt, maxTokens: 3000 })
}

// Export for backward compatibility with existing code
export default {
  InvokeLLM,
  InvokeLLMWithRAG,
  InvokeLLMWithJSON,
  InvokeRiskAssessment,
  InvokePortfolioAnalysis,
  InvokeDocumentAnalysis,
  InvokeEmailGeneration,
  InvokeReportGeneration
}

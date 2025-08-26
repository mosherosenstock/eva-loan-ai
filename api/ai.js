// AI proxy endpoint using server-side Vercel AI Gateway token
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
    const { messages, model = 'gpt-4', temperature = 0.7, maxTokens = 2000 } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Missing required field: messages (array)' 
      })
    }

    // Use server-side token for Vercel AI Gateway
    const aiGatewayToken = process.env.VERCEL_AI_GATEWAY_TOKEN
    if (!aiGatewayToken) {
      return res.status(500).json({ 
        error: 'AI Gateway token not configured' 
      })
    }

    // Call Vercel AI Gateway
    const response = await fetch('https://api.vercel.com/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiGatewayToken}`
      },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens: maxTokens
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI Gateway error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: 'AI Gateway request failed',
        details: errorText
      })
    }

    const data = await response.json()
    
    res.status(200).json({
      success: true,
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    })

  } catch (error) {
    console.error('AI proxy error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
}

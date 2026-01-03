/**
 * DoneWell Health Adapter - Deploy Webhook Endpoint
 * POST /api/health/deploy
 * 
 * Triggered on successful production deploy.
 * Used to suppress alerts during deploy window and correlate regressions to releases.
 */

interface DeployPayload {
  site_id: string
  deploy_id: string
  environment: string
  timestamp?: string
  metadata?: Record<string, unknown>
}

interface DeployResponse {
  status: 'ok' | 'error'
  received: boolean
  deploy_id?: string
  error?: string
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const payload: DeployPayload = req.body

    // Validate required fields
    if (!payload.site_id || !payload.deploy_id || !payload.environment) {
      return res.status(400).json({
        status: 'error',
        received: false,
        error: 'Missing required fields: site_id, deploy_id, environment'
      } as DeployResponse)
    }

    // Log deploy event (picked up by Vercel logs for correlation)
    const deployEvent = {
      level: 'info',
      source: 'donewell-health-adapter',
      event: 'deploy',
      site_id: payload.site_id,
      deploy_id: payload.deploy_id,
      environment: payload.environment,
      timestamp: payload.timestamp || new Date().toISOString(),
      metadata: payload.metadata || {}
    }

    console.log(JSON.stringify(deployEvent))

    const response: DeployResponse = {
      status: 'ok',
      received: true,
      deploy_id: payload.deploy_id
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.status(200).json(response)
  } catch (err) {
    console.error('[DoneWell Deploy] Error processing deploy webhook:', err)
    return res.status(500).json({
      status: 'error',
      received: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    } as DeployResponse)
  }
}


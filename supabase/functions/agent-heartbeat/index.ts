import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface HeartbeatRequest {
  agent_key: string
  status?: 'online' | 'offline' | 'error' | 'maintenance'
  config?: Record<string, any>
  version?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { agent_key, status = 'online', config, version }: HeartbeatRequest = await req.json()

    if (!agent_key) {
      return new Response(
        JSON.stringify({ error: 'agent_key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the agent
    const { data: agent, error: agentError } = await supabaseClient
      .from('agents')
      .select('*')
      .eq('agent_key', agent_key)
      .single()

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update agent status and last seen
    const updateData: any = {
      status,
      last_seen_at: new Date().toISOString(),
    }

    if (config) {
      updateData.config = { ...agent.config, ...config }
    }

    if (version) {
      updateData.version = version
    }

    const { error: updateError } = await supabaseClient
      .from('agents')
      .update(updateData)
      .eq('id', agent.id)

    if (updateError) {
      console.error('Error updating agent:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update agent status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get agent's store assignments for any configuration updates
    const { data: storeAssignments } = await supabaseClient
      .from('store_agents')
      .select(`
        store_id,
        config,
        stores (
          id,
          name
        )
      `)
      .eq('agent_id', agent.id)
      .eq('is_active', true)

    return new Response(
      JSON.stringify({
        success: true,
        agent_id: agent.id,
        status,
        last_seen_at: updateData.last_seen_at,
        store_assignments: storeAssignments || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in agent-heartbeat function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
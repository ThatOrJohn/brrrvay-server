import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RegisterAgentRequest {
  token: string
  agent_key: string
  name?: string
  description?: string
  version?: string
  config?: Record<string, any>
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
    const { 
      token, 
      agent_key, 
      name, 
      description, 
      version, 
      config = {} 
    }: RegisterAgentRequest = await req.json()

    if (!token || !agent_key) {
      return new Response(
        JSON.stringify({ error: 'token and agent_key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate the registration token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('agent_registration_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .is('used_at', null)
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired registration token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Registration token has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if agent already exists
    let agent
    const { data: existingAgent } = await supabaseClient
      .from('agents')
      .select('*')
      .eq('agent_key', agent_key)
      .single()

    if (existingAgent) {
      // Update existing agent
      const { data: updatedAgent, error: updateError } = await supabaseClient
        .from('agents')
        .update({
          name: name || existingAgent.name,
          description: description || existingAgent.description,
          version: version || existingAgent.version,
          config: { ...existingAgent.config, ...config },
          status: 'online',
          last_seen_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('id', existingAgent.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating agent:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update agent' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      agent = updatedAgent
    } else {
      // Create new agent
      const { data: newAgent, error: createError } = await supabaseClient
        .from('agents')
        .insert({
          agent_key,
          name: name || `Agent ${agent_key}`,
          description,
          version,
          config,
          status: 'online',
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating agent:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create agent' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      agent = newAgent
    }

    // Check if store-agent mapping already exists
    const { data: existingMapping } = await supabaseClient
      .from('store_agents')
      .select('*')
      .eq('store_id', tokenData.store_id)
      .eq('agent_id', agent.id)
      .single()

    if (!existingMapping) {
      // Create store-agent mapping
      const { error: mappingError } = await supabaseClient
        .from('store_agents')
        .insert({
          store_id: tokenData.store_id,
          agent_id: agent.id,
          assigned_by: tokenData.created_by,
        })

      if (mappingError) {
        console.error('Error creating store-agent mapping:', mappingError)
        return new Response(
          JSON.stringify({ error: 'Failed to associate agent with store' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // Reactivate existing mapping if it was inactive
      if (!existingMapping.is_active) {
        await supabaseClient
          .from('store_agents')
          .update({ is_active: true })
          .eq('id', existingMapping.id)
      }
    }

    // Mark token as used
    await supabaseClient
      .from('agent_registration_tokens')
      .update({
        used_at: new Date().toISOString(),
        used_by_agent_id: agent.id,
        is_active: false,
      })
      .eq('id', tokenData.id)

    return new Response(
      JSON.stringify({
        success: true,
        agent: {
          id: agent.id,
          agent_key: agent.agent_key,
          name: agent.name,
          status: agent.status,
        },
        store_id: tokenData.store_id,
        message: 'Agent successfully registered and associated with store',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in register-agent function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
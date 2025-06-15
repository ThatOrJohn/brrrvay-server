import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerateTokenRequest {
  store_id: string
  expires_in_minutes?: number // Default to 15 minutes
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { store_id, expires_in_minutes = 15 }: GenerateTokenRequest = await req.json()

    if (!store_id) {
      return new Response(
        JSON.stringify({ error: 'store_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has access to this store (either internal user or store user)
    const { data: internalUser } = await supabaseClient
      .from('internal_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!internalUser) {
      // Check if user has access to this specific store
      const { data: userAccess } = await supabaseClient
        .from('user_access')
        .select('store_id')
        .eq('user_id', user.id)
        .eq('store_id', store_id)
        .single()

      if (!userAccess) {
        return new Response(
          JSON.stringify({ error: 'Access denied to this store' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate a random token (format: XXXX-XXXX)
    const generateToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      return `${part1}-${part2}`
    }

    let token = generateToken()
    let attempts = 0
    const maxAttempts = 10

    // Ensure token is unique
    while (attempts < maxAttempts) {
      const { data: existingToken } = await supabaseClient
        .from('agent_registration_tokens')
        .select('id')
        .eq('token', token)
        .single()

      if (!existingToken) break
      
      token = generateToken()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate unique token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expires_in_minutes * 60 * 1000)

    // Insert the token
    const { data: tokenData, error: insertError } = await supabaseClient
      .from('agent_registration_tokens')
      .insert({
        token,
        store_id,
        created_by: internalUser ? user.id : null,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting token:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create registration token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        token,
        store_id,
        expires_at: expiresAt.toISOString(),
        expires_in_minutes,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-agent-token function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
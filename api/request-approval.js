import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email } = req.body

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing userId or email' })
  }

  try {
    // Check if approval record already exists
    const { data: existing } = await supabase
      .from('user_approvals')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      return res.status(200).json({ message: 'Approval already requested' })
    }

    // Create approval token
    const approvalToken = crypto.randomUUID()

    // Insert pending approval
    const { error: insertError } = await supabase
      .from('user_approvals')
      .insert({
        user_id: userId,
        email,
        status: 'pending',
        approval_token: approvalToken
      })

    if (insertError) throw insertError

    // Use the production domain, not VERCEL_URL (which changes per deploy)
    const baseUrl = process.env.APP_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`

    const approveUrl = `${baseUrl}/api/approve?token=${approvalToken}&action=approve`
    const denyUrl = `${baseUrl}/api/approve?token=${approvalToken}&action=deny`

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'IRIS <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'zoraizarshad654@gmail.com'],
        subject: `IRIS Access Request: ${email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2d5016;">IRIS - New Access Request</h2>
            <p>A new user has requested access to the IRIS Agricultural Monitoring System:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            </div>
            <div style="margin-top: 24px;">
              <a href="${approveUrl}" style="display: inline-block; padding: 12px 24px; background: #2d5016; color: white; text-decoration: none; border-radius: 6px; margin-right: 12px;">
                Approve
              </a>
              <a href="${denyUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
                Deny
              </a>
            </div>
          </div>
        `
      })
    })

    if (!emailRes.ok) {
      const emailError = await emailRes.text()
      console.error('Email send error:', emailError)
      return res.status(200).json({ message: 'Approval requested', emailWarning: 'Email notification failed: ' + emailError })
    }

    return res.status(200).json({ message: 'Approval requested', emailSent: true })
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}

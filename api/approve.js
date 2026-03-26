import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const { token, action } = req.query

  if (!token || !['approve', 'deny'].includes(action)) {
    return res.status(400).send(page('Invalid Request', 'Missing or invalid parameters.', '#dc2626'))
  }

  try {
    // Find the approval record
    const { data: record, error: findError } = await supabase
      .from('user_approvals')
      .select('*')
      .eq('approval_token', token)
      .single()

    if (findError || !record) {
      return res.status(404).send(page('Not Found', 'This approval link is invalid or has expired.', '#dc2626'))
    }

    if (record.status !== 'pending') {
      return res.status(200).send(page(
        'Already Processed',
        `This request was already <strong>${record.status}</strong>.`,
        '#6b7280'
      ))
    }

    const newStatus = action === 'approve' ? 'approved' : 'denied'

    // Update the approval status
    const { error: updateError } = await supabase
      .from('user_approvals')
      .update({ status: newStatus })
      .eq('approval_token', token)

    if (updateError) throw updateError

    if (action === 'approve') {
      return res.status(200).send(page(
        'User Approved',
        `<strong>${record.email}</strong> has been approved and can now access IRIS.`,
        '#2d5016'
      ))
    } else {
      return res.status(200).send(page(
        'User Denied',
        `<strong>${record.email}</strong> has been denied access to IRIS.`,
        '#dc2626'
      ))
    }
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).send(page('Error', 'Something went wrong. Please try again.', '#dc2626'))
  }
}

function page(title, message, color) {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>IRIS - ${title}</title></head>
    <body style="font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f4f6;">
      <div style="text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px;">
        <h1 style="color: ${color}; margin-bottom: 12px;">${title}</h1>
        <p style="color: #374151; line-height: 1.6;">${message}</p>
      </div>
    </body>
    </html>
  `
}

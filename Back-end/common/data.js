export const userEmail = (user,title) => {
  
  return(` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #007bff;">Hello ${user.name},</h2>
          <p>Thank you for reaching out to our support team.</p>
          <p>Your support ticket has been successfully created with the following details:</p>
          
          <table style="border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 6px 10px;"><strong>Ticket Title:</strong></td>
              <td style="padding: 6px 10px;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px;"><strong>Status:</strong></td>
              <td style="padding: 6px 10px;">Open</td>
            </tr>
          </table>
          
          <p>Our support team will review your request and get back to you shortly.</p>
          
          <p style="margin-top: 20px;">Best regards,<br>
          <strong>Support Team</strong><br>
          <span style="color: #555;">Ticket Management System</span></p>
        </div>`)
};
export  const adminEmail = (user,title) => {
  return (
    ` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #007bff;">New Ticket Created</h2>
          <p>A new support ticket has been raised by a user. Below are the details:</p>
          
          <table style="border-collapse: collapse; margin-top: 10px;">
            <tr>
              <td style="padding: 6px 10px;"><strong>Title:</strong></td>
              <td style="padding: 6px 10px;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px;"><strong>User:</strong></td>
              <td style="padding: 6px 10px;">${user?.name} (${user?.email})</td>
            </tr>
            <tr>
              <td style="padding: 6px 10px;"><strong>Status:</strong></td>
              <td style="padding: 6px 10px;">Open</td>
            </tr>
          </table>
          
          <p>Please review the ticket and assign it to the appropriate team.</p>
          
          <p style="margin-top: 20px;">Best regards,<br>
          <strong>Ticket Management System</strong></p>
        </div>
    `
  )
}
export const updateUserTicketStatus = (updatedTicket,status) => {
  return (
    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #007bff;">Hello ${updatedTicket.userId.name},</h2>

      <p>We wanted to let you know that the status of your support ticket has been updated.</p>

      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 6px 10px;"><strong>Ticket Title:</strong></td>
          <td style="padding: 6px 10px;">${updatedTicket.title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>New Status:</strong></td>
          <td style="padding: 6px 10px;">${status}</td>
        </tr>
      </table>

      <p>If you have any questions or additional details to share, feel free to reply to this email or contact our support team directly.</p>

      <p style="margin-top: 20px;">Best regards,<br>
      <strong>Support Team</strong><br>
      <span style="color: #555;">Ticket Management System</span></p>
    </div>`
  )
}
export const ticketDeleted = (updatedTicket) => {
  return (
    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #007bff;">Hello ${updatedTicket?.userId?.name || 'User'},</h2>

      <p>We wanted to inform you that your support ticket titled <strong>${updatedTicket?.title}</strong> has been deleted automatically after 24 hours.</p>

      <p>This action was taken because the ticket remained in a <strong>Closed</strong> state for over 24 hour.</p>

      <p>If you believe this was a mistake or wish to reopen the request, please contact our support team.</p>

      <p style="margin-top: 20px;">Best regards,<br>
      <strong>Support Team</strong><br>
      <span style="color: #555;">Ticket Management System</span></p>
    </div>`
  )
}
export const verifyOtp = (otp) => {
  return (
    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #2c3e50;">Password Reset Verification</h2>
      <p>Dear User,</p>
      <p>We received a request to reset your password. Please use the one-time passcode (OTP) below to verify your identity and proceed with resetting your password:</p>

      <p style="font-size: 20px; font-weight: bold; color: #007bff; letter-spacing: 2px;">${otp}</p>

      <p><strong>Note:</strong> This OTP is valid for the next <b>5 minutes</b>. If you did not request a password reset, please ignore this email or contact our support team immediately.</p>

      <p>Best regards,<br>
      <strong>The Support Team</strong><br>
      Ticket Management System</p>
    </div>`
  )
}
export const teamMemberAssignedEmail = (ticket, teamMember) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2 style="color: #007bff;">Hello ${teamMember.name},</h2>

      <p>You have been assigned a new support ticket.</p>

      <table style="border-collapse: collapse; margin-top: 10px;">
        <tr>
          <td style="padding: 6px 10px;"><strong>Ticket Title:</strong></td>
          <td style="padding: 6px 10px;">${ticket.title}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>Description:</strong></td>
          <td style="padding: 6px 10px;">${ticket.description}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>Assigned By:</strong></td>
          <td style="padding: 6px 10px;">${ticket.assignedBy?.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 10px;"><strong>Status:</strong></td>
          <td style="padding: 6px 10px;">${ticket.status}</td>
        </tr>
      </table>

      <p>Please log in to your dashboard to view more details and take action.</p>

      <p style="margin-top: 20px;">Best regards,<br>
      <strong>Support Team</strong><br>
      <span style="color: #555;">Ticket Management System</span></p>
    </div>
  `;
};
export const teamCredentials = (name,email,password) => {
  const login="/login"
  return (
    `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #4CAF50;">Welcome to the Team!</h2>

  <p>Hello <strong>${name}</strong>,</p>

  <p>Your account has been created by the admin.  
     You can now log in using the credentials below:</p>

  <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>
  </div>

  <p>
    Please log in and update your password for security.
  </p>

  <a href="${login}" 
     style="display:inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
     Login Now
  </a>

  <p style="margin-top: 30px;">Regards,<br><strong>Support Team</strong></p>
</div>
`
  )
}
export const ticketAssignedToUserTemplate = (userName, ticket) => `
<div style="font-family: Arial; padding:20px; background:#f5f7fa;">
  <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:10px;">
    <h2 style="color:#007bff;">Ticket Assigned</h2>

    <p>Hi <strong>${userName}</strong>,</p>

    <p>Your ticket has been assigned to our support team. The assigned member will contact you soon.</p>

    <h3>🎫 Ticket Details</h3>
    <p><strong>Ticket ID:</strong> ${ticket._id}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>

    <h3>👨‍💻 Assigned To</h3>
    <p><strong>${ticket.assignedTo.name}</strong></p>
    <p>Email: ${ticket.assignedTo.email}</p>

    <p style="margin-top:20px;">Thank you for your patience.</p>
    <p><strong>Support Team</strong></p>
  </div>
</div>
`;

export const ticketAssignedToTeamTemplate = (memberName, ticket) => `
<div style="font-family: Arial; padding:20px; background:#f5f7fa;">
  <div style="max-width:600px;margin:auto;background:white;padding:25px;border-radius:10px;">
    <h2 style="color:#28a745;">New Ticket Assigned</h2>

    <p>Hi <strong>${memberName}</strong>,</p>

    <p>A new ticket has been assigned to you. Please review and reach out to the user.</p>

    <h3>🎫 Ticket Details</h3>
    <p><strong>Ticket ID:</strong> ${ticket._id}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Description:</strong> ${ticket.description}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>

    <h3>👤 User Information</h3>
    <p><strong>${ticket.userId.name}</strong></p>
    <p>Email: ${ticket.userId.email}</p>

    <p>Assigned By: ${ticket.assignedBy.name}</p>
    <p>Assigned At: ${ticket.assignedAt.toLocaleString()}</p>

    <p style="margin-top:20px;">Please take prompt action.</p>
    <p><strong>Support Team</strong></p>
  </div>
</div>
`;

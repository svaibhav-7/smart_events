const nodemailer = require('nodemailer');
const User = require('../models/User');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification to admins
const notifyAdmins = async (subject, message, details = {}) => {
  try {
    // Find all admin and faculty users
    const admins = await User.find({ 
      role: { $in: ['admin', 'faculty'] },
      isActive: true 
    }).select('email firstName lastName');

    if (admins.length === 0) {
      console.log('No admins found to notify');
      return;
    }

    // Send email to each admin
    const emailPromises = admins.map(admin => {
      const mailOptions = {
        from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Smart Campus - ${subject}</h2>
            <p>Hello ${admin.firstName} ${admin.lastName},</p>
            <p>${message}</p>
            ${details.title ? `<h3>${details.title}</h3>` : ''}
            ${details.description ? `<p>${details.description}</p>` : ''}
            ${details.category ? `<p><strong>Category:</strong> ${details.category}</p>` : ''}
            ${details.submittedBy ? `<p><strong>Submitted by:</strong> ${details.submittedBy}</p>` : ''}
            ${details.link ? `<p><a href="${details.link}" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review and Approve</a></p>` : ''}
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">This is an automated notification from Smart Campus. Please do not reply to this email.</p>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    console.log(`Notifications sent to ${admins.length} admin(s)`);
  } catch (error) {
    console.error('Error sending admin notifications:', error);
  }
};

// Notify event creator about approval/rejection
const notifyEventCreator = async (event, status, adminName) => {
  try {
    const mailOptions = {
      from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
      to: event.organizer.email,
      subject: `Event ${status === 'approved' ? 'Approved' : 'Rejected'}: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'approved' ? '#4caf50' : '#f44336'};">
            Event ${status === 'approved' ? 'Approved' : 'Rejected'}
          </h2>
          <p>Hello ${event.organizer.firstName} ${event.organizer.lastName},</p>
          <p>Your event "<strong>${event.title}</strong>" has been ${status} by ${adminName}.</p>
          ${status === 'approved' 
            ? `<p>Your event is now visible to all students and they can register for it.</p>
               <p>Event Details:</p>
               <ul>
                 <li>Date: ${new Date(event.startDate).toLocaleDateString()}</li>
                 <li>Time: ${event.startTime} - ${event.endTime}</li>
                 <li>Venue: ${event.venue}</li>
               </ul>`
            : `<p>Please contact the administration if you have any questions.</p>`
          }
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Smart Campus - Campus Event Management</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event ${status} notification sent to ${event.organizer.email}`);
  } catch (error) {
    console.error('Error sending event creator notification:', error);
  }
};

// Notify club creator about approval/rejection
const notifyClubCreator = async (club, status, adminName) => {
  try {
    const mailOptions = {
      from: `"Smart Campus" <${process.env.EMAIL_USER}>`,
      to: club.advisor.email,
      subject: `Club ${status === 'approved' ? 'Approved' : 'Rejected'}: ${club.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${status === 'approved' ? '#4caf50' : '#f44336'};">
            Club ${status === 'approved' ? 'Approved' : 'Rejected'}
          </h2>
          <p>Hello ${club.advisor.firstName} ${club.advisor.lastName},</p>
          <p>Your club "<strong>${club.name}</strong>" has been ${status} by ${adminName}.</p>
          ${status === 'approved' 
            ? `<p>Your club is now active and students can join it!</p>
               <p>Club Details:</p>
               <ul>
                 <li>Category: ${club.category}</li>
                 <li>Max Members: ${club.maxMembers || 'Unlimited'}</li>
                 ${club.meetingSchedule ? `<li>Meetings: ${club.meetingSchedule.day} at ${club.meetingSchedule.time}</li>` : ''}
               </ul>`
            : `<p>Please contact the administration if you have any questions.</p>`
          }
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">Smart Campus - Student Club Management</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Club ${status} notification sent to ${club.advisor.email}`);
  } catch (error) {
    console.error('Error sending club creator notification:', error);
  }
};

module.exports = {
  notifyAdmins,
  notifyEventCreator,
  notifyClubCreator,
};

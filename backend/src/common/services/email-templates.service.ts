import { Injectable } from '@nestjs/common';
import { EmailType, EmailTemplateData } from '../enums/email.enum';

@Injectable()
export class EmailTemplatesService {
  private readonly companyName = 'Sphere HR IMS';
  private readonly supportEmail = 'support@spherehr.com';

  getTemplate(
    type: EmailType, 
    data: EmailTemplateData = {}
  ): { subject: string; text: string; html: string } {
    const templates: Record<EmailType, { subject: string; text: string; html: string }> = {
      [EmailType.EMPLOYEE_WELCOME]: this.getEmployeeWelcomeTemplate(data),
      [EmailType.EMPLOYEE_CREDENTIALS]: this.getEmployeeCredentialsTemplate(data),
      [EmailType.EMPLOYEE_REGISTRATION_APPROVED]: this.getRegistrationApprovedTemplate(data),
      [EmailType.MANAGER_REGISTRATION_REQUEST]: this.getManagerRegistrationRequestTemplate(data),
      [EmailType.PASSWORD_RESET]: this.getPasswordResetTemplate(data),
      [EmailType.PAYSLIP_READY]: this.getPayslipReadyTemplate(data),
      [EmailType.LEAVE_APPROVED]: this.getLeaveApprovedTemplate(data),
      [EmailType.EMPLOYEE_PROFILE_VERIFIED]: this.getDefaultTemplate(data),
      [EmailType.MANAGER_REGISTRATION_APPROVED]: this.getDefaultTemplate(data),
      [EmailType.MANAGER_REGISTRATION_REJECTED]: this.getDefaultTemplate(data),
      [EmailType.ACCOUNT_LOCKED]: this.getDefaultTemplate(data),
      [EmailType.SECURITY_ALERT]: this.getDefaultTemplate(data),
      [EmailType.WORKFLOW_APPROVAL_REQUEST]: this.getDefaultTemplate(data),
      [EmailType.WORKFLOW_APPROVED]: this.getDefaultTemplate(data),
      [EmailType.WORKFLOW_REJECTED]: this.getDefaultTemplate(data),
      [EmailType.PAYROLL_PROCESSED]: this.getDefaultTemplate(data),
      [EmailType.LOAN_APPLICATION_STATUS]: this.getDefaultTemplate(data),
      [EmailType.LEAVE_APPLICATION_SUBMITTED]: this.getDefaultTemplate(data),
      [EmailType.LEAVE_REJECTED]: this.getDefaultTemplate(data),
      [EmailType.ATTENDANCE_REMINDER]: this.getDefaultTemplate(data),
      [EmailType.TRAINING_INVITATION]: this.getDefaultTemplate(data),
      [EmailType.TRAINING_REMINDER]: this.getDefaultTemplate(data),
      [EmailType.TRAINING_COMPLETED]: this.getDefaultTemplate(data),
      [EmailType.PERFORMANCE_REVIEW_INVITATION]: this.getDefaultTemplate(data),
      [EmailType.PERFORMANCE_REVIEW_REMINDER]: this.getDefaultTemplate(data),
      [EmailType.GOAL_SETTING_REMINDER]: this.getDefaultTemplate(data),
    };

    return templates[type] || this.getDefaultTemplate(data);
  }

  private getEmployeeWelcomeTemplate(data: EmailTemplateData) {
    const subject = `Welcome to ${this.companyName}!`;
    const text = `
Dear ${data.employeeName},

Welcome to ${this.companyName}! We're excited to have you on board.

Your employee number is: ${data.employeeNumber}
Your position: ${data.positionTitle}
Department: ${data.departmentName}
Start Date: ${data.startDate}

Please complete your profile verification at your earliest convenience.

If you have any questions, please contact ${this.supportEmail}.

Best regards,
${this.companyName} HR Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Welcome to ${this.companyName}!</h2>
      <p>Dear <strong>${data.employeeName}</strong>,</p>
      <p>We're excited to have you on board!</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Employee Number:</strong> ${data.employeeNumber}</p>
        <p><strong>Position:</strong> ${data.positionTitle}</p>
        <p><strong>Department:</strong> ${data.departmentName}</p>
        <p><strong>Start Date:</strong> ${data.startDate}</p>
      </div>
      
      <p>Please complete your profile verification at your earliest convenience.</p>
      <p>If you have any questions, please contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>.</p>
    `);

    return { subject, text, html };
  }

  private getEmployeeCredentialsTemplate(data: EmailTemplateData) {
    const subject = `Your ${this.companyName} System Access Credentials`;
    const text = `
Dear ${data.employeeName},

Your system access has been created. Here are your login credentials:

System URL: ${data.systemUrl}
Username: ${data.username}
Temporary Password: ${data.temporaryPassword}

For security reasons, please:
1. Log in immediately
2. Change your password
3. Set up security questions

If you encounter any issues, contact ${this.supportEmail}.

Best regards,
${this.companyName} IT Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Your ${this.companyName} System Access Credentials</h2>
      <p>Dear <strong>${data.employeeName}</strong>,</p>
      <p>Your system access has been created. Here are your login credentials:</p>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
        <p><strong>System URL:</strong> <a href="${data.systemUrl}">${data.systemUrl}</a></p>
        <p><strong>Username:</strong> ${data.username}</p>
        <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
      </div>
      
      <p><strong>For security reasons, please:</strong></p>
      <ol>
        <li>Log in immediately</li>
        <li>Change your password</li>
        <li>Set up security questions</li>
      </ol>
      
      <p>If you encounter any issues, contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>.</p>
    `);

    return { subject, text, html };
  }

  private getRegistrationApprovedTemplate(data: EmailTemplateData) {
    const subject = `Employee Registration Approved - ${data.employeeName}`;
    const text = `
Dear ${data.managerName},

The employee registration for ${data.employeeName} has been approved by HR.

Employee Details:
- Name: ${data.employeeName}
- Employee Number: ${data.employeeNumber}
- Position: ${data.positionTitle}
- Department: ${data.departmentName}

System access has been created and credentials have been sent to the employee.

Best regards,
${this.companyName} HR Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Employee Registration Approved</h2>
      <p>Dear <strong>${data.managerName}</strong>,</p>
      <p>The employee registration for <strong>${data.employeeName}</strong> has been approved by HR.</p>
      
      <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Employee Details:</strong></p>
        <p><strong>Name:</strong> ${data.employeeName}</p>
        <p><strong>Employee Number:</strong> ${data.employeeNumber}</p>
        <p><strong>Position:</strong> ${data.positionTitle}</p>
        <p><strong>Department:</strong> ${data.departmentName}</p>
      </div>
      
      <p>System access has been created and credentials have been sent to the employee.</p>
    `);

    return { subject, text, html };
  }

  private getManagerRegistrationRequestTemplate(data: EmailTemplateData) {
    const subject = `New Employee Registration Request - ${data.employeeName}`;
    const text = `
HR Team,

A new employee registration has been requested by ${data.managerName}.

Employee Details:
- Name: ${data.employeeName}
- Position: ${data.positionTitle}
- Department: ${data.departmentName}
- Requested By: ${data.managerName}

Please review and approve this registration in the HR system.

Best regards,
${this.companyName} System
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>New Employee Registration Request</h2>
      <p>HR Team,</p>
      <p>A new employee registration has been requested by <strong>${data.managerName}</strong>.</p>
      
      <div style="background: #e2e3e5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Employee Details:</strong></p>
        <p><strong>Name:</strong> ${data.employeeName}</p>
        <p><strong>Position:</strong> ${data.positionTitle}</p>
        <p><strong>Department:</strong> ${data.departmentName}</p>
        <p><strong>Requested By:</strong> ${data.managerName}</p>
      </div>
      
      <p>Please review and approve this registration in the HR system.</p>
    `);

    return { subject, text, html };
  }

  private getPasswordResetTemplate(data: EmailTemplateData) {
    const subject = `Password Reset Request - ${this.companyName}`;
    const text = `
You requested a password reset for your ${this.companyName} account.

Reset Code: ${data.resetCode}
Or click here: ${data.resetLink}

This code will expire in ${data.expiryMinutes} minutes.

If you didn't request this reset, please contact ${this.supportEmail} immediately.

Best regards,
${this.companyName} Security Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your ${this.companyName} account.</p>
      
      <div style="background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${data.resetCode}</p>
        <p>Or <a href="${data.resetLink}">click here</a> to reset your password</p>
      </div>
      
      <p>This code will expire in <strong>${data.expiryMinutes} minutes</strong>.</p>
      <p>If you didn't request this reset, please contact <a href="mailto:${this.supportEmail}">${this.supportEmail}</a> immediately.</p>
    `);

    return { subject, text, html };
  }

  private getPayslipReadyTemplate(data: EmailTemplateData) {
    const subject = `Your Payslip for ${data.payPeriod} is Ready`;
    const text = `
Dear ${data.employeeName},

Your payslip for ${data.payPeriod} is now available in the system.

Gross Pay: ${data.grossPay}
Net Pay: ${data.netPay}
Pay Date: ${data.payDate}

You can view and download your payslip from the employee portal.

Best regards,
${this.companyName} Payroll Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Your Payslip is Ready</h2>
      <p>Dear <strong>${data.employeeName}</strong>,</p>
      <p>Your payslip for <strong>${data.payPeriod}</strong> is now available in the system.</p>
      
      <div style="background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Gross Pay:</strong> ${data.grossPay}</p>
        <p><strong>Net Pay:</strong> ${data.netPay}</p>
        <p><strong>Pay Date:</strong> ${data.payDate}</p>
      </div>
      
      <p>You can view and download your payslip from the employee portal.</p>
    `);

    return { subject, text, html };
  }

  private getLeaveApprovedTemplate(data: EmailTemplateData) {
    const subject = `Leave Request Approved - ${data.leaveType}`;
    const text = `
Dear ${data.employeeName},

Your ${data.leaveType} leave request has been approved.

Leave Details:
- Type: ${data.leaveType}
- From: ${data.startDate}
- To: ${data.endDate}
- Total Days: ${data.totalDays}
- Approved By: ${data.approvedBy}

You can view the details in your leave balance.

Best regards,
${this.companyName} HR Team
    `;

    const html = this.wrapInHtmlTemplate(`
      <h2>Leave Request Approved</h2>
      <p>Dear <strong>${data.employeeName}</strong>,</p>
      <p>Your <strong>${data.leaveType}</strong> leave request has been approved.</p>
      
      <div style="background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Leave Details:</strong></p>
        <p><strong>Type:</strong> ${data.leaveType}</p>
        <p><strong>From:</strong> ${data.startDate}</p>
        <p><strong>To:</strong> ${data.endDate}</p>
        <p><strong>Total Days:</strong> ${data.totalDays}</p>
        <p><strong>Approved By:</strong> ${data.approvedBy}</p>
      </div>
      
      <p>You can view the details in your leave balance.</p>
    `);

    return { subject, text, html };
  }

  private getDefaultTemplate(data: EmailTemplateData) {
    const subject = data.subject || 'Notification from Sphere HR IMS';
    const text = data.message || 'You have a new notification from the HR system.';
    
    const html = this.wrapInHtmlTemplate(`
      <h2>Notification from ${this.companyName}</h2>
      <p>${data.message || 'You have a new notification from the HR system.'}</p>
    `);

    return { subject, text, html };
  }

  private wrapInHtmlTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .content { padding: 20px; background: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${this.companyName}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `;
  }
}
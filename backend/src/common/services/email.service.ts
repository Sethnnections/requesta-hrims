import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplatesService } from './email-templates.service';
import {
  EmailType,
  EmailPriority,
  EmailTemplateData,
  EmailAttachment,
} from '../enums/email.enum';
import {
  SendEmailDto,
  EmailResponse,
  EmailConfig,
} from '../interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private emailTemplates: EmailTemplatesService,
  ) {
    this.initializeTransporter();
  }

private initializeTransporter() {
  const emailConfig = {
    host: this.configService.get<string>('EMAIL_HOST') || 'smtp.gmail.com',
    port: this.configService.get<number>('EMAIL_PORT') || 465, // Changed to 465
    secure: this.configService.get<boolean>('EMAIL_SECURE') ?? true, // Changed to true
    auth: {
      user: this.configService.get<string>('EMAIL_USER') || '',
      pass: this.configService.get<string>('EMAIL_PASSWORD') || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  this.logger.log('Initializing email transporter with config:', {
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    user: emailConfig.auth.user,
    hasPassword: !!emailConfig.auth.pass,
  });
  
  this.transporter = nodemailer.createTransport(emailConfig);

  // Verify connection
  this.transporter.verify((error, success) => {
    if (error) {
      this.logger.error('Email transporter verification failed:', {
        error: error.message,
      });
    } else {
      this.logger.log('Email transporter is ready. Server says:', success);
    }
  });
}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<EmailResponse> {
    try {
      const {
        to,
        subject,
        text,
        html,
        template,
        templateData = {},
        attachments = [],
        priority = EmailPriority.NORMAL,
        cc,
        bcc,
      } = sendEmailDto;

      let finalSubject = subject;
      let finalText = text;
      let finalHtml = html;

      // Use template if provided
      if (template) {
        const templateContent = this.emailTemplates.getTemplate(
          template,
          templateData,
        );
        finalSubject = templateContent.subject;
        finalText = templateContent.text;
        finalHtml = templateContent.html;
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from:
          this.configService.get<string>('EMAIL_FROM') ||
          'noreply@spherehr.com',
        to,
        subject: finalSubject,
        text: finalText,
        html: finalHtml,
        cc,
        bcc,
        priority,
        attachments: attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      };

      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${to}, Message ID: ${result.messageId}`,
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : (() => {
                try {
                  return JSON.stringify(err);
                } catch {
                  return String(err);
                }
              })();

      this.logger.error(
        `Failed to send email to ${sendEmailDto.to}: ${errorMessage}`,
        err instanceof Error ? err : undefined,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async sendTemplateEmail(
    to: string | string[],
    template: EmailType,
    templateData: EmailTemplateData = {},
    attachments: EmailAttachment[] = [],
    cc?: string | string[],
    bcc?: string | string[],
  ): Promise<EmailResponse> {
    // Get template to extract subject
    const templateContent = this.emailTemplates.getTemplate(
      template,
      templateData,
    );

    return this.sendEmail({
      to,
      subject: templateContent.subject, // Required field
      template,
      templateData,
      attachments,
      cc,
      bcc,
    });
  }

  // Convenience methods for common email types
  async sendEmployeeWelcome(
    employeeEmail: string,
    employeeName: string,
    employeeNumber: string,
    positionTitle: string,
    departmentName: string,
    startDate: string,
  ): Promise<EmailResponse> {
    return this.sendTemplateEmail(employeeEmail, EmailType.EMPLOYEE_WELCOME, {
      employeeName,
      employeeNumber,
      positionTitle,
      departmentName,
      startDate,
    });
  }

  async sendEmployeeCredentials(
    employeeEmail: string,
    employeeName: string,
    username: string,
    temporaryPassword: string,
    systemUrl: string,
  ): Promise<EmailResponse> {
    return this.sendTemplateEmail(
      employeeEmail,
      EmailType.EMPLOYEE_CREDENTIALS,
      {
        employeeName,
        username,
        temporaryPassword,
        systemUrl,
      },
    );
  }

  async sendManagerRegistrationRequest(
    hrEmails: string[],
    employeeName: string,
    positionTitle: string,
    departmentName: string,
    managerName: string,
    employeeNumber: string,
  ): Promise<EmailResponse> {
    return this.sendTemplateEmail(
      hrEmails,
      EmailType.MANAGER_REGISTRATION_REQUEST,
      {
        employeeName,
        positionTitle,
        departmentName,
        managerName,
        employeeNumber,
      },
    );
  }

  async sendRegistrationApproved(
    managerEmail: string,
    managerName: string,
    employeeName: string,
    employeeNumber: string,
    positionTitle: string,
    departmentName: string,
  ): Promise<EmailResponse> {
    return this.sendTemplateEmail(
      managerEmail,
      EmailType.EMPLOYEE_REGISTRATION_APPROVED,
      {
        managerName,
        employeeName,
        employeeNumber,
        positionTitle,
        departmentName,
      },
    );
  }

  async sendPasswordReset(
    userEmail: string,
    resetCode: string,
    resetLink: string,
    expiryMinutes: number = 30,
  ): Promise<EmailResponse> {
    return this.sendTemplateEmail(userEmail, EmailType.PASSWORD_RESET, {
      resetCode,
      resetLink,
      expiryMinutes,
    });
  }

  async sendPayslipReady(
    employeeEmail: string,
    employeeName: string,
    payPeriod: string,
    grossPay: string,
    netPay: string,
    payDate: string,
    attachment?: EmailAttachment,
  ): Promise<EmailResponse> {
    const attachments = attachment ? [attachment] : [];

    return this.sendTemplateEmail(
      employeeEmail,
      EmailType.PAYSLIP_READY,
      {
        employeeName,
        payPeriod,
        grossPay,
        netPay,
        payDate,
      },
      attachments,
    );
  }
}

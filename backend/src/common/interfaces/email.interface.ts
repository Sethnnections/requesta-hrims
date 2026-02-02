import { EmailType, EmailPriority, EmailTemplateData, EmailAttachment } from '../enums/email.enum';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  companyName: string;
  supportEmail: string;
}

export interface SendEmailDto {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  template?: EmailType;
  templateData?: EmailTemplateData;
  attachments?: EmailAttachment[];
  priority?: EmailPriority;
  cc?: string | string[];
  bcc?: string | string[];
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
export interface MailJobInterface {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  context?: any;
  attachments?: any;
}

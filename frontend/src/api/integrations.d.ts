export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export function SendEmail(options: EmailOptions): Promise<void>; 
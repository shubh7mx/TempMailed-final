export interface Email {
  id: string;
  from: { address: string; name: string };
  to: { address:string; name: string }[];
  subject: string;
  intro: string;
  text?: string;
  html?: string;
  createdAt: string;
}

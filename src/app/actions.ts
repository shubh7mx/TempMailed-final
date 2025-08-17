
'use server';

import type { Email } from '@/types';
import { 
  getDomains as getDomainsFromApi,
  createAccount as createAccountFromApi,
  fetchInbox as fetchInboxFromApi,
  getEmail as getEmailFromApi,
} from '@/lib/mail-api';


export async function createAccount(password: string): Promise<{ address: string, token: string }> {
  const domains = await getDomainsFromApi();
  if (!domains || domains.length === 0) {
    throw new Error("Could not fetch domains.");
  }
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const address = `${Math.random().toString(36).substring(7)}@${domain}`;

  return createAccountFromApi(address, password);
}

export async function fetchInbox(token: string): Promise<Email[]> {
  return fetchInboxFromApi(token);
}

export async function getEmail(token: string, messageId: string): Promise<Email> {
  return getEmailFromApi(token, messageId);
}

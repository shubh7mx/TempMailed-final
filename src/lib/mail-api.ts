
import type { Email } from '@/types';

const API_BASE = 'https://mail.vlkn.in';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            console.error(`Attempt ${i + 1} failed for ${url} with status: ${response.status}`);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url} with error:`, error);
        }
        await new Promise(res => setTimeout(res, delay));
    }
    throw new Error(`Failed to fetch from ${url} after ${retries} retries.`);
}


export async function getDomains(): Promise<string[]> {
  const response = await fetchWithRetry(`${API_BASE}/domains`, {
    cache: 'no-store'
  });
  const data = await response.json();
  return data['hydra:member'].map((domain: any) => domain.domain);
}

export async function createAccount(address: string, password: string): Promise<{ address: string, token: string }> {
  const accountResponse = await fetchWithRetry(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, password }),
    cache: 'no-store',
  });

  if (!accountResponse.ok) {
    const errorText = await accountResponse.text();
    console.error("Failed to create account:", errorText);
    throw new Error('Failed to create account.');
  }
  const accountData = await accountResponse.json();

  const tokenResponse = await fetchWithRetry(`${API_BASE}/token`, {
     method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address, password }),
    cache: 'no-store',
  });
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Failed to fetch token:", errorText);
    throw new Error('Failed to fetch token.');
  }
  const tokenData = await tokenResponse.json();

  return { address: accountData.address, token: tokenData.token };
}

export async function fetchInbox(token: string): Promise<Email[]> {
  const response = await fetchWithRetry(`${API_BASE}/messages`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });
  const data = await response.json();
  return data['hydra:member'];
}

export async function getEmail(token: string, messageId: string): Promise<Email> {
  const response = await fetchWithRetry(`${API_BASE}/messages/${messageId}`, {
     headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store'
  });
  const data = await response.json();
  return data;
}

import { env } from '../config/env';

type RequestOptions = RequestInit & {
  path: string;
};

export async function apiRequest<T>({ path, headers, ...options }: RequestOptions): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;
  console.log('API URL:', url);
  console.log('API OPTIONS:', options);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log('API STATUS:', response.status);

    const data = await response.json();
    console.log('API DATA:', data);

    if (!response.ok) {
      throw new Error(data?.error || 'Napaka pri komunikaciji s strežnikom.');
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeout);
    console.log('API ERROR:', error);
    throw error;
  }
}

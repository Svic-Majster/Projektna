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

export async function updateUserProfile(userId: number, data: { ime: string; priimek: string; username: string }) {
    return apiRequest<{ id: number; ime: string; priimek: string; username: string; email: string; skupni_xp: number }>({
        path: `/users/profile/${userId}`,
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function uploadProfilePicture(
    userId: number,
    imageUri: string
) {
    const formData = new FormData();

    formData.append('profilePicture', {
        uri: imageUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
    } as any);

    const response = await fetch(
        `${env.apiBaseUrl}/users/profile/${userId}/avatar`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || 'Napaka pri nalaganju slike.');
    }

    return data;
}
export async function getUserProfile(userId: number) {
    return apiRequest<any>({
        path: `/users/profile/${userId}`,
        method: 'GET',
    });
}

export async function getUserGroups(userId: number) {
    return apiRequest<any[]>({
        path: `/users/${userId}/skupine`,
        method: 'GET',
    });
}

export async function getGroupLeaderboard(groupId: number) {
    return apiRequest<any>({
        path: `/skupina/${groupId}/leaderboard`,
        method: 'GET',
    });
}

export async function joinGroup(userId: number, koda: string) {
    return apiRequest<any>({
        path: `/users/skupina/pridruzi-se`,
        method: 'POST',
        body: JSON.stringify({ uporabnikId: userId, koda }),
    });
}

export async function createGroup(userId: number, imeSkupine: string) {
    return apiRequest<any>({
        path: `/users/skupina/ustvari`,
        method: 'POST',
        body: JSON.stringify({ uporabnikId: userId, imeSkupine }),
    });
}

export async function leaveGroup(groupId: number, userId: number) {
    return apiRequest<any>({
        path: `/users/skupina/${groupId}/zapusti`,
        method: 'DELETE',
        body: JSON.stringify({ uporabnikId: userId }),
    });
}

export async function deleteGroup(groupId: number, userId: number) {
    return apiRequest<any>({
        path: `/users/skupina/${groupId}/izbrisi`,
        method: 'DELETE',
        body: JSON.stringify({ uporabnikId: userId }),
    });
}
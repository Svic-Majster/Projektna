import { apiRequest, updateUserProfile, joinGroup } from './api';
import { env } from '../config/env';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const okResponse = (data: unknown, status = 200) => ({
  ok: true,
  status,
  json: async () => data,
});

const errorResponse = (data: unknown, status = 400) => ({
  ok: false,
  status,
  json: async () => data,
});

beforeEach(() => {
  mockFetch.mockReset();
});

describe('apiRequest', () => {
  it('hits the configured base URL with JSON headers and returns parsed data', async () => {
    mockFetch.mockResolvedValue(okResponse({ hello: 'world' }));

    const data = await apiRequest({ path: '/ping', method: 'GET' });

    expect(data).toEqual({ hello: 'world' });
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${env.apiBaseUrl}/ping`);
    expect(options.method).toBe('GET');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('merges custom headers with the default Content-Type', async () => {
    mockFetch.mockResolvedValue(okResponse({}));

    await apiRequest({ path: '/x', headers: { Authorization: 'Bearer t' } });

    const options = mockFetch.mock.calls[0][1];
    expect(options.headers.Authorization).toBe('Bearer t');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('throws with the server-provided error message on non-ok responses', async () => {
    mockFetch.mockResolvedValue(errorResponse({ error: 'Napaka X' }, 500));

    await expect(apiRequest({ path: '/x' })).rejects.toThrow('Napaka X');
  });

  it('throws a default message when the error body has no error field', async () => {
    mockFetch.mockResolvedValue(errorResponse({}, 500));

    await expect(apiRequest({ path: '/x' })).rejects.toThrow(
      'Napaka pri komunikaciji s strežnikom.'
    );
  });
});

describe('endpoint helpers', () => {
  it('updateUserProfile sends a PUT with the id in the path and a JSON body', async () => {
    mockFetch.mockResolvedValue(okResponse({ id: 7 }));

    await updateUserProfile(7, { ime: 'A', priimek: 'B', username: 'ab' });

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${env.apiBaseUrl}/users/profile/7`);
    expect(options.method).toBe('PUT');
    expect(JSON.parse(options.body)).toEqual({
      ime: 'A',
      priimek: 'B',
      username: 'ab',
    });
  });

  it('joinGroup posts the user id and the group code', async () => {
    mockFetch.mockResolvedValue(okResponse({ ok: true }));

    await joinGroup(3, 'TEST12');

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe(`${env.apiBaseUrl}/users/skupina/pridruzi-se`);
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({ uporabnikId: 3, koda: 'TEST12' });
  });
});

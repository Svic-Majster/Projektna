import { authService } from './auth.service';
import { apiRequest } from '../lib/api';

jest.mock('../lib/api', () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.Mock;

beforeEach(() => {
  mockApiRequest.mockReset();
});

describe('authService', () => {
  it('login posts the credentials to /auth/login and returns the response', async () => {
    const response = { message: 'ok', user: { id: 1 } };
    mockApiRequest.mockResolvedValue(response);
    const payload = { identifier: 'ana', geslo: 'skrivnost' };

    const result = await authService.login(payload);

    expect(result).toEqual(response);
    expect(mockApiRequest).toHaveBeenCalledWith({
      path: '/auth/login',
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  it('register posts the new user to /auth/register', async () => {
    mockApiRequest.mockResolvedValue({ message: 'created', user: { id: 2 } });
    const payload = {
      ime: 'A',
      priimek: 'B',
      username: 'ab',
      email: 'a@b.si',
      geslo: 'x',
    };

    await authService.register(payload);

    expect(mockApiRequest).toHaveBeenCalledWith({
      path: '/auth/register',
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });
});

import { API_BASE_URL } from '@/lib/env';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: BodyInit | Record<string, unknown> | null | undefined;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const { token, headers, body, ...rest } = options;
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
  });

  const parseJson = async () => {
    try {
      return (await response.json()) as ApiResponse<T> | { message?: string };
    } catch {
      return null;
    }
  };

  if (!response.ok) {
    const errorPayload = await parseJson();
    const message = errorPayload && 'message' in errorPayload && errorPayload.message
      ? errorPayload.message
      : '请求失败，请稍后重试';
    throw new Error(message);
  }

  const payload = (await parseJson()) as ApiResponse<T> | null;
  if (!payload) {
    throw new Error('服务器返回数据格式不正确');
  }
  if (payload.code !== 0) {
    throw new Error(payload.message || '请求失败');
  }

  return payload.data;
}

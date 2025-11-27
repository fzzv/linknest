import { API_BASE_URL } from '@/lib/env';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: BodyInit | Record<string, unknown> | null | undefined;
  locale?: string;
}

function getCurrentLocale(fallback: string = 'en'): string {
  if (typeof window === 'undefined') {
    // 在服务端调用时就用兜底值，或者直接返回 fallback
    return fallback;
  }

  // 优先用 <html lang="xx">
  const htmlLang = document.documentElement.lang;
  if (htmlLang) return htmlLang;

  // 尝试从 NEXT_LOCALE cookie 中读取
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }

  // 兜底
  return fallback;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const { token, headers, locale, body, ...rest } = options;
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept-Language': locale || getCurrentLocale(),
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

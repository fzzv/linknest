import { API_BASE_URL } from '@/lib/env';
import { useAuthStore } from '@/store/auth-store';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

type HandleResponse<T> = (res: Response) => Promise<T>;

interface RequestOptionsBase extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: BodyInit | Record<string, unknown> | null | undefined;
  locale?: string;
}

// handleResponse 自定义响应数据的处理方法
type RequestOptions = RequestOptionsBase & { handleResponse?: HandleResponse<unknown> };

// 不需要登录的接口
const PUBLIC_PATHS = ['/users/login', '/users/register', '/users/send-code', '/users/refresh'];

function isPublicPath(path: string) {
  return PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));
}

/**
 * 获取当前语言
 * @param fallback 兜底值
 * @returns 当前语言
 */
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

export async function apiClient<T>(path: string, options?: RequestOptionsBase): Promise<T>;
export async function apiClient<T>(path: string, options: RequestOptions & { handleResponse: HandleResponse<T> }): Promise<T>;
export async function apiClient<T>(path: string, options: RequestOptions = {}) {
  const { token, headers, locale, body, handleResponse, ...rest } = options;
  let authToken = token;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const isBlob = typeof Blob !== 'undefined' && body instanceof Blob;

  // 判断是否需要登录才能请求
  if (!authToken && !isPublicPath(path) && typeof window !== 'undefined') {
    try {
      authToken = useAuthStore.getState().tokens?.accessToken ?? undefined;
    } catch (error) {
      console.warn('Failed to read auth token from store', error);
    }
  }

  const requestHeaders: HeadersInit = {
    'Accept-Language': locale || getCurrentLocale(), // 用于后端的i18n国际化
    ...headers,
  };

  const shouldSetJsonContentType =
    !isFormData &&
    !isBlob &&
    body !== undefined &&
    body !== null &&
    typeof body !== 'string';

  // 判断是否需要设置Content-Type为application/json
  if (shouldSetJsonContentType && !('Content-Type' in requestHeaders)) {
    (requestHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  // 如果body是对象，则转换为JSON字符串
  const resolvedBody =
    shouldSetJsonContentType && typeof body !== 'string'
      ? JSON.stringify(body)
      : body ?? undefined;

  if (authToken) {
    (requestHeaders as Record<string, string>).Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: resolvedBody,
  });

  // 如果提供了处理响应的函数，则直接返回处理后的结果
  if (handleResponse) {
    return handleResponse(response);
  }

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

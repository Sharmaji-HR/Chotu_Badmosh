type RequestBody = BodyInit | object | null | undefined;

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: RequestBody;
  token?: string | null;
}

interface ApiErrorDetails {
  status: number;
  message: string;
  payload?: unknown;
}

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = 'ApiError';
    this.status = details.status;
    this.payload = details.payload;
  }
}

const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) {
    return '';
  }

  return value.replace(/\/$/, '');
};

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const isFormData = (body: RequestBody): body is FormData => {
  return typeof FormData !== 'undefined' && body instanceof FormData;
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const resolveErrorMessage = (payload: unknown, fallback: string) => {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const typedPayload = payload as {
    message?: string;
    errors?: Array<{ msg?: string }>;
  };

  if (typedPayload.message) {
    return typedPayload.message;
  }

  if (Array.isArray(typedPayload.errors) && typedPayload.errors.length > 0) {
    return typedPayload.errors.map((err) => err.msg).filter(Boolean).join(', ') || fallback;
  }

  return fallback;
};

export const apiRequest = async <T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { body, token, headers, ...restOptions } = options;

  const requestHeaders = new Headers(headers || {});

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...restOptions,
    headers: requestHeaders,
  };

  if (body !== undefined && body !== null) {
    if (isFormData(body) || typeof body === 'string' || body instanceof URLSearchParams || body instanceof Blob) {
      requestInit.body = body;
    } else {
      requestHeaders.set('Content-Type', 'application/json');
      requestInit.body = JSON.stringify(body);
    }
  }

  const response = await fetch(buildUrl(path), requestInit);
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message: resolveErrorMessage(payload, response.statusText || 'Request failed'),
      payload,
    });
  }

  return payload as T;
};

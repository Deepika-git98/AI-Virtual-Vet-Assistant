const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3001/api';

type ApiResponse<T> = {
    data: T;
    status: number;
};

export interface ApiError extends Error {
    response?: {
        status: number;
        data: unknown;
    };
}

const buildHeaders = (options: RequestInit): Headers => {
    const headers = new Headers(options.headers);
    const token = localStorage.getItem('token');

    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: buildHeaders(options)
    });

    const text = await response.text();
    let parsedBody: unknown = null;

    if (text) {
        try {
            parsedBody = JSON.parse(text);
        } catch {
            parsedBody = text;
        }
    }

    if (!response.ok) {
        const error = new Error(
            typeof parsedBody === 'object' && parsedBody !== null && 'error' in parsedBody
                ? (parsedBody as { error?: string }).error ?? 'Request failed'
                : 'Request failed'
        ) as ApiError;

        error.response = {
            status: response.status,
            data: parsedBody
        };

        throw error;
    }

    return {
        data: (parsedBody as T) ?? (undefined as T),
        status: response.status
    };
};

export const api = {
    get: async <T>(path: string) => {
        const result = await request<T>(path, { method: 'GET' });
        return result.data;
    },
    post: async <T>(path: string, body?: unknown) => {
        const result = await request<T>(path, {
            method: 'POST',
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
        return result.data;
    },
    put: async <T>(path: string, body?: unknown) => {
        const result = await request<T>(path, {
            method: 'PUT',
            body: body !== undefined ? JSON.stringify(body) : undefined
        });
        return result.data;
    },
    delete: async <T>(path: string) => {
        const result = await request<T>(path, { method: 'DELETE' });
        return result.data;
    }
};


declare module 'axios' {
  export * from 'axios';
  export interface AxiosInstance {
    get: any;
    post: any;
    put: any;
    delete: any;
    interceptors: any;
  }
  export interface AxiosError {
    response?: any;
    message?: string;
  }
  export interface InternalAxiosRequestConfig {
    headers: Record<string, any>;
    [key: string]: any;
  }
  export function create(config: any): AxiosInstance;
  const axios: {
    create(config: any): AxiosInstance;
  };
  export default axios;
}

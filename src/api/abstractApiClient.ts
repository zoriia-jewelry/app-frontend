import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../configs/config.ts';
import axios from 'axios';
import type { AbstractResponseDto } from '../dto/common.ts';

const acceptableStatuses: number[] = [200, 201];

/**
 *
 * TODO: improve logic during development
 *
 */
export abstract class AbstractApiClient {
    private static refreshTokenPromise: Promise<void> | null = null;

    protected static async handleError(message?: string) {
        // TODO: Add toast here
        console.error(message);
    }

    protected static async apiRequest<T>(
        cfg: AxiosRequestConfig & { _retry?: boolean } = {},
    ): Promise<T | void> {
        cfg.baseURL = cfg.baseURL || config.apiBase;

        if (cfg.params) {
            cfg.paramsSerializer = {
                serialize: (params) => {
                    const parts: string[] = [];
                    Object.entries(params).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            parts.push(
                                `${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`,
                            );
                        } else if (value !== undefined && value !== null) {
                            parts.push(
                                `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
                            );
                        }
                    });
                    return parts.join('&');
                },
            };
        }

        try {
            /**
             *
             * We are using cookies for access/refresh tokens so there is
             * no need in explicitly sending them in the request
             *
             * */
            const resp = await axios.request<AbstractResponseDto<T>>(cfg);
            if (acceptableStatuses.includes(resp.status)) {
                return (resp.data as AbstractResponseDto<T>).payload;
            }
        } catch (err: any) {
            const status = err.response?.status;

            /**
             *
             * If access token has expired - try to refresh it once.
             * Once again since we use cookies - no need in explicit token saving.
             *
             * */
            if (status === 401 && !cfg._retry) {
                if (!this.refreshTokenPromise) {
                    this.refreshTokenPromise = this.refreshToken()
                        .then((success) => {
                            this.refreshTokenPromise = null;
                            if (!success) throw new Error('refresh failed');
                            return;
                        })
                        .catch(() => {
                            this.refreshTokenPromise = null;
                            throw new Error('refresh failed');
                        });
                }

                cfg._retry = true;

                try {
                    const retryResp = await axios.request<AbstractResponseDto<T>>(cfg);
                    if (!acceptableStatuses.includes(retryResp.status)) {
                        await this.handleError();
                        return;
                    }
                    return (retryResp.data as AbstractResponseDto<T>).payload;
                } catch (err: any) {
                    await this.handleError();
                    return;
                }
            }
        }
    }

    private static async refreshToken(): Promise<boolean> {
        try {
            const resp: AxiosResponse<AbstractResponseDto<void>> = await axios.get(
                `${config.apiBase}/public/users/refresh-token`,
            );

            if (!acceptableStatuses.includes(resp.status)) {
                await this.handleError(); // TODO: remove here?
            }

            return true;
        } catch {
            return false;
        }
    }
}

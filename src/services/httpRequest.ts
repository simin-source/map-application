import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export function httpRequest({ url, headers, success, ...other }: AxiosRequestConfig & { success?: (res: AxiosResponse<any>) => void }) {
    return new Promise((resolve: (res: any) => void, reject: (res: any) => void) => {
        axios({
            method: 'POST', // 默认都是post请求
            url,
            ...other,
            headers: {
                ...headers,
            },
        }).then((response: AxiosResponse<any>) => {
            const { status, data } = response;
            switch (status) {
                case 200:
                    if (data?.code && data.emsg) {
                        reject(data);
                    } else {
                        if (success) {
                            resolve(success(response));
                        } else {
                            resolve(data);
                        }
                    }
                    break;
                case 401:
                    break;
                default:
                    reject(data);
                    break;
            }
        }).catch((error: any) => {
            console.log(error);
        });
    });
}
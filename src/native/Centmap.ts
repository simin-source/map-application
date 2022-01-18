class CentmapApi {
    constructor() {
        // parkingNumbers: NativeParkingNumbers = {
        //     occupy: [],
        //     reserveAble: [],
        // };
    }

    private deviceType?: 'iOS' | 'Android';

    initDeviceType() {
        const userAgent = window.navigator.userAgent;
        if (!userAgent.includes('CentMap')) return;
        if (userAgent.includes('iOS')) this.deviceType = 'iOS';
        else if (userAgent.includes('Android')) this.deviceType = 'Android';
    }

    locate() {
        this.postToNative('locate');
    }

    unlocate() {
        this.postToNative('unlocate');
    }

    navStart(lat: number, lng: number) {
        this.postToNative('navStart', lat, lng);
    }

    startMockNav(lat: number, lng: number) {
        this.postToNative('startMockNav', lat, lng);
    }

    navigationType(type: 1 | 2) {
        this.postToNative('navigationType', type);
    }

    voice(text: string) {
        this.postToNative('voice', text);
    }

    markerPoint(points: string) {
        this.postToNative('markerPoint', points);
    }

    withinPolygon(type: '0' | '1') {
        this.postToNative('withinPolygon', type);
    }

    navEnd(parkingNumbers: string) {
        this.postToNative('navEnd', parkingNumbers);
    }

    private postToNative(handle: string, ...params: any[]) {
        if (this.deviceType === 'iOS') {
            const iOSParam = params.reduce((p, c, i) => {
                return Object.assign(p, {
                    [`${handle}_${i + 1}`]: c,
                });
            }, {});
            // @ts-ignore
            window.webkit.messageHandlers[handle].postMessage(iOSParam);
        } else if (this.deviceType === 'Android') {
            // @ts-ignore
            window.Centmap[handle](...params);
        }
    }
}

export const Centmap = new CentmapApi();
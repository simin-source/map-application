import { Centmap } from '@/native/Centmap';

import { Loading } from '../loading/Loading';

class NativeNavigation {
    constructor() {
        // @ts-ignore
        window.cmap_unNav = (lat, lng, rdFl) => {
            Loading.hide();
            if (this._unNav) this._unNav([lng, lat, rdFl]);
        };
        // @ts-ignore
        window.cmap_simulationCoord = (lat, lng, rdFl) => {
            Loading.hide();
            // console.log(lat, lng, 'cmap_simulationCoord');
            if (this._unMockNav) this._unMockNav([lng, lat, rdFl]);
        };
        // @ts-ignore
        window.cmap_destroyNav = () => {
            Loading.hide();
            if (this._onDestroy) this._onDestroy();
        };
    }

    private _unNav?: (location: [number, number, number]) => void;
    private _unMockNav?: (location: [number, number, number]) => void;
    private _onDestroy?: () => void;

    setDestination([lng, lat]: [number, number], isMock = false) {
        try {
            Loading.show();
            Centmap.navigationType(isMock ? 1 : 2);
            Centmap.navStart(lat, lng);
        } catch (error) {
            throw new Error(`警告！不在指定Native App的webview环境！\n${error}`);
        }
        return this;
    }

    setMockStart([lng, lat]: [number, number]) {
        try {
            Loading.show();
            Centmap.startMockNav(lat, lng);
        } catch (error) {
            throw new Error(`警告！不在指定Native App的webview环境！\n${error}`);
        }
    }

    unNav(unNav?: (location: [number, number, number]) => void) {
        this._unNav = unNav;
        return this;
    }

    unMockNav(unMockNav?: (location: [number, number, number]) => void) {
        this._unMockNav = unMockNav;
        return this;
    }

    onDestroy(_onDestroy: () => void) {
        this._onDestroy = _onDestroy;
        return this;
    }
}

export const nativeNavigation = new NativeNavigation();
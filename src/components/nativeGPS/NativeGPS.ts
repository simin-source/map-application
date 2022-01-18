import { Loading } from '@/components/loading/Loading';
import { Centmap } from '@/native/Centmap';

export class NativeGPS {
    open = false;

    constructor() {
        // @ts-ignore
        window.cmap_coord = (lat: number , lng: number) => {
            Loading.hide();
            // console.warn('cmap_coord', lat, lng);
            if (this.positionType === 'once') {
                if (this._oncePosition) this._oncePosition([lng, lat]);
                this._oncePosition = undefined;
                this.positionType = 'ever';
                this.close();
            } else {
                Object.values({...this._onPositions}).forEach(i => i([lng, lat]));
            }
        };
        // @ts-ignore
        window.cmap_orien = (angle: number) => { // Centmap.locate() 成功后会执行这里
            if (this.directionType === 'once') {
                if (this._onceDirection) this._onceDirection(angle);
                this._onceDirection = undefined;
                this.directionType = 'ever';
            } else {
                Object.values({...this._onDirections}).forEach(fun => fun(angle));
            }
        };
        // @ts-ignore
        window.cmap_unusbl = () => {
            console.log('关闭GPS');
            Loading.hide();
            if (this._onClose) this._onClose();
            this.clear();
        };
    }

    private timer?: NodeJS.Timeout;
    private positionType: 'once' | 'ever' = 'ever';
    private directionType: 'once' | 'ever' = 'ever';

    private _onPositions: {[key: string]: (position: [number, number]) => void} = {};
    private _oncePosition?: (position: [number, number]) => void;
    private _onDirections: {[key: string]: (direction: number) => void} = {};
    private _onceDirection?: (direction: number) => void;
    private _onClose?: () => void;

    start() {
        Loading.show();
        console.log('开启GPS');
        if (!this.open) {
            try {
                this.open = true;
                Centmap.locate();
            } catch (error) {
                throw new Error(`警告！不在指定Native App的webview环境！\n${error}`);
            }
        }
        return this;
    }

    onPosition(type: 'once' | 'ever', _onPosition: (position: [number, number]) => void) {
        Loading.show();
        this.positionType = type;
        const hashID = this.getListenerID(_onPosition.toString());
        if (type === 'once') this._oncePosition = _onPosition;
        else this._onPositions[hashID] = _onPosition;

        return hashID;
    }

    onDirection = (type: 'once' | 'ever', _onDirection: (direction: number) => void) => {
        Loading.show();
        this.directionType = type;
        const hashID = this.getListenerID(_onDirection.toString());
        if (type === 'once') this._onceDirection = _onDirection;
        else this._onDirections[hashID] = _onDirection;
        return hashID;
    }

    close(_fun?: () => void) {
        if (!this.open) return;
        try {
            Loading.show();
            this._onClose = _fun;
            Centmap.unlocate();
        } catch (error) {
            throw new Error(`警告！不在指定Native App的webview环境！\n${error}`);
        }
    }

    removeListener(type: 'position' | 'direction' = 'position', id?: string) {
        if (type === 'position') {
            id ? delete this._onPositions[id] : this._onPositions = {};
        } else {
            id ? delete this._onDirections[id] : this._onDirections = {};
        }
    }

    private getListenerID(str: string) {
        return str.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0).toString();
    }

    private clear() {
        // this._onPositions = {};
        // this._onDirections = {};
        this.directionType = this.positionType = 'ever';
        this.open = false;
    }
}

export const nativeGPS = new NativeGPS();
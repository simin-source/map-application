import { animate, linear, AnimationOptions } from 'popmotion';

interface BaseObjType {
    [key: string]: any;
}

class MapManager {
    mapName?: string;

    private _cenmap?: BaseObjType;
    private _onReadyCallbackList?: Array<(centmap: BaseObjType) => void>;

    init(map: {[key: string]: any}) {
        this._cenmap = map;

        map.on('complete', (res: {info: any}) => {
            const { name } = res.info;
            document.title = `Centmap - ${name}`;
            this.mapName = name;
        });
        if (this._onReadyCallbackList) this._onReadyCallbackList.forEach(i => i(map));
    }

    onReady(fun?: (centmap: BaseObjType) => void) {
        if (!fun) return;
        if (this._cenmap) {
            fun(this._cenmap);
        } else {
            if (this._onReadyCallbackList) this._onReadyCallbackList.push(fun);
            else this._onReadyCallbackList = [fun];
        }
    }

    zoomTo(zoom: number, options?: AnimationOptions<any>) {
        const centmap = this._cenmap;
        if (!centmap) return;
        const from = centmap.getZoom();
        animate({
            from,
            to: zoom,
            onUpdate(res) {
                centmap.zoom(res);
            },
            ease: linear,
            duration: 200,
            ...options,
        });
    }

    angleTo(angle: number, options?: AnimationOptions<any>) {
        const centmap = this._cenmap;
        if (!centmap) return;
        const cAngle = centmap.getAngle();
        animate({
            from: Math.abs(cAngle - angle) > 3.1415 ? (cAngle > 0 ? cAngle - 6.2832 : cAngle + 6.2832) : cAngle,
            to: angle,
            onUpdate(res) {
                // const curA = centmap.getAngle();
                centmap.angle(res);
            },
            ease: linear,
            duration: 200,
            ...options,
        });
    }

    pitchTo(pitch: number, options?: AnimationOptions<any>) {
        const centmap = this._cenmap;
        if (!centmap) return;
        const cPitch = centmap.getPitch();
        animate({
            from: cPitch,
            to: pitch,
            onUpdate(p) {
                centmap.pitch(p);
            },
            duration: 200,
            ease: linear,
            ...options,
        });
    }

    moveTo(cmapCoord: [number, number]) {
        const centmap = this._cenmap;
        if (!centmap) return;
        centmap.moveTo(...cmapCoord);
    }

    get centmap() {
        return this._cenmap;
    }

    destroy() {
        delete this._cenmap;
        delete this._onReadyCallbackList;
    }
}

export const mapManager = new MapManager();
import { navInfoState } from '../navInfo/NavInfo';
import { planState } from '../planBox/PlanBox';
import locationIMG from './location.png';
import { getStartAndEnd, naviSimulate } from './mockData/Mock';

interface LocateRes {
    curPathRemainDistance: number;
    remainDistance: number;
    curPathDistance: number;
    direction: number;
    curPathWheelInfo: string[];
    cmapCoord: [number, number];
    endPoint: [number, number];
    rdFl: number;
}

export class NavLine {
    routeReady = false;

    constructor(private _centmap: any, private _type?: 'mock') {
        if (!_centmap || !_centmap.routeManager) throw Error('navLine init faild!');
        this._centmap = _centmap;
        this.routeManager = _centmap.routeManager;
        _centmap.on('complete', () => {
            this.routeManager.setNaviIcon(locationIMG, 12);
        });

        _centmap.on('switchBuilding', ({ info }: { info: any }) => {
            const { floorList, buildingID, rdFl } = info;
            if (floorList && typeof rdFl === 'number' && typeof buildingID === 'number') {
                this._currentRdFls[`${buildingID}`] /* = this._currentRdFl */ = rdFl;
                this.toggleLine();
            }
        });

        _centmap.on('switchFloor', ({ info }: { info: any }) => {
            const { floorList, buildingID, rdFl } = info;
            if (floorList && typeof rdFl === 'number' && typeof buildingID === 'number') {
                this._currentRdFls[`${buildingID}`] /* = this._currentRdFl */ = rdFl;
                this.toggleLine();
            }
        });
    }

    private routeManager: any;

    // private _currentRdFl?: number;
    private _currentRdFls: {
        [key: string]: number;
    } = {};

    private _closeMock?: () => void;
    private _onLocate?: (res: LocateRes) => void;

    private _lastCoord?: [number, number];
    private _lastDirection = 0;

    async draw(sLng: number, sLat: number, sRdFl: number, dLng: number, dLat: number, dRdFl: number, type = 0, connType?: number[]) {
        const { routeManager, _centmap } = this;
        if (!routeManager || !_centmap) return;
        this.routeReady = false;
        let pathInfo;
        if (this._type === 'mock') {
            const mock = getStartAndEnd();
            pathInfo = await routeManager.route(mock[0][0], mock[0][1], 1, mock[1][0], mock[1][1], 1, type, connType ? connType : [0]);
        } else {
            pathInfo = await routeManager.route(sLng, sLat, sRdFl, dLng, dLat, dRdFl, type, connType ? connType : [0]);
        }
        console.log('?????????');
        console.log('connType');
        console.log(connType);
        console.log(pathInfo);
        this.routeReady = true;
        this.toggleLine();
        return pathInfo as { distance: number };
    }

    set onLocate(_onLocate: (res: LocateRes) => void) {
        this._onLocate = _onLocate;
    }

    anchorLocation = (cmapCoord: [number, number], direction?: number) => {
        if (typeof direction === 'number') this._lastDirection = direction;
        this._lastCoord = cmapCoord;
        this._locate();
        return this;
    }

    anchorDirection(direction: number) {
        this._lastDirection = direction;
        this._locate();
        return this;
    }

    locate = (point?: [number, number, number]) => {
        // ?????????????????????
        const { routeManager, routeReady } = this;
        if (!routeManager || !routeReady || !point) return;
        const info = routeManager.getCurrentPathInfo(...point);
        const [curPathRemainDistance, remainDistance, curPathDistance, direction] = info[0];
        // console.log('??????????????????');
        // console.log(info);
        /*
        curPathRemainDistance ?????????????????????????????????
        remainDistance  ????????????
        curPathDistance ???????????????????????????
        direction ??????-3.1382782383385264
        */
        const cmapCoord = [point[0], point[1]] as [number, number];
        if (this._onLocate) {
            this._onLocate({
                curPathRemainDistance,
                remainDistance,
                curPathDistance,
                direction,
                curPathWheelInfo: info[1],
                cmapCoord,
                endPoint: info[2],
                rdFl: point[2],
            });
        }
    }

    runMock = () => {
        // ??????????????????
        const { routeManager, routeReady } = this;
        if (!routeManager || !routeReady) return;
        let points: Array<[number, number, number]>;
        if (this._type === 'mock') {
            points = naviSimulate() as Array<[number, number, number]>;
        } else {
            points = routeManager.naviSimulate() as Array<[number, number, number]>;
        }
        console.log("????????????");
        // console.log(points);
        if (points.length === 0) return;
        const timer = setInterval(() => {
            this.locate(points[navInfoState.currentPointIndex]);
            navInfoState.currentPointIndex++;
            if (navInfoState.currentPointIndex >= points.length || navInfoState.isParseMock) clearInterval(timer);
        }, 10);
        this._closeMock = () => {
            this.clear();
            clearInterval(timer);
        };
    }

    getAdsorbPoint(point: [number, number]): [number, number, number, number] | undefined {
        const { routeManager } = this;
        if (!routeManager) return;
        const adsorbP = routeManager.attach(...point);
        return point[0] === adsorbP[0] && point[1] === adsorbP[1] ? undefined : [...adsorbP] as [number, number, number, number];
    }

    parseMock = (isParse: boolean) => {
        console.log(isParse);
        // const { _closeMock } = this;
        // if (_closeMock) _closeMock();
    }

    closeMock = () => {
        const { _closeMock } = this;
        if (_closeMock) _closeMock();
    }

    clear() {
        const { routeManager } = this;
        if (!routeManager) return;
        this.routeReady = false;
        routeManager.unRoute();
        routeManager.unLocate();
        routeManager.clear();
    }

    private _locate() {
        const { routeManager, routeReady, _lastDirection, _lastCoord } = this;
        if (!routeManager || !routeReady || !_lastCoord) return this;
        routeManager.locate(..._lastCoord, _lastDirection);
    }

    private toggleLine() {
        const { routeManager, _currentRdFls, routeReady } = this;
        if (!routeManager || !routeReady) return;
        const rdFls = Object.values(_currentRdFls);
        routeManager.unRoute();
        routeManager.drawPath([0, ...rdFls]);
    }
}
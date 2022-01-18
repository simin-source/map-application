import { defineComponent, reactive } from "vue";
import { CarState, newDestination } from '@/components/carBox/CarBox';
import { planState } from '../routePlanBox/PlanBox';
import {
    navInfo_box, nav_img, nav_meter, car_nav, store_nav, select_start
} from './NavInfo.module.scss';

import transformUrl from '@/assets/img/transform.png';
import arrowUrl from '@/assets/img/arrow.png';
import { NavInfoItemType, PointType } from "@/types";
import { mapManager } from "@/map/MapManager";
import { NavLine } from "@/components/navLine/NavLine";
import { nativeGPS } from "@/components/nativeGPS/NativeGPS";
import { nativeNavigation } from "@/components/nativeNavigation/NativeNavigation";
import { voiceManager } from "@/components/voice/Voice";
import { navigationEnd } from "@/components/navigationEnd/NavigationEnd";
import { angle2Radian } from "@/utils/base";
import { StoreState } from "@/components/storeBox/StoreBox";

export const navInfoState: {
    onNav?: () => void;
    onExit?: () => void;
    onClose?: (bearing?: number) => void;
    runMock?: () => void;
    instructions?: NavInfoItemType[][];
    curStepRemain_info?: {
        distance: number;
        id: string;
    };
    // curStepInfo?: CurStepInfoType;
    curPathInfo?: {
        icon: string;
        description: string;
    };
    isMock?: boolean; //是否模拟导航
    mockReady: boolean;
    pathDistance: number;
    pathRemainDistance?: number;
    curPathRemainDistance?: number;
    curPathDistance?: number;
    curPathWheelInfo?: string[];
} = reactive({
    isMock: false,
    mockReady: false,
    pathDistance: 0,
});

interface CurStepInfoType {
    description: string;
    distance: number;
    id: string;
}

let playMomentInfo = '';
let tempPlayMomentInfo = '';
let tempId = '';
let naviEnd = false;
let crossLnglat: [number, number] | undefined;
let crossCurrPathEndPoint: [number, number] | undefined;

// function clearNavInfoState() {
//     playMomentInfo = tempPlayMomentInfo = '';
//     navInfoState.instructions = navInfoState.curStepRemain_info = navInfoState.curStepInfo = navInfoState.curPathInfo = undefined;

//     navInfoState.isMock = navInfoState.pathRemainDistance = navInfoState.curPathRemainDistance = navInfoState.curPathDistance = navInfoState.curPathWheelInfo = undefined;
//     navInfoState.mockReady = false;
//     navInfoState.pathDistance = 0;
//     navInfoState.onExit = navInfoState.onNav = navInfoState.onClose = navInfoState.runMock = undefined;
// }


export const NavigationInfoBox =defineComponent({
    name: 'NavInfo',
    data() {
        return {
            isTranslate: false,
        }
    },
    render() {
        return <div class={navInfo_box} style={{ display: `${CarState.isNavgateInfo || planState.isRouteInfo ? 'flex' : 'none'}` }}>
            <div class={store_nav} style={{ display: `${planState.isRouteInfo ? 'flex' : 'none'}` }}>
                <div class={select_start}>
                    <div style={{ flexDirection: `${this.isTranslate ? 'column-reverse' : 'column'}` }}>
                        <div>
                            <p style={{ background: '#5880d0' }}></p>
                            <input type="text" value={StoreState.currentPoint?.name} placeholder="我的位置" />
                        </div>
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#BBBBBB', padding: '0' }}></div>
                        <div>
                            <p style={{ background: '#D05858' }}></p>
                            <input type="text" value='1-12' readonly />
                        </div>
                    </div>
                    <div style={{ marginLeft: '10px' }} onClick={() => { this.isTranslate = !this.isTranslate; }}>
                        <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                    </div>
                </div>
            </div>
            <div class={car_nav} style={{ display: `${CarState.isNavgateInfo ? 'flex' : 'none'}` }}>
                <div class={nav_img}>
                    <img src={arrowUrl} alt='图片找不到' />
                </div>
                <div class={nav_meter}>
                    <div>沿着当前道路直行</div>
                    <div>50米</div>
                </div>
            </div>
        </div >;
    },
});

export class Navigation {
    static naving = false;
    static InfoBox = NavigationInfoBox;

    targetParkingNum?: string;
    currentPositionInfo?: {
        location: [number, number];
        rdFl: number;
    };

    constructor() {
        mapManager.onReady(centmap => {
            this._centmap = centmap;
            const line = this._navLine = new NavLine(centmap);
            console.log(line);
            
            line.onLocate = info => {
                const { curPathRemainDistance, remainDistance, curPathDistance, curPathWheelInfo, cmapCoord, direction, endPoint, rdFl } = info;
                this.currentPositionInfo = {
                    location: cmapCoord,
                    rdFl,
                };
                navInfoState.curPathRemainDistance = +curPathRemainDistance.toFixed(0);
                navInfoState.pathRemainDistance = +remainDistance.toFixed(0);
                navInfoState.curPathDistance = curPathDistance;
                navInfoState.curPathWheelInfo = curPathWheelInfo as string[];
                crossLnglat = centmap.cmapCoordToWGS84(...cmapCoord);
                crossCurrPathEndPoint = centmap.cmapCoordToWGS84(...endPoint);
                if (!this._cameraOption.fixed && !this.locationNodeDeviate) this.setCamera(cmapCoord, direction);
                if (!this.locationNodeDeviate) line.anchorLocation(cmapCoord, direction);
            };
        });
        // @ts-ignore
        window.cmap_judgeCoord = (lat: number , lng: number) => {
            if (!this._centmap || !lat || !lng) return;
            const cmapCoord = this._centmap.wgs84ToCmapCoord(lng, lat);
            const contains = this._centmap.contains(cmapCoord[0], cmapCoord[1]);
            // Centmap.withinPolygon(contains ? '1' : '0');
        };
    }

    private _centmap: any;
    private _navLine?: NavLine;
    private _onClose: Array<() => void> = [];

    private navPoints: {
        start?: PointType;
        end?: PointType;
    } = {};

    private _cameraOption: {
        zoom?: number;
        rotate?: any;
        pitch?: number;
        fixed: boolean;
    } = {
        fixed: false,
    };

    private locationNodeDeviate = false; //导航偏离

    destination(point: PointType, mock:boolean) {
        const { _centmap } = this;
        if (!_centmap) return;
        const destination = _centmap.cmapCoordToWGS84(...point.location); 
        this.navPoints.end = point;
        if (mock) {
            navInfoState.isMock = true;
            // 模拟导航
            navInfoState.onExit = (bearing?: number) => {
                this.clear();
                navInfoState.isMock = navInfoState.runMock = undefined;
            };
        } else {
            // GPS导航
            if (newDestination()) return;
            this.planningRoad();
            if (navInfoState.pathDistance > 50) {
                // const text = Parking.onSearch ? '您已进入停车范围，开始寻车导航' : '开始车位导航，请减速慢行';
                const text = '开始车位导航，请减速慢行';
                voiceManager.play(text, true);
            }
            this.startEverGPS();
            // nativeGPS.start().onPosition('once', async gps => {
            //     const cmapCoord = _centmap.wgs84ToCmapCoord(...gps);
            //     if (!_centmap.contains(cmapCoord[0], cmapCoord[1])) {
            //         nativeNavigation.setDestination(destination).unNav(async ([lng, lat, rdFl]: [number, number, number]) => {
            //             // GPS获取开始点
            //             this.currentPositionInfo = {
            //                 location: _centmap.wgs84ToCmapCoord(lng, lat),
            //                 rdFl,
            //             };
            //             if (newDestination()) return;
            //             this.navPoints.start = {
            //                 location: _centmap.wgs84ToCmapCoord(lng, lat),
            //                 rdFl,
            //                 height: 0,
            //             };
            //             await this.planningRoad();
            //             if (navInfoState.pathDistance > 50) {
            //                 // const text = Parking.onSearch ? '您已进入停车范围，开始寻车导航' : '开始车位导航，请减速慢行';
            //                 const text = '开始车位导航，请减速慢行';
            //                 voiceManager.play(text, true);
            //             }
            //             this.startEverGPS();
            //         }).onDestroy(() => {
            //             this.navClose();
            //             this.clear();
            //             // driftCorrection.close();
            //             voiceManager.clear();
            //         });
            //     } 
            //     // else {
            //     //     const rdFl = _centmap.getGroundLastRdFl();
            //     //     this.navPoints.start = {
            //     //         location: cmapCoord,
            //     //         rdFl,
            //     //         height: 0,
            //     //     };
            //     //     await this.planningRoad();
            //     //     navInfoState.onNav = () => {
            //     //         if (navInfoState.pathDistance > 50) {
            //     //             // voiceManager.play(`开始${Parking.onSearch ? '寻车导航' : '车位导航，请减速慢行'}`, true);
            //     //             voiceManager.play('开始寻车导航', true);
            //     //         }
            //     //         this.startEverGPS();
            //     //     };
            //     // }
            //     navInfoState.onExit = () => {
            //         this.clear();
            //     };
            //     navInfoState.onClose = (bearing?: number) => {
            //         this.navClose();
            //     };
            // });
            // nativeGPS.onDirection('ever', direction => {
            //     if (this.locationNodeDeviate) {
            //         const radian = angle2Radian(direction);
            //         if (this._navLine) this._navLine.anchorDirection(-radian);
            //     }
            // });
            // driftCorrection.onDrift(async location => {
            //     this.clear();
            //     const rdFl = _centmap.getGroundLastRdFl();
            //     this.navPoints.start = {
            //         location: this._centmap.wgs84ToCmapCoord(...location),
            //         rdFl,
            //         height: 0,
            //     };
            //     this.navPoints.end = point;
            //     await this.planningRoad();
            //     _centmap.markerManager.setLngLat('target', point.location, point.height);
            //     _centmap.markerManager.show('target');
            //     voiceManager.play('您已偏离路线，已重新为你规划导航', true);
            //     navInfoState.onClose = (bearing?: number) => {
            //         // if (typeof bearing === 'number') mapManager.angleTo(bearing);
            //         this.navClose();
            //     };
            // });
        }
    }

    get isMock() {
        return navInfoState.isMock;
    }

    get navDestination() {
        return this.navPoints.end;
    }

    newDestination = async (point: PointType) => {
        const { _centmap } = this;
        if (!_centmap || !this.currentPositionInfo) return;
        if (this._navLine) {
            this._navLine.closeMock();
            this._navLine.clear();
        }
        const { location, rdFl } = this.currentPositionInfo;
        this.navPoints.start = {
            location,
            rdFl,
            height: 0,
        };
        this.navPoints.end = point; //终点：carBOX的newDestination确定的距离最近的点
        _centmap.markerManager.setLngLat('target', point.location, point.height);
        _centmap.markerManager.show('target');

        if (navInfoState.isMock) {
            _centmap.markerManager.setLngLat('current', location, 0);
            // _centmap.markerManager.show('target');
            await this.initMockNav();
            this.runMockNav('您选的车位已被占用，已为您规划至目的地附近其它车位');
        } else {
            await this.planningRoad();
            voiceManager.play('您选的车位已被占用，已为您规划至目的地附近其它车位', true);
            this.startEverGPS();
            navInfoState.onClose = (bearing?: number) => {
                // if (typeof bearing === 'number') mapManager.angleTo(bearing);
                this.navClose();
            };
        }
    }

    set mockStartPoint(point: PointType | undefined) {
        if (!this._centmap) return;
        const { end } = this.navPoints;
        console.log(this.navPoints);
        if (point && end) {
            const { height, ...other } = point;
            const { height: h, ...o } = end;
            if (JSON.stringify(other) === JSON.stringify(o)) return;
            this.navPoints.start = point;
            navInfoState.mockReady = !!this.navPoints.start && !!end;
            this._centmap.contains(other.location[0], other.location[1]) ? this.initMockNav() : this.initAmapMockNav();
        } else this.navPoints.start = undefined;
    }

    onClose(fun: () => void) {
        this._onClose.push(fun);
    }

    private async planningRoad() {
        console.log('规划路线');
        console.log(this.navPoints);
        const { _navLine } = this;
        const { start, end } = this.navPoints;
        if (!_navLine || !start || !end) return;
        const info = await _navLine.draw(...start.location, start.rdFl, ...end.location, end.rdFl);
        if (info) navInfoState.pathDistance = +info.distance.toFixed(0);
        // LocationButtonState.active = false;
        return info;
    }

    private startEverGPS() {
        const { start } = this.navPoints;
        if (!start) return;
        Navigation.naving = true;
        nativeGPS.start().onPosition('ever', gps => {
            if (!this._navLine) return;
            const cmapCoord = this._centmap.wgs84ToCmapCoord(...gps);
            const point = this._navLine.getAdsorbPoint(cmapCoord);
            if (!point) return;
            const [ lng, lat, distance, rdFl ] = point as [number, number, number, number];
            this.locationNodeDeviate = distance > 14;
            if (this.locationNodeDeviate) {
                this._navLine.anchorLocation(cmapCoord);
                // this._centmap.moveTo(...cmapCoord);
                // driftCorrection.running(gps);
                // crossImageTip.close();
            } 
            // else driftCorrection.close();
            this._navLine.locate([lng, lat, rdFl]);
        });
        this._centmap.moveTo(...start.location);
        navInfoState.onClose = () => {
            this.navClose();
        };
    }

    private initAmapMockNav() {
        console.log('初始化高德模拟导航');
        const { end } = this.navPoints;
        if (!end) return;
        if (this._navLine) this._navLine.clear();
        navInfoState.runMock = this.runAmapMockNav;
    }

    private runAmapMockNav = () => {
        const { start, end } = this.navPoints;
        if (!start || !end) return;
        nativeNavigation.setMockStart(this._centmap.cmapCoordToWGS84(...start.location));
        nativeNavigation.setDestination(this._centmap.cmapCoordToWGS84(...end.location), true);
    }

    private initMockNav = async () => {
        console.log('初始化模拟导航');
        const { _navLine } = this;
        const { start, end } = this.navPoints;
        if (!_navLine || !start || !end) return;
        // 规划路线
        const pathInfo = await this.planningRoad();
        if (!pathInfo) return;
        navigationEnd.getEndPoint(end.location);
        navInfoState.runMock = this.runMockNav;
    }

    private runMockNav = (text?: string) => {
        const { _navLine, _centmap } = this;
        if (!_navLine || !_centmap) return;
        Navigation.naving = true;
        // LocationButtonState.active = false;
        if (navInfoState.pathDistance > 50) {
            // 语音播报开始导航
            voiceManager.play(text ? text : '开始车位导航，请减速慢行', true);
        }
        _navLine.runMock();
        navInfoState.onClose = (bearing?: number) => {
            this.clear();
            _navLine.closeMock();
            navInfoState.isMock = navInfoState.runMock = undefined;
            // if (typeof bearing === 'number') mapManager.angleTo(bearing);
        };
    }

    private setCamera(cmapCoord: [number, number], bearing?: number) {
        if (typeof bearing === 'number' && this._cameraOption.rotate !== bearing) {
            this._cameraOption.rotate = bearing;
            mapManager.angleTo(bearing);
        }
        if (this._cameraOption.zoom !== 0.4) {
            this._cameraOption.zoom = 0.4;
            mapManager.zoomTo(0.4);
        }
        if (this._cameraOption.pitch !== 0) {
            this._cameraOption.pitch = 0;
            mapManager.pitchTo(0);
        }
        mapManager.moveTo(cmapCoord);
    }

    private navClose = () => {
        nativeGPS.close(() => {
            // driftCorrection.close();
            this.clear();
        });
        voiceManager.clear();
    }

    private clear = () => {
        Navigation.naving = false;
        this._cameraOption = { fixed: false };
        this.locationNodeDeviate = false;
        this.navPoints = {};
        // LocationButtonState.active = false;
        // clearNavInfoState();
        // crossImageTip.quit();
        if (this._navLine) this._navLine.clear();
        if (!!this._onClose.length) {
            this._onClose.forEach(i => i());
        }
    }
}

export const navigation = new Navigation();
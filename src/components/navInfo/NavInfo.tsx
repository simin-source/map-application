import { defineComponent, reactive, watch } from "vue";
import { CarState } from '@/components/carBox/CarBox';
import { planState } from '../planBox/PlanBox';
import {
    navInfo_box, nav_img, nav_meter, car_nav, store_nav, select_start, layer,
    car_remain, cur_floor, exit, remain_meter
} from './NavInfo.module.scss';

import transformUrl from '@/assets/img/transform.png';
import { PointType } from "@/types";
import { mapManager } from "@/map/MapManager";
import { NavLine } from "@/components/navLine/NavLine";
import { nativeGPS } from "@/components/nativeGPS/NativeGPS";
import { nativeNavigation } from "@/components/nativeNavigation/NativeNavigation";
import { voiceManager } from "@/components/voice/Voice";
import { navigationEnd } from "@/components/navigationEnd/NavigationEnd";
import { StoreState } from "@/components/storeBox/StoreBox";
import { MapObject } from "@/map/Map";
import { Centmap } from "@/native/Centmap";
import Icon from "@/components/icon/Icon";
import { compassState } from "../control/compass/Compass";
import { zoomState } from "../control/zoom/Zoom";
import { FloorState } from "../control/floor/Floor";
import { SearchState } from "../search/search";
import { RightBoxState } from "../rightSet/RightSet";
import { SelfInputState } from "../selfInput/SelfInput";

export const navInfoState: {
    onNav?: () => void;
    onExit?: () => void;
    onClose?: (bearing?: number) => void;
    runMock?: () => void;
    curPathInfo?: {
        icon: string;
        description: string;
    }; //导航提示信息
    isMock?: boolean; //是否模拟导航
    pathDistance: number;
    pathRemainDistance?: number;
    curPathRemainDistance?: number;
    curPathDistance?: number;
    curPathWheelInfo?: string[];
} = reactive({
    isMock: false,
    pathDistance: 0,
});

let naviEnd = false;
let crossLnglat: [number, number] | undefined;
let crossCurrPathEndPoint: [number, number] | undefined;

function clearNavInfoState() {
    // 隐藏清空
    MapObject.endMarker.hide();
    MapObject.startMarker.hide();
    StoreState.currentPoint = {
        location: [0, 0],
        rdFl: 0,
    };
    StoreState.startPoint = {
        location: [0, 0],
        rdFl: 0,
    };
    StoreState.endPoint = {
        location: [0, 0],
        rdFl: 0,
    };
    navInfoState.curPathInfo = undefined;
    navInfoState.isMock = navInfoState.pathRemainDistance = navInfoState.curPathRemainDistance = navInfoState.curPathDistance = navInfoState.curPathWheelInfo = undefined;
    navInfoState.pathDistance = 0;
    navInfoState.onExit = navInfoState.onNav = navInfoState.onClose = navInfoState.runMock = undefined;
}


export const NavigationInfoBox = defineComponent({
    name: 'NavInfo',
    data() {
        return {
            isTranslate: false,
        }
    },
    mounted() {
        watch(() => navInfoState.pathRemainDistance, pathRemainDistance => {
            // 监听导航信息变化
            if (typeof pathRemainDistance === 'number') {
                this.voiceMoment(pathRemainDistance);
            }
        });
    },
    methods: {
        close(bearing?: number) {
            if (navInfoState.onClose) navInfoState.onClose(bearing);
        },
        voiceMoment(remain_distance: number) {
            const { curPathDistance, curPathWheelInfo } = navInfoState;
            if (remain_distance <= (navInfoState.isMock ? 2 : 5)) {
                console.log('导航结束');
                if (naviEnd) return;
                naviEnd = true;
                navInfoState.curPathInfo = {
                    icon: 'arrive',
                    description: '您的车位就在附近',
                };
                if (navigation.navDestination && !navInfoState.isMock) {
                    const pNumStr = `${navigation.navDestination.resource.number}`;
                    Centmap.navEnd(pNumStr);
                }
                navigationEnd.show('目的地');
                CarState.carNav = false;
                StoreState.storeNav = false;
                navigationEnd.onConfirm(() => {
                    navigationEnd.hide();
                    naviEnd = false;
                });
                this.close();
                if (navigation.targetParkingNum) sessionStorage.setItem('curParkingNum', navigation.targetParkingNum);
            } else {
                // console.log('导航播放开始');
                // this.initCurPathInfo(curPathWheelInfo ? curPathWheelInfo.toString() : '');
                // 处理语音播报内容
                // let voiceText = navInfoState.curPathInfo ? `${navInfoState.curPathInfo.description}${curPathDistance}米` : '';
                // voiceManager.play(voiceText.replace('行', '形'));
            }
        },
        initCurPathInfo(keyword?: string) {
            if (!keyword) {
                navInfoState.curPathInfo = {
                    icon: 'straight',
                    description: '沿着当前道路前行',
                };
                return;
            }
            switch (true) {
                case keyword.includes('右前'):
                    navInfoState.curPathInfo = {
                        icon: 'right-front',
                        description: '前方右转',
                    };
                    break;
                case keyword.includes('右后'):
                    navInfoState.curPathInfo = {
                        icon: 'right-rear',
                        description: '前方右转',
                    };
                    break;
                case keyword.includes('右'):
                    navInfoState.curPathInfo = {
                        icon: 'Turn-right',
                        description: '前方右转',
                    };
                    break;
                case keyword.includes('左前'):
                    navInfoState.curPathInfo = {
                        icon: 'left-front',
                        description: '前方左转',
                    };
                    break;
                case keyword.includes('左后'):
                    navInfoState.curPathInfo = {
                        icon: 'left-rear',
                        description: '前方左转',
                    };
                    break;
                case keyword.includes('左'):
                    navInfoState.curPathInfo = {
                        icon: 'Turn-left',
                        description: '前方左转',
                    };
                    break;
                case keyword.includes('上楼'):
                    navInfoState.curPathInfo = {
                        icon: 'upstairs',
                        description: keyword,
                    };
                    break;
                case keyword.includes('下楼'):
                    navInfoState.curPathInfo = {
                        icon: 'downstairs',
                        description: keyword,
                    };
                    break;
                case keyword.includes('通过门'):
                    navInfoState.curPathInfo = {
                        icon: 'door',
                        description: keyword,
                    };
                    break;
                case keyword.includes('调头'):
                    navInfoState.curPathInfo = {
                        icon: 'Turn-around',
                        description: keyword,
                    };
                    break;
                default:
                    // keyword.includes('直行'):
                    navInfoState.curPathInfo = {
                        icon: 'straight',
                        description: '沿着当前道路前行',
                    };
                    break;
            }
        },
    },
    render() {
        const { pathRemainDistance, curPathRemainDistance, curPathInfo } = navInfoState;
        return <div class={navInfo_box} style={{ display: `${CarState.carNav || StoreState.storeNav ? 'flex' : 'none'}` }}>
            <div class={store_nav} style={{ display: `${StoreState.storeNav ? 'flex' : 'none'}` }}>
                <div class={select_start}>
                    <div style={{ flexDirection: `${this.isTranslate ? 'column-reverse' : 'column'}` }}>
                        <div>
                            <p style={{ background: '#5880d0' }}></p>
                            <input
                                type="text"
                                value={StoreState.startPoint?.name}
                                placeholder="我的位置"
                                onClick={() => {
                                    SearchState.isShowSort = true;
                                    SearchState.isShowSearch = true;
                                    SelfInputState.isShow = true;
                                    SearchState.showCloseBtn = true;
                                }}
                            />
                        </div>
                        <div style={{ width: '100%', height: '1px', backgroundColor: '#BBBBBB', padding: '0' }}></div>
                        <div>
                            <p style={{ background: '#D05858' }}></p>
                            <input type="text" value={StoreState.endPoint?.name} readonly />
                        </div>
                    </div>
                    <div style={{ marginLeft: '10px' }} onClick={() => { this.isTranslate = !this.isTranslate; }}>
                        <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                    </div>
                </div>
                <div>请输入或点击地图选择起点</div>
            </div>
            <div class={layer} style={{ display: `${CarState.carNav ? 'flex' : 'none'}` }}>
                <div class={car_nav}>
                    <div class={nav_img}>
                        <Icon type={curPathInfo ? curPathInfo.icon : 'Turn-right'} color="#7D7562" size={62} />
                    </div>
                    <div class={nav_meter}>
                        <div>{curPathInfo?.description}</div>
                        <div>{curPathRemainDistance}米</div>
                    </div>
                </div>
                <div class={car_remain}>
                    <div class={cur_floor}>当前楼层: L3</div>
                    <div>
                        <div class={exit} onClick={() => {
                            if (navInfoState.onClose) navInfoState.onClose();
                            CarState.carNav = false;
                            // 控件显示，注意楼层控件需要在指定图层才能显示
                            MapObject.showRightSet = true;
                            SearchState.isShowSearch = true;
                            compassState.isShow = true;
                            zoomState.isShow = true;
                            MapObject.isCarBtn = true;
                            if (SearchState.centmap) {
                                const zoom = SearchState.centmap.getZoom() as number;
                                if (zoom > 0.346) {
                                    FloorState.isShow = true;
                                }
                            }
                            // 隐藏清空
                            clearNavInfoState();
                        }}>
                            退出
                        </div>
                        <div class={remain_meter}>
                            <div>目的地: 停车场</div>
                            <div>剩余{pathRemainDistance}米</div>
                        </div>
                    </div>
                </div>
            </div>
        </div >;
    },
});

export class Navigation {
    static naving = false;

    targetParkingNum?: string;
    currentPositionInfo?: {
        location: [number, number];
        rdFl: number;
    };

    constructor() {
        mapManager.onReady(centmap => {
            this._centmap = centmap;
            const line = this._navLine = new NavLine(centmap);

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
        window.cmap_judgeCoord = (lat: number, lng: number) => {
            if (!this._centmap || !lat || !lng) return;
            const cmapCoord = this._centmap.wgs84ToCmapCoord(lng, lat);
            const contains = this._centmap.contains(cmapCoord[0], cmapCoord[1]);
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

    destination(point: PointType, mock: boolean) {
        const { _centmap } = this;
        if (!_centmap) return;
        const destination = _centmap.cmapCoordToWGS84(...point.location);
        this.navPoints.end = point;
        if (mock) {
            console.log('模拟导航');
            navInfoState.isMock = true;
            // 模拟导航
            navInfoState.onExit = (bearing?: number) => {
                this.clear();
                navInfoState.isMock = navInfoState.runMock = undefined;
            };
        } else {
            // GPS导航
            console.log('实时导航');
            // if (newDestination()) return; // CarBox的newDestination方法推荐附近车位
            // this.planningRoad();
            // if (navInfoState.pathDistance > 50) {
            //     const text = '开始车位导航，请减速慢行';
            //     voiceManager.play(text, true);
            // }
            // 申请获取本地位置，设置起点
            nativeGPS.start().onPosition('once', async gps => {
                const cmapCoord = _centmap.wgs84ToCmapCoord(...gps);
                console.log(cmapCoord);

                // if (!_centmap.contains(cmapCoord[0], cmapCoord[1])) {
                //     nativeNavigation.setDestination(destination).unNav(async ([lng, lat, rdFl]: [number, number, number]) => {
                //         // GPS获取开始点
                //         this.currentPositionInfo = {
                //             location: _centmap.wgs84ToCmapCoord(lng, lat),
                //             rdFl,
                //         };
                //         if (newDestination()) return;
                //         this.navPoints.start = {
                //             location: _centmap.wgs84ToCmapCoord(lng, lat),
                //             rdFl,
                //             height: 0,
                //         };
                //         await this.planningRoad();
                //         if (navInfoState.pathDistance > 50) {
                //             const text = '开始车位导航，请减速慢行';
                //             voiceManager.play(text, true);
                //         }
                //         this.startEverGPS();
                //     }).onDestroy(() => {
                //         this.navClose();
                //         this.clear();
                //         voiceManager.clear();
                //     });
                // }else {
                //     const rdFl = _centmap.getGroundLastRdFl();
                //     this.navPoints.start = {
                //         location: cmapCoord,
                //         rdFl,
                //         height: 0,
                //     };
                //     await this.planningRoad();
                //     navInfoState.onNav = () => {
                //         if (navInfoState.pathDistance > 50) {
                //             voiceManager.play('开始寻车导航', true);
                //         }
                //         this.startEverGPS();
                //     };
                // }
                // navInfoState.onExit = () => {
                //     this.clear();
                // };
                // navInfoState.onClose = (bearing?: number) => {
                //     this.navClose();
                // };
            });
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
            const [lng, lat, distance, rdFl] = point as [number, number, number, number];
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
        // 规划路线,选择路线
        // RightBoxState.StoreRouteType
        const pathInfo = await this.planningRoad();
        if (!pathInfo) return;
        navigationEnd.getEndPoint(end.location);
        navInfoState.runMock = this.runMockNav;
    }

    private runMockNav = (text?: string) => {
        const { _navLine, _centmap } = this;
        if (!_navLine || !_centmap) return;
        Navigation.naving = true;
        // if (navInfoState.pathDistance > 50) {
        //     // 语音播报开始导航
        //     voiceManager.play(text ? text : '开始车位导航，请减速慢行', false);
        // }
        console.log('开始导航');
        // 隐藏起点选择框和优化推荐框
        planState.isPlan = false;
        StoreState.storeNav = false;
        StoreState.isStoreBox = false;
        CarState.isCarStart = false;
        planState.carNav = false;
        CarState.carNav = true; //显示实时导航弹框
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
            this.clear();
        });
        voiceManager.clear();
    }

    private clear = () => {
        Navigation.naving = false;
        this._cameraOption = { fixed: false };
        this.locationNodeDeviate = false;
        this.navPoints = {};
        clearNavInfoState();
        if (this._navLine) this._navLine.clear();
        if (!!this._onClose.length) {
            this._onClose.forEach(i => i());
        }
    }
}

export const navigation = new Navigation();
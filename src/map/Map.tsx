import { defineComponent, reactive } from 'vue';

import { dataURL, mapID } from '@/App';
import ConfirmStart from '@/components/confirmPoint/ConfirmPoint';
import Control from '@/components/control/Index';
import Compass, { compassState } from '@/components/control/compass/Compass';
import Floor, { FloorState } from '@/components/control/floor/Floor';
import Zoom, { zoomState } from '@/components/control/zoom/Zoom';
import { Loading } from '@/components/loading/Loading';
import { MiniBox } from '@/components/miniBox/MiniBox';
import Search, { SearchState } from '@/components/search/search';
import StoreBox, { StoreState } from '@/components/storeBox/StoreBox';
import RightSet, { RightBoxState } from '@/components/rightSet/RightSet';
import toCarImgUrl from '@/assets/img/toCar.png';
import rightSetUrl from '@/assets/img/rightSet.png';
import { mapManager } from './MapManager';

import CarBox, { CarState } from '@/components/carBox/CarBox';
import { navigation, NavigationInfoBox, navInfoState } from '@/components/navInfo/NavInfo';
import { PointMark } from '@/components/pointMark/PointMark';
import PlanBox from '@/components/planBox/PlanBox';
import {
    car_button, container, map_container, right_set
} from './Map.module.scss';
import { navigationEnd } from '@/components/navigationEnd/NavigationEnd';
import SortBox, { SortBoxState } from '@/components/sortBox/SortBox';
import Stereoscopic from '@/components/control/stereoscopic/Stereoscopic';

export const MapControlSpace: {
    T?: number;
    B?: number;
} = reactive({
    T: 0,
    B: 0,
});

export const MapObject: {
    backIndex?: () => void;
    hideIndex?: () => void;
    updateStart?: () => void;
    updateEnd?: () => void;
    Cmap: any;
    currentInfoBox: any;
    startMarker: any;
    endMarker: any;
    previewMarker: any;
    isCarBtn: boolean;
    showRightSet: boolean;
    currentRdfl: number;
} = reactive({
    Cmap: {},
    currentInfoBox: {},
    startMarker: {},
    endMarker: {},
    previewMarker: {},
    isCarBtn: false,
    showRightSet: true,
    currentRdfl: 2, //默认是L1层,值为2
});

export default defineComponent({
    name: 'Map',
    render() {
        const { T, B } = MapControlSpace;
        return <div id={container} style={{ background: '#ddd' }}>
            <div id={map_container} />
            <Control.BOX>
                <Control.LT space={T}>
                    <Compass />
                </Control.LT>
                <Control.RB space={B}>
                    <Zoom />
                    <Stereoscopic/>
                </Control.RB>
                <Control.LB space={B}>
                    <Floor />
                </Control.LB>
            </Control.BOX>
            <Search />
            <StoreBox />
            <CarBox />
            <ConfirmStart />
            <NavigationInfoBox />
            <PlanBox />
            <navigationEnd.infoBox />
            <RightSet />
            <SortBox />
            <div
                class={right_set}
                style={{ display: `${MapObject.showRightSet ? 'flex' : 'none'}` }}
                onClick={() => { RightBoxState.isShow = true; }}
            >
                <img src={rightSetUrl} alt="图片找不到" />
            </div>
            <div
                class={`flex-center ${car_button}`}
                style={{ display: `${MapObject.isCarBtn ? 'flex' : 'none'}` }}
                onClick={() => {
                    SearchState.isShowSort = false;
                    SearchState.isShowSearch = false;
                    MapObject.hideIndex?.();
                    if (MapObject.Cmap?.markerManager.has('preview')) {
                        MapObject.Cmap?.markerManager.hide('preview');
                    }
                    CarState.isCarBrand = true;
                }}
            >
                <img src={toCarImgUrl} alt="图片找不到" />
            </div>
        </div >;
    },
    mounted() {
        // @ts-ignore
        window.cmapload = map => {
            // 初始化
            const Cmap = map.init(map_container, {
                mapSource: `${dataURL}${mapID}`,
                defaultControl: false,
                mockNavigation: false,
                angle: 90,
                zoom: 0.25,
            });
            mapManager.init(Cmap);
            MapObject.Cmap = Cmap;
            console.log(Cmap);

            Cmap.on('complete', (res: { info: string }) => {
                Loading.hide();
            });

            Cmap.on('zoom', (res: { info: string }) => {
                const zoom = MapObject.Cmap.getZoom() as number;
                if (zoom > 0.346) {
                    FloorState.isShow = true;
                    MapObject.isCarBtn = true;
                } else {
                    FloorState.isShow = false;
                    MapObject.isCarBtn = false;
                }
            });

            // 添加地图节点对象
            MapObject.endMarker = new PointMark('target');
            MapObject.startMarker = new PointMark('current', 'start');
            MapObject.currentInfoBox = new MiniBox('currentBrand');
            MapObject.previewMarker = new PointMark('preview', 'preview');

            Cmap.on('click', ({ info }: { info: any }) => {
                console.log(info);
                const { lnglat, cat_id, center, fl_name, rdFl = 0, index, seqId, name } = info;
                if (!cat_id || [400000].includes(cat_id)) return; // 不可点击的数据
                const [lng, lat, height] = [500000, 122005002].includes(cat_id) ? lnglat : center;
                const markData = {
                    location: [lng, lat] as [number, number],
                    height: height ? height : 0.9,
                    rdFl,
                    fl_name,
                    name,
                };
                navInfoState.rdfl = rdFl;
                StoreState.currentPoint = markData;
                // console.log('判断这个点是否存在');
                // console.log(Cmap.contains(markData.location[0], markData.location[1])); //导致mockStartPoint采用高德
                MapObject.previewMarker.show(markData);
                MapObject.currentInfoBox.show(markData);
                if (SortBoxState.pointList.length > 0) {
                    SortBoxState.pointList?.map((item, index) => {
                        if (MapObject.Cmap?.markerManager.has(`id${index}`)) {
                            MapObject.Cmap?.markerManager.remove(`id${index}`);
                        }
                    });
                }
                if (navigation.isMock) {
                    StoreState.isStoreBox = false;
                } else if (!StoreState.startPoint.rdFl) {
                    // 画线条件：需要先确认终点，再确认起点
                    // 当起点确认终点未确认时，通过设置终点按钮重新画线
                    StoreState.isStoreBox = true;
                    StoreState.endPoint = markData;
                    // 测试数据
                    // StoreState.endPoint = {
                    //     location: [12.657302856445312, 34.99754333496094],
                    //     height: 0.9,
                    //     rdFl: 1,
                    //     fl_name: "L2",
                    //     name: 'prada',
                    // };
                }

                // 判断是否有高亮
                if (Cmap.shader.has(fl_name, seqId, cat_id, index)) {
                    Cmap.shader.remove(fl_name, seqId, cat_id, index);
                } else {
                    Cmap.shader.clear();
                    Cmap.shader.adorn(fl_name, seqId, cat_id, index, '#999382');
                }
            });
        };
        import('@/assets/main.dart.js');
        MapObject.backIndex = () => {
            // 显示的组件
            SearchState.isShowSort = false;
            SearchState.isShowSearch = true;
            MapObject.showRightSet = true;
            MapObject.isCarBtn = true;
            compassState.isShow = true;
            zoomState.isShow = true;
            const zoom = MapObject.Cmap.getZoom() as number;
            if (zoom > 0.346) {
                FloorState.isShow = true;
            }
        };
        MapObject.hideIndex = () => {
            // 隐藏的组件
            MapObject.showRightSet = false;
            MapObject.isCarBtn = false;
            compassState.isShow = false;
            zoomState.isShow = false;
            FloorState.isShow = false;
            // 当重新搜索时隐藏上次导航的起点终点                  
            if (MapObject.Cmap?.markerManager.has('current') && MapObject.Cmap?.markerManager.has('target')) {
                MapObject.Cmap?.markerManager.hide('current');
                MapObject.Cmap?.markerManager.hide('target');
            }
            // 隐藏点的信息框
            MapObject.currentInfoBox.hide();
            StoreState.isStoreBox = false;
        };
        MapObject.updateStart = () => {
            // 更新起点
            MapObject.previewMarker.hide();
            if (MapObject.currentRdfl !== StoreState.startPoint.rdFl) {
                MapObject.Cmap?.switchFloor(1, StoreState.startPoint.rdFl);
            }
            mapManager.moveTo(StoreState.startPoint.location);
            navigation.mockStartPoint = StoreState.startPoint;
            MapObject.startMarker.show(StoreState.startPoint);
            MapObject.currentInfoBox.hide();
            StoreState.isStoreBox = false;
        };
        MapObject.updateEnd = () => {
            // 更新终点
            MapObject.previewMarker.hide();
            if (MapObject.currentRdfl !== StoreState.endPoint.rdFl) {
                MapObject.Cmap?.switchFloor(1, StoreState.endPoint.rdFl);
            }
            mapManager.moveTo(StoreState.endPoint.location);
            navigation.destination(StoreState.endPoint, true);
            MapObject.endMarker.show(StoreState.endPoint);
        };
        // @ts-ignore
        // window.wx.miniProgram.getEnv((res: any) => {
        //     console.log(res)
        //     console.log(res.miniprogram)
        // })
    },
});
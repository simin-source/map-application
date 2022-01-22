import { defineComponent, reactive } from 'vue';

import { dataURL, mapID } from '@/App';
import ConfirmStart from '@/components/confirmStart/ConfirmStart';
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
import { navigation, NavigationInfoBox } from '@/components/navInfo/NavInfo';
import { PointMark } from '@/components/pointMark/PointMark';
import PlanBox from '@/components/planBox/PlanBox';
import {
    car_button, container, map_container, right_set
} from './Map.module.scss';
import { navigationEnd } from '@/components/navigationEnd/NavigationEnd';

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
    Cmap: any;
    currentInfoBox: any;
    startMarker: any;
    endMarker: any;
    previewMarker: any;
    isCarBtn: boolean;
    showRightSet: boolean;
} = reactive({
    Cmap: {},
    currentInfoBox: {},
    startMarker: {},
    endMarker: {},
    previewMarker: {},
    isCarBtn: false,
    showRightSet: true,
});

export default defineComponent({
    name: 'Map',
    render() {
        const { T, B } = MapControlSpace;
        return <div id={container}>
            <div id={map_container} />
            <Control.BOX>
                <Control.LT space={T}>
                    <Compass />
                </Control.LT>
                <Control.RB space={B}>
                    <Zoom />
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
                angle: -180,
                zoom: 0.25,
            });
            mapManager.init(Cmap);
            MapObject.Cmap = Cmap;
            console.log(Cmap);

            Cmap.on('complete', (res: { info: string }) => {
                Loading.hide();
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
                StoreState.currentPoint = markData;
                MapObject.previewMarker.show(markData);
                MapObject.currentInfoBox.show(markData, info);
                if (navigation.isMock) {
                    // 确认起点
                    CarState.confirmStart = true;
                    StoreState.startPoint = markData;
                } else {
                    StoreState.endPoint = markData;
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
            if (SearchState.centmap) {
                const zoom = SearchState.centmap.getZoom() as number;
                if (zoom > 0.346) {
                    FloorState.isShow = true;
                }
            }
        };
        MapObject.hideIndex = () => {
            // 隐藏的组件
            MapObject.showRightSet = false;
            MapObject.isCarBtn = false;
            compassState.isShow = false;
            zoomState.isShow = false;
            FloorState.isShow = false;
            // 隐藏点的信息框
            MapObject.currentInfoBox.hide();
            StoreState.isStoreBox = false;
        };
        // @ts-ignore
        // window.wx.miniProgram.getEnv((res: any) => {
        //     console.log(res)
        //     console.log(res.miniprogram)
        // })
    },
});
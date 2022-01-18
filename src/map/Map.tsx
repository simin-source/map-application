import { defineComponent, reactive } from 'vue';

import { dataURL, mapID } from '@/App';
import Control from '@/components/control/Index';
import Compass, { compassState } from '@/components/control/compass/Compass';
import Floor, { FloorState } from '@/components/control/floor/Floor';
import Stereoscopic, { StereoscopicState } from '@/components/control/stereoscopic/Stereoscopic';
import Zoom, { zoomState } from '@/components/control/zoom/Zoom';
import { MiniBox } from '@/components/miniBox/MiniBox';
import { Loading } from '@/components/loading/Loading';
import Search, { SearchState } from '@/components/search/search';
import StoreBox, { StoreState } from '@/components/storeBox/StoreBox';
import FloorBox, { FloorBoxState } from '@/components/floorBox/FloorBox';
import ConfirmStart from '@/components/confirmStart/ConfirmStart';

import { mapManager } from './MapManager';
import carImg from '@/assets/img/car.png';
import arrowLeftUrl from '@/assets/img/arrow_left.png';

import {
    container, map_container, car_button, back, audio
} from './Map.module.scss';
import CarBox, { CarState } from '@/components/carBox/CarBox';
import { navigation, NavigationInfoBox } from '@/components/navInfo/NavInfo';
import PlanBox, { planState } from '@/components/routePlanBox/PlanBox';
import { PointMark } from '@/components/pointMark/PointMark';

export const MapControlSpace: {
    T?: number;
    B?: number;
} = reactive({
    T: 0,
    B: 0,
});

interface PoiInfoType {
    bd_name: string;
    fl_name: string | null;
    number: string;
    name: string;
    center: [number, number, number];
    seq_id: number;
    fl_id: number;
    index: number;
    rd_fl: number;
}

export const MapObject: {
    Cmap: any;
    currentMark: any;
    isCarBtn: boolean;
    isBackIndex: boolean;
} = reactive({
    Cmap: {},
    currentMark: {},
    isCarBtn: true,
    isBackIndex: false,
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
                    <Stereoscopic />
                </Control.RB>
                <Control.LB space={B}>
                    <Floor />
                </Control.LB>
            </Control.BOX>
            <Search />
            <StoreBox />
            <FloorBox />
            <CarBox />
            <ConfirmStart />
            <NavigationInfoBox />
            <PlanBox />
            <div class={back} style={{ display: `${MapObject.isBackIndex ? 'block' : 'none'}` }}>
                <img src={arrowLeftUrl} alt="图片找不到" onClick={() => {
                    SearchState.isShowSearch = true;
                    // 隐藏poi弹框,建筑弹框
                    MapObject.currentMark.hide();
                    StoreState.isStoreBox = false;
                    // 控件显示，注意楼层控件需要在指定图层才能显示
                    compassState.isShow = true;
                    zoomState.isShow = true;
                    StereoscopicState.isShow = true;
                    MapObject.isCarBtn = true;
                    if (SearchState.centmap) {
                        const zoom = SearchState.centmap.getZoom() as number;
                        if (zoom > 0.346) {
                            FloorState.isShow = true;
                            FloorBoxState.isShow = true;
                            FloorBoxState.isSearchRes = false;
                            FloorBoxState.FloorBoxTitle = 'F1 | 广州太古汇';
                        }
                    }
                    MapObject.isBackIndex = false;
                    // 隐藏路径规划页
                    planState.isPlan = false;
                    planState.isRouteInfo = false;
                }} />
            </div>
            <div
                class={car_button}
                style={{ display: `${MapObject.isCarBtn ? 'flex' : 'none'}` }}
                onClick={() => {
                    // 控件都隐藏
                    compassState.isShow = false;
                    FloorState.isShow = false;
                    zoomState.isShow = false;
                    StereoscopicState.isShow = false;
                    MapObject.isCarBtn = false;
                    SearchState.isShowSearch = false;
                    CarState.isCarBrand = true;
                }}
            >
                <img src={carImg} alt='图片找不到' />
            </div>
            {/* <div class={audio}>
                <audio src="audioSrc" muted autoplay onCanplay={() => { }} onEnded={() => { }} ></audio>
            </div> */}
        </div >;
    },
    mounted() {
        // @ts-ignore
        window.cmapload = map => {
            const Cmap = map.init(map_container, {
                mapSource: `${dataURL}${mapID}`,
                defaultControl: false,
                mockNavigation: false,
                angle: -180,
                zoom: 0.25,
            });
            MapObject.Cmap = Cmap;
            console.log(Cmap);

            Cmap.on('complete', (res: { info: string }) => {
                Loading.hide();
            });
            mapManager.init(Cmap);
            const destinationMarker = new PointMark('target');
            const currentMarker = new PointMark('current', 'start');
            MapObject.currentMark = new MiniBox('currentBrand');
            Cmap.on('click', ({ info }: { info: any }) => {
                console.log(info);
                const { lnglat, cat_id, center, fl_name, rdFl = 0, index, seqId, name } = info;
                if (!cat_id || [400000].includes(cat_id)) return;
                // if (
                //     !cat_id || ![500000, 124001001, 124002001, 124014001, 124004001, 124003001].includes(cat_id)
                // ) return;
                const [lng, lat, height] = [500000, 122005002].includes(cat_id) ? lnglat : center;
                const markData = {
                    location: [lng, lat] as [number, number],
                    height: height ? height : 0.9,
                    rdFl,
                    fl_name,
                    name,
                };
                if (navigation.isMock) {
                    StoreState.currentPoint = markData;
                    navigation.mockStartPoint = markData;
                    currentMarker.show(markData);
                } else {
                    MapObject.currentMark.show(markData, info);
                    navigation.destination(markData, true);
                    destinationMarker.show(markData);
                }

                // if (![200000, 122005002, 109014001].includes(cat_id)) {
                //     MapObject.currentMark.show(markData, info);
                // } else {
                //     MapObject.currentMark.hide();
                //     if (cat_id === 109014001 && typeof rdFl === 'number') {
                //         // 停车位
                //         const [lng, lat, height] = center;
                //         const markData = {
                //             location: [lng, lat] as [number, number],
                //             height,
                //             rdFl,
                //             resource: info,
                //         };

                //         // 控件都隐藏
                //         compassState.isShow = false;
                //         FloorState.isShow = false;
                //         zoomState.isShow = false;
                //         StereoscopicState.isShow = false;
                //         MapObject.isCarBtn = false;
                //         FloorBoxState.isShow = false;

                //         const floor = Cmap.getFloorInfo(seqId);//floor.isPark判断是否园区，floor.list所在楼层
                //     }
                // }

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
    }
});
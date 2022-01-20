import { defineComponent, reactive } from 'vue';
import {
    button_group, store_box, close, detail, store_info, store_title
} from './StoreBox.module.scss';

import testImg from '@/assets/img/uniqlo.png';
import { planState } from '../planBox/PlanBox';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import { navigation } from '@/components/navInfo/NavInfo';
import { PointType } from '@/types';
import { compassState } from '../control/compass/Compass';
import { FloorState } from '../control/floor/Floor';
import { zoomState } from '../control/zoom/Zoom';

export const StoreState: {
    isStoreBox: Boolean;
    currentPoint: PointType;
    startPoint: PointType;
    endPoint: PointType;
} = reactive({
    isStoreBox: false,
    currentPoint: {
        location: [0, 0],
        rdFl: 0,
    },
    startPoint: {
        location: [0, 0],
        rdFl: 0,
    },
    endPoint: {
        location: [0, 0],
        rdFl: 0,
    }
});

export default defineComponent({
    name: 'StoreBox',
    data() {
        return {
        }
    },
    methods: {
        confirm(mock: boolean) {
            if (!navigation.isMock) {
                MapObject.previewMarker.hide();
                navigation.destination(StoreState.endPoint, mock);
                MapObject.endMarker.show(StoreState.endPoint);
            }
        }
    },
    render() {
        return <div class={store_box} style={{ display: `${StoreState.isStoreBox ? 'flex' : 'none'}` }}>
            <div class={store_info}>
                <div>
                    <img src={testImg} alt='图片找不到' />
                </div>
                <div class={detail}>
                    <div class={store_title}>{StoreState.currentPoint?.name}</div>
                    <div>
                        <div>男装/女装   WU</div>
                        <div>10：00-22：00</div>
                    </div>
                </div>
            </div>
            <div class={button_group}>
                <div onClick={() => {
                    compassState.isShow = false;
                    zoomState.isShow = false;
                    FloorState.isShow = false;
                    MapObject.isCarBtn = false;
                    StoreState.isStoreBox = false;
                    SearchState.isShowSearch = false;
                    MapObject.showRightSet = false;
                    MapObject.currentInfoBox.hide();
                    planState.isPlan = true;
                    planState.isRouteInfo = true;
                    this.confirm(true);
                }}>
                    路线规划
                </div>
                <div onClick={() => { this.confirm(false) }}>开始导航</div>
            </div>
            <div class={close} onClick={() => { StoreState.isStoreBox = false; }}>×</div>
        </div>;
    },
});
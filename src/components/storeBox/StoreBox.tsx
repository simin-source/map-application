import { defineComponent, reactive } from 'vue';
import {
    button_group, store_box, close, detail, store_info, store_title
} from './StoreBox.module.scss';

import testImg from '@/assets/img/uniqlo.png';
import { planState } from '../routePlanBox/PlanBox';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import { navigation } from '@/components/navInfo/NavInfo';
import { PointType } from '@/types';

export const StoreState: {
    isStoreBox: Boolean;
    currentPoint: PointType;
} = reactive({
    isStoreBox: false,
    currentPoint: {
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
            if (StoreState.currentPoint) navigation.destination(StoreState.currentPoint, mock);
        }
    },
    render() {
        return <div class={store_box} style={{ display: `${StoreState.isStoreBox ? 'flex' : 'none'}` }}>
            <div class={store_info}>
                <div>
                    <img src={testImg} alt='图片找不到' />
                </div>
                <div class={detail}>
                    <div class={store_title}>优衣库</div>
                    <div>
                        <div>男装/女装   WU</div>
                        <div style={{ color: '#FF8218' }}>10：00-22：00</div>
                    </div>
                </div>
            </div>
            <div class={button_group}>
                <div onClick={() => {
                    StoreState.isStoreBox = false;
                    SearchState.isShowSearch = false;
                    MapObject.currentMark.hide();
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
import { defineComponent, reactive } from 'vue';
import {
    button_group, store_box, close, detail, store_info, store_title, floor_info, detail_content
} from './StoreBox.module.scss';

import testImg from '@/assets/img/uniqlo.png';
import { planState } from '../planBox/PlanBox';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import { navigation } from '@/components/navInfo/NavInfo';
import { PointType } from '@/types';
import { SortBoxState } from '../sortBox/SortBox';

export const StoreState: {
    isStoreBox: Boolean;
    storeNav: Boolean;
    currentPoint: PointType;
    startPoint: PointType;
    endPoint: PointType;
} = reactive({
    isStoreBox: false,
    storeNav: false,
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
            show_detail: false,
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
        return <div class={store_box} style={{ display: `${StoreState.isStoreBox ? 'block' : 'none'}` }}>
            <div>
                <div class={store_info}>
                    <div>
                        <img src={testImg} alt='图片找不到' />
                    </div>
                    <div class={detail}>
                        <div class={store_title}>{StoreState.currentPoint?.name}</div>
                        <div class={floor_info}>
                            <div>
                                <div>{StoreState.currentPoint?.fl_name}</div>
                                <div>生活家居</div>
                            </div>
                            <div onClick={() => { this.show_detail = !this.show_detail; }}>
                                <div>▤</div>
                                <div style={{ marginLeft: '10px' }}>查看详情</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class={button_group}>
                    <div onClick={() => {
                        MapObject.hideIndex?.();
                        SearchState.isShowSearch = false;
                        SortBoxState.isShow = false;
                        StoreState.storeNav = true;
                        planState.isPlan = true;
                        this.confirm(true);
                    }}>
                        路线规划
                    </div>
                    <div onClick={() => { this.confirm(false) }}>开始导航</div>
                </div>
            </div>
            <div class={detail_content} style={{ display: `${this.show_detail ? 'block' : 'none'}` }}>
                华润万家从事的是与百姓生活紧密联系的零售行业，坚持“时尚、品质、贴心、新鲜、低价、便利”的经营理念，经营有大卖场、生活超市、便利超市、区域购物中心
            </div>
            <div class={close} onClick={() => { StoreState.isStoreBox = false; }}>×</div>
        </div>;
    },
});
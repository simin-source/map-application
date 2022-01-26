import { defineComponent, reactive } from 'vue';
import {
    self_box, history_title, detail, history_point, store_title, floor_info, history_list, detail_content, end
} from './SelfInput.module.scss';

import meImgUrl from '@/assets/img/me.png';
import likeImgUrl from '@/assets/img/like.png';
import pointImgUrl from '@/assets/img/point.png';
import testImg from '@/assets/img/uniqlo.png';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import arrowLeftUrl from '../../assets/img/arrow_left.png';
import { StoreState } from '../storeBox/StoreBox';
import { navigation } from '../navInfo/NavInfo';

export const SelfInputState: {
    isShow: Boolean;
} = reactive({
    isShow: false,
});

export default defineComponent({
    name: 'SelfInput',
    data() {
        return {
            historyContent: [
                {
                    img: testImg,
                    name: 'GUCCI',
                    fl_name: 'L1',
                    rdFl: 2,
                    type: '生活家居',
                    description: '华润万家从事的是与百姓生活紧密联系的零售行业，坚持时尚、品质、贴心、新鲜、低价、便利”的经营理念，经营有大卖场、生活超市、便利超市、区域购物中心',
                    lnglat: [-18.343624114990234, 31.462371826171875, 0],
                    center: [-17.723400115966797, 32.444557189941406, 0.800000011920929],
                    height: 0.9,
                }, {
                    img: testImg,
                    name: 'GUCCI',
                    fl_name: 'L1',
                    rdFl: 2,
                    type: '生活家居',
                    description: '华润万家从事的是与百姓生活紧密联系的零售行业，坚持时尚、品质、贴心、新鲜、低价、便利”的经营理念，经营有大卖场、生活超市、便利超市、区域购物中心',
                    lnglat: [-18.343624114990234, 31.462371826171875, 0],
                    center: [-17.723400115966797, 32.444557189941406, 0.800000011920929],
                    height: 0.9,
                },
            ],
            show_detail: false,
            currentPoint: -1,
        }
    },
    methods: {
    },
    render() {
        return <div class={self_box} style={{ display: `${SelfInputState.isShow ? 'block' : 'none'}` }}>
            <div>
                <div class={`flex-between ${history_title}`}>
                    <div>搜索历史</div>
                    <div style={{ color: '#6FA3CB' }}
                        onClick={() => {
                            this.historyContent = [];
                        }}
                    >
                        清除记录
                    </div>
                </div>
            </div>
            <div class={history_list}>
                {this.historyContent?.map((item, index) => {
                    return <div onClick={() => {
                        let { lnglat, center, fl_name, rdFl = 0, name } = item;
                        const [lng, lat, height] = center ? center : lnglat;
                        const markData = {
                            location: [lng, lat] as [number, number],
                            height: height ? height : 0.9,
                            rdFl,
                            fl_name,
                            name,
                        };
                        StoreState.currentPoint = markData;
                        if (navigation.isMock) {
                            // 确认起点
                            StoreState.startPoint = markData;
                            MapObject.previewMarker.hide();
                            navigation.mockStartPoint = StoreState.startPoint;
                            MapObject.startMarker.show(StoreState.startPoint);
                        } else {
                            StoreState.endPoint = markData;
                        }
                        SelfInputState.isShow = false;
                    }}>
                        <div class={history_point}>
                            <div>
                                <img src={item.img} alt='图片找不到' />
                            </div>
                            <div class={detail}>
                                <div class={store_title}>{item.name}</div>
                                <div class={floor_info}>
                                    <div>
                                        <div>{item.fl_name}</div>
                                        <div>{item.type}</div>
                                    </div>
                                    <div onClick={() => { this.show_detail = !this.show_detail; this.currentPoint = index; }}>
                                        <div>▤</div>
                                        <div style={{ marginLeft: '10px' }}>查看详情</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class={detail_content} style={{ display: `${this.show_detail && this.currentPoint === index ? 'block' : 'none'}` }}>
                            {item.description}
                        </div>
                    </div>;
                })}
            </div>
            <div class={end}>END</div>
        </div>;
    },
});
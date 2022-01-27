import { defineComponent, reactive } from 'vue';
import {
    self_box, history_title, detail, history_point, store_title, floor_info, history_list, detail_content, end
} from './SelfInput.module.scss';

import testImg from '@/assets/img/uniqlo.png';
import { MapObject } from '@/map/Map';
import { StoreState } from '../storeBox/StoreBox';
import { navigation } from '../navInfo/NavInfo';
import { SearchResType } from '@/types';

export const SelfInputState: {
    isShow: Boolean;
    historyContent: SearchResType[];
} = reactive({
    isShow: false,
    historyContent: [],
});

export default defineComponent({
    name: 'SelfInput',
    data() {
        return {
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
                            SelfInputState.historyContent = [];
                        }}
                    >
                        清除记录
                    </div>
                </div>
            </div>
            <div class={history_list}>
                {SelfInputState.historyContent?.map((item, index) => {
                    return <div onClick={() => {
                        let { center, fl_name, rd_fl, name } = item;
                        const [lng, lat, height] = center;
                        const markData = {
                            location: [lng, lat] as [number, number],
                            height: height ? height : 0.9,
                            rdFl: rd_fl,
                            fl_name,
                            name,
                        };
                        StoreState.currentPoint = markData;
                        if (navigation.isMock) {
                            // 确认起点
                            StoreState.startPoint = markData;
                            console.log('确认历史起点');
                            MapObject.updateStart?.();
                        } else {
                            console.log('确认历史终点');
                            StoreState.endPoint = markData;
                            MapObject.updateEnd?.();
                            MapObject.updateStart?.();//先终点，后起点，最后重新画路线
                        }
                        SelfInputState.isShow = false;
                    }}>
                        <div class={history_point}>
                            <div>
                                <img src={testImg} alt='图片找不到' />
                            </div>
                            <div class={detail}>
                                <div class={store_title}>{item.name}</div>
                                <div class={floor_info}>
                                    <div>
                                        <div>{item.fl_name}</div>
                                        <div>生活家居</div>
                                    </div>
                                    {/* <div onClick={() => { this.show_detail = !this.show_detail; this.currentPoint = index; }}> */}
                                    <div onClick={() => { this.currentPoint = index; }}>
                                        <div>▤</div>
                                        <div style={{ marginLeft: '10px' }}>查看详情</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class={detail_content} style={{ display: `${this.show_detail && this.currentPoint === index ? 'block' : 'none'}` }}>
                            '华润万家从事的是与百姓生活紧密联系的零售行业，坚持时尚、品质、贴心、新鲜、低价、便利”的经营理念，经营有大卖场、生活超市、便利超市、区域购物中心'
                        </div>
                    </div>;
                })}
            </div>
            <div class={end}>END</div>
        </div>;
    },
});
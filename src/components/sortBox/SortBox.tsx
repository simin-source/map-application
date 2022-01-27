import { defineComponent, reactive } from 'vue';
import {
    sort_box, spread_icon, search_res, floor_title, show_store, store_list, store_info, store_title,
    active, close, work_state
} from './SortBox.module.scss';

import spreadIcon from '@/assets/img/up.png';
import imgUrl from '@/assets/img/uniqlo.png';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import arrowLeftUrl from '../../assets/img/arrow_left.png';
import { StoreState } from '../storeBox/StoreBox';
import { mapManager } from '@/map/MapManager';
import { SearchResType } from '@/types';

export const SortBoxState: {
    isShow: Boolean;
    SortBoxTitle: String;
    pointList: SearchResType[];
} = reactive({
    isShow: false,
    SortBoxTitle: '广州太古汇',
    pointList: [],
});

export default defineComponent({
    name: 'SortBox',
    data() {
        return {
            isSpread: false,
        }
    },
    methods: {
        workState(id?: number) {
            switch (id) {
                case 1:
                    return <div class={work_state} style={{ background: 'linear-gradient(91deg, #F5BAA4, #FBA797, #FE9A95)' }}>营业中</div>;
                case 2:
                    return <div class={work_state} style={{ background: '#F2B063' }}>维护中</div>;
                case 3:
                    return <div class={work_state} style={{ background: '#B3B3B3' }}>休息中</div>;
                default:
                    return <div class={work_state} style={{ background: 'linear-gradient(91deg, #F5BAA4, #FBA797, #FE9A95)' }}>营业中</div>;
            }
        },
    },
    render() {
        return <div class={sort_box} style={{ height: `${this.isSpread ? '100%' : '80px'}`, display: `${SortBoxState.isShow ? 'block' : 'none'}` }}>
            <div class={spread_icon}>
                <img
                    src={spreadIcon}
                    alt='图片找不到'
                    style={{ display: `${this.isSpread ? 'none' : 'block'}` }}
                    onClick={() => {
                        this.isSpread = true;
                        SearchState.isShowSearch = false;
                        MapObject.isCarBtn = false;
                    }}
                />
            </div>
            <div
                class={close}
                style={{ display: `${this.isSpread ? 'block' : 'none'}` }}
                onClick={() => {
                    this.isSpread = false;
                    MapObject.isCarBtn = true;
                    SearchState.isShowSearch = true;
                }}
            >
                <img src={arrowLeftUrl} alt='图片找不到' />
            </div>
            <div class={search_res}>
                <div class={floor_title} style={{ height: `${this.isSpread ? '60px' : '80px'}` }}>
                    {SortBoxState.SortBoxTitle}
                </div>
                <div class={store_list}>
                    <div class={show_store}>
                        {SortBoxState.pointList?.map((item, index) => {
                            return <div onClick={() => {
                                console.log('选择指定marker');
                                const { center, fl_name, rd_fl, name, seq_id } = item;
                                const [lng, lat, height] = center;
                                const markData = {
                                    location: [lng, lat] as [number, number],
                                    height: height ? height : 0.9,
                                    rdFl: rd_fl,
                                    fl_name,
                                    name,
                                    seq_id
                                };
                                // 返回首页并打开指定楼层的品牌
                                MapObject.backIndex?.();
                                SearchState.searchValue = name;
                                if (MapObject.currentRdfl !== rd_fl) {
                                    MapObject.Cmap?.switchFloor(seq_id, rd_fl);
                                }
                                mapManager.moveTo([lng, lat]);
                                mapManager.zoomTo(0.4);
                                mapManager.pitchTo(0);
                                if (SortBoxState.pointList.length > 0) {
                                    SortBoxState.pointList?.map((item, index) => {
                                        if (MapObject.Cmap?.markerManager.has(`id${index}`)) {
                                            MapObject.Cmap?.markerManager.remove(`id${index}`);
                                        }
                                    });
                                }
                                StoreState.currentPoint = StoreState.endPoint = markData;
                                MapObject.previewMarker.show(StoreState.currentPoint);
                                MapObject.currentInfoBox.show(StoreState.currentPoint);
                                StoreState.isStoreBox = true;
                                this.isSpread = false;
                            }}>
                                <div>
                                    <img src={imgUrl} alt="图片找不到" />
                                    {/* <div style={{ width: '75px', height: '75px', background: '#bbb' }}></div> */}
                                </div>
                                <div class={store_info}>
                                    <div class={store_title}>{item.name}</div>
                                    {/* {item.sort !== '设施' ?  */}
                                    <div>
                                        <div>业态类型: 女装</div>
                                        <div style={{ marginTop: '7px' }}>营业时间: <span style={{ color: '#FF8218' }}>10:00-22:00</span></div>
                                    </div>
                                    {/* : <div>
                                        <div>{item.type}</div>
                                        <div style={{ marginTop: '7px' }}>使用时间: <span style={{ color: '#FF8218' }}>{item.time}</span></div>
                                    </div>} */}
                                </div>
                                {this.workState()}
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        </div>;
    },
});
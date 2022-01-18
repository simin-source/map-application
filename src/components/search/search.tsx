import { defineComponent, reactive } from 'vue';

import {
    container, sort_list, sort_content, search_box, sort_title, active,
    hot_recommend, recommend_list, icon, sort_item, history_title
} from './Search.module.scss';

import arrowLeftUrl from '../../assets/img/arrow_left.png';
import searchIconUrl from '../../assets/img/search.png';
import { MapObject } from '@/map/Map';
import { StoreState } from '../storeBox/StoreBox';
import { compassState } from '../control/compass/Compass';
import { FloorState } from '../control/floor/Floor';
import { zoomState } from '../control/zoom/Zoom';
import { StereoscopicState } from '../control/stereoscopic/Stereoscopic';
import { mapManager } from '@/map/MapManager';
import { FloorBoxState } from '../floorBox/FloorBox';

export const SearchState: {
    centmap?: { [key: string]: any };
    isShowInput: boolean;
    isShowSearch: boolean;
} = reactive({
    centmap: undefined,
    isShowInput: true,
    isShowSearch: true,
});

export default defineComponent({
    name: 'Search',
    data() {
        return {
            sortContent: false,
            currentStoreType: -1,
            currentFacilityType: -1,
            storeSort: [
                {
                    typeId: 1,
                    storeType: '餐饮'
                }, {
                    typeId: 2,
                    storeType: '女装'
                }, {
                    typeId: 3,
                    storeType: '男装'
                }, {
                    typeId: 4,
                    storeType: '彩妆护肤'
                }, {
                    typeId: 5,
                    storeType: '珠宝首饰'
                }, {
                    typeId: 6,
                    storeType: '休闲娱乐'
                }, {
                    typeId: 7,
                    storeType: '体育户外'
                }, {
                    typeId: 8,
                    storeType: '母婴儿童'
                }
            ],
            facilitySort: [
                {
                    typeId: 1,
                    facilityType: '洗手间'
                }, {
                    typeId: 2,
                    facilityType: '收银台'
                }, {
                    typeId: 3,
                    facilityType: '问询处'
                }, {
                    typeId: 4,
                    facilityType: '服务台'
                }, {
                    typeId: 5,
                    facilityType: '直梯'
                }, {
                    typeId: 6,
                    facilityType: '扶梯'
                }, {
                    typeId: 7,
                    facilityType: '出入口'
                }, {
                    typeId: 8,
                    facilityType: '洗手间'
                }
            ],
            hotRecommendList: [
                { brandName: 'nike' },
                { brandName: 'zara' },
                { brandName: 'converse' },
            ],
            historyList: [
                {
                    typeId: 1,
                    storeType: 'nike'
                }, {
                    typeId: 2,
                    storeType: 'zara'
                },
            ],
            iconUrl: searchIconUrl,
            searchValue: '',
            resMarkInfo: {
                "fl_name": "F1",
                "lnglat": [
                    -3.1314425468444824,
                    32.18565368652344,
                    0
                ],
                "seqId": 2,
                "index": 0,
                "park": false,
                "cat_id": 101004002,
                "bd_name": "银泰百货庆春店",
                "center": [
                    -2.412723,
                    34.88055,
                    3.8601158
                ],
                "fl_num": 1,
                "name": "KFC",
                "number": "",
                "rdFl": null
            },
            test: {
                "location": [
                    -2.412723,
                    34.88055
                ],
                "height": 3.8601158,
                "rdFl": null,
                "fl_name": "F1"
            }
        }
    },
    mounted() {
        this.currentStoreType = -1;
        this.currentFacilityType = -1;
        mapManager.onReady(centmap => {
            SearchState.centmap = centmap;
        });
    },
    methods: {
        handleSearch(e: KeyboardEvent) {
            // if (e.keyCode && e.keyCode === 13) {
            //     console.log('搜索' + e.target?.value);
            //     if (e.target?.value === 'kfc') {
            //         // MapObject.currentMark.show(this.resMarkInfo, this.test);
            //         Building.isStoreBox=true;
            //     }
            // }
        }
    },
    render() {
        return <div id={container}>
            <div class={search_box} style={{ display: `${SearchState.isShowSearch ? 'block' : 'none'}` }}>
                <input
                    type='text'
                    placeholder='请输入搜索内容'
                    value={this.searchValue}
                    onClick={() => {
                        this.sortContent = true;
                        SearchState.isShowInput = true;
                        this.iconUrl = arrowLeftUrl;
                        // 控件都隐藏
                        compassState.isShow = false;
                        FloorState.isShow = false;
                        zoomState.isShow = false;
                        StereoscopicState.isShow = false;
                        MapObject.isCarBtn = false;
                        if (!this.searchValue) FloorBoxState.isShow = false;
                    }}
                    onKeypress={e => this.handleSearch(e)}
                />
                <img class={icon} src={this.iconUrl} alt="图片找不到" onClick={() => {
                    // 选择分类选择和搜索内容清空
                    this.currentStoreType = -1;
                    this.currentFacilityType = -1;
                    this.searchValue = '';
                    // 分类内容弹框隐藏
                    this.sortContent = false;
                    this.iconUrl = searchIconUrl;
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
                }} />
            </div>
            {this.sortContent ? <div class={hot_recommend} style={{ display: `${SearchState.isShowInput ? 'flex' : 'none'}` }}>
                <div>热门推荐 : </div>
                <div class={recommend_list}>
                    {this.hotRecommendList?.map(item => {
                        return <div>{item.brandName}</div>;
                    })}
                </div>
            </div> : null
            }
            {
                this.sortContent ? <div class={sort_content} style={{ display: `${SearchState.isShowInput ? 'block' : 'none'}` }}>
                    <div>
                        <div>
                            <div class={history_title}>
                                <div>历史搜索</div>
                                <div onClick={() => { this.historyList = []; }}>清空</div>
                            </div>
                            <div class={sort_list}>
                                <div style={{ justifyContent: 'flex-start' }}>
                                    {this.historyList?.map((item, index) => {
                                        if (index < 4) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentFacilityType = -1;
                                                        this.currentStoreType = index;
                                                        this.searchValue = item.storeType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;

                                                        if (SearchState.centmap) {
                                                            mapManager.zoomTo(0.4);
                                                            mapManager.pitchTo(0);
                                                            FloorState.isShow = true;
                                                            FloorBoxState.isShow = true;
                                                            FloorBoxState.isSearchRes = true;
                                                            FloorBoxState.FloorBoxTitle = this.searchValue;
                                                        }
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                                <div>
                                    {this.historyList?.map((item, index) => {
                                        if (index > 3) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentFacilityType = -1;
                                                        this.currentStoreType = index;
                                                        this.searchValue = item.storeType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class={sort_title}>服务</div>
                            <div class={sort_list}>
                                <div>
                                    {this.storeSort?.map((item, index) => {
                                        if (index < 4) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentFacilityType = -1;
                                                        this.currentStoreType = index;
                                                        this.searchValue = item.storeType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;

                                                        if (SearchState.centmap) {
                                                            mapManager.zoomTo(0.4);
                                                            mapManager.pitchTo(0);
                                                            FloorState.isShow = true;
                                                            FloorBoxState.isShow = true;
                                                            FloorBoxState.isSearchRes = true;
                                                            FloorBoxState.FloorBoxTitle = this.searchValue;
                                                        }
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                                <div>
                                    {this.storeSort?.map((item, index) => {
                                        if (index > 3) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentFacilityType = -1;
                                                        this.currentStoreType = index;
                                                        this.searchValue = item.storeType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class={sort_title}>设施</div>
                            <div class={sort_list}>
                                <div>
                                    {this.facilitySort?.map((item, index) => {
                                        if (index < 4) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentFacilityType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentStoreType = -1;
                                                        this.currentFacilityType = index;
                                                        this.searchValue = item.facilityType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;
                                                    }}>
                                                    {item.facilityType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                                <div>
                                    {this.facilitySort?.map((item, index) => {
                                        if (index > 3) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentFacilityType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentStoreType = -1;
                                                        this.currentFacilityType = index;
                                                        this.searchValue = item.facilityType;
                                                        console.log('搜索' + this.searchValue);
                                                        this.sortContent = false;
                                                    }}>
                                                    {item.facilityType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : null
            }
        </div >;
    },
});
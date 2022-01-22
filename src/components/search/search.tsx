import { defineComponent, reactive } from 'vue';

import {
    container, sort_list, sort_content, search_box, sort_title, active, search_type, type_active, floor_content,
    hot_recommend, recommend_list, icon, sort_item, history_title, close_search, floor_active
} from './Search.module.scss';

import { MapObject } from '@/map/Map';
import { compassState } from '@/components/control/compass/Compass';
import { FloorState } from '@/components/control/floor/Floor';
import { zoomState } from '@/components/control/zoom/Zoom';
import { mapManager } from '@/map/MapManager';
import FloorBox, { FloorBoxState } from '@/components/floorBox/FloorBox';
import Icon from '@/components/icon/Icon';
import { StoreState } from '../storeBox/StoreBox';
import { PointType } from '@/types';
import SelfInput, { SelfInputState } from '../selfInput/SelfInput';

export const SearchState: {
    centmap?: { [key: string]: any };
    isShowSort: boolean;
    isShowSearch: boolean;
    showCloseBtn: boolean;
} = reactive({
    centmap: undefined,
    isShowSort: false,
    isShowSearch: true,
    showCloseBtn: false,
});

export default defineComponent({
    name: 'Search',
    data() {
        return {
            currentStoreType: -1,
            currentFacilityType: -1,
            floorType: -1,
            floorContentType: -1,
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
                { brandName: 'LOUIS VUITTON' },
                { brandName: 'CHANEL' },
            ],
            historyList: [
                {
                    typeId: 1,
                    storeType: '优衣库'
                }, {
                    typeId: 2,
                    storeType: 'CHANEL'
                },
            ],
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
            sortContent: false,
            floorContent: false,
            allFloorStatus: true,
            floorList: [
                {
                    floor: 'W',
                    part: [
                        {
                            partId: 1,
                            partType: '停车场',
                        }
                    ],
                }, {
                    floor: 'WU',
                    part: [
                        {
                            partId: 1,
                            partType: '停车场',
                        }, {
                            partId: 2,
                            partType: '生活服务',
                        }, {
                            partId: 3,
                            partType: '超市',
                        },
                    ],
                }, {
                    floor: 'F1',
                    part: [
                        {
                            partId: 1,
                            partType: '停车场',
                        }, {
                            partId: 2,
                            partType: '生活服务',
                        }, {
                            partId: 3,
                            partType: '超市',
                        },
                    ],
                }, {
                    floor: 'F2',
                    part: [
                        {
                            partId: 1,
                            partType: '停车场',
                        }, {
                            partId: 2,
                            partType: '生活服务',
                        }, {
                            partId: 3,
                            partType: '超市',
                        },
                    ],
                }, {
                    floor: 'F3',
                    part: [
                        {
                            partId: 1,
                            partType: '停车场',
                        }, {
                            partId: 2,
                            partType: '生活服务',
                        }, {
                            partId: 3,
                            partType: '超市',
                        },
                    ]
                }
            ],
            currentFloor: '', //当前选择的楼层
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
        clearSearch() {
            SearchState.showCloseBtn = false;
            SearchState.isShowSort = false;
            this.sortContent = false;
            this.floorContent = false;
            SelfInputState.isShow = false;
            FloorBoxState.isShow = false;
            this.searchValue = '';
            this.currentFloor = '';
            this.currentStoreType = -1;
            this.currentFacilityType = -1;
            this.floorType = -1;
            this.floorContentType = -1;
            this.allFloorStatus = true;
        },
        clearFloorType() {
            this.currentFloor = '';
            this.floorType = -1;
            this.floorContentType = -1;
            this.allFloorStatus = true;
        },
        handleSearch(e: KeyboardEvent) {
            // if(SelfInputState.isShow ){

            // }
            if (e.keyCode && e.keyCode === 13) {
                // @ts-ignore
                console.log('搜索' + e.target?.value);
                if (SearchState.centmap) {
                    mapManager.zoomTo(0.4);
                    mapManager.pitchTo(0);
                }
                const tempRes = {
                    fl_name: "L1",
                    lnglat: [
                        16.858224868774414,
                        0.000091552734375,
                        0
                    ],
                    seqId: 1,
                    index: 1,
                    park: false,
                    cat_id: 105002013,
                    bd_name: "太古汇",
                    center: [
                        22.16351318359375,
                        2.6662068367004395,
                        0.800000011920929
                    ],
                    fl_num: 1,
                    name: "DIOR",
                    number: "",
                    rdFl: 2
                };
                let tempMarkData = {
                    location: [22.16351318359375, 2.6662068367004395],
                    height: 0.9,
                    rdFl: 2,
                    fl_name: 'L1',
                    name: 'DIOR',
                } as PointType;
                StoreState.currentPoint = tempMarkData;
                StoreState.endPoint = tempMarkData;
                MapObject.previewMarker.show(tempMarkData);
                MapObject.currentInfoBox.show(tempMarkData, tempRes)
                // MapObject.currentInfoBox.show(this.resMarkInfo, this.test);

                SearchState.showCloseBtn = false;
                SearchState.isShowSort = false;
                FloorBoxState.isShow = false;
                compassState.isShow = true;
                FloorState.isShow = true;
                zoomState.isShow = true;
                MapObject.isCarBtn = true;
            }
        }
    },
    render() {
        return <div id={container} style={{ height: `${SearchState.isShowSort ? '100%' : 'auto'}` }}>
            <div class={search_box} style={{ display: `${SearchState.isShowSearch ? 'block' : 'none'}`, background: `${SearchState.isShowSort ? '#fff' : 'transparent'}` }}>
                <input type='text' placeholder='请输入搜索内容' value={this.searchValue}
                    onClick={() => {
                        SearchState.isShowSort = true;
                        SearchState.showCloseBtn = true;
                        MapObject.hideIndex?.();
                    }}
                    onKeypress={e => this.handleSearch(e)}
                />
                <div class={icon}>
                    <Icon type="search" color="#7D7562" size={16} />
                </div>
                <div class={close_search}
                    style={{ display: `${SearchState.showCloseBtn ? 'block' : 'none'}` }}
                    onClick={() => {
                        this.clearSearch();
                        if (StoreState.storeNav) {
                            SearchState.isShowSearch = false;
                        } else {
                            MapObject.backIndex?.();
                        }
                    }}>
                    <Icon type="wrong" color="#7D7562" size={13} />
                </div>
            </div>
            <div class={search_type} style={{ display: `${SearchState.isShowSort && !SelfInputState.isShow ? 'flex' : 'none'}` }}>
                <div class={`${this.floorContent ? type_active : ''}`}
                    onClick={() => {
                        this.sortContent = false;
                        this.floorContent = !this.floorContent;
                        FloorBoxState.isShow = false;
                    }}
                >
                    <div>{this.currentFloor ? this.currentFloor : '楼层'}</div>
                </div>
                <div class={`${this.sortContent ? type_active : ''}`}
                    onClick={() => {
                        this.floorContent = false;
                        this.sortContent = !this.sortContent;
                        FloorBoxState.isShow = false;
                        this.clearFloorType();
                    }}
                >
                    <div>分类</div>
                </div>
            </div>
            <div class={floor_content} style={{ display: `${SearchState.isShowSort && this.floorContent ? 'block' : 'none'}` }}>
                <div
                    class={`${this.allFloorStatus ? floor_active : ''}`}
                    onClick={() => { this.clearFloorType(); }}>全部楼层
                </div>
                {this.floorList.map((item, index) => {
                    return <div>
                        <div
                            style={{ color: `${this.floorType === index ? '#FFE5A7' : '#fff'}` }}
                            onClick={() => {
                                this.allFloorStatus = false;
                                this.floorType = index;
                                this.currentFloor = item.floor;
                                this.floorContentType = -1;
                                this.floorContent = false;
                                FloorBoxState.isShow = true;
                            }}>
                            {item.floor}
                        </div>
                        {item.part.map((i, index_) => {
                            return <div
                                style={{ color: `${this.floorType === index && this.floorContentType === index_ ? '#FFE5A7' : '#fff'}` }}
                                onClick={() => {
                                    this.allFloorStatus = false;
                                    this.floorType = index;
                                    this.floorContentType = index_;
                                }}>
                                {i.partType}
                            </div>;
                        })}
                    </div>;
                })}
            </div>
            <div class={hot_recommend} style={{ display: `${SearchState.isShowSort && !this.sortContent && !this.floorContent && !FloorBoxState.isShow && !SelfInputState.isShow ? 'flex' : 'none'}` }}>
                <div class='flex-start'>
                    <div>热门推荐 :</div>
                    <div class={recommend_list}>
                        {this.hotRecommendList?.map(item => {
                            return <div>{item.brandName}</div>;
                        })}
                    </div>
                </div>
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
                                                SearchState.isShowSort = false;

                                                if (SearchState.centmap) {
                                                    mapManager.zoomTo(0.4);
                                                    mapManager.pitchTo(0);
                                                    FloorState.isShow = true;
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
                                                SearchState.isShowSort = false;
                                            }}>
                                            {item.storeType}
                                        </div>
                                    </div>;
                                }
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div class={sort_content} style={{ display: `${SearchState.isShowSort && this.sortContent ? 'block' : 'none'}` }}>
                <div>
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
                                                    this.sortContent = false;
                                                    FloorBoxState.isShow = true;
                                                    console.log('搜索' + item.storeType);
                                                    let resIndex = -1;
                                                    FloorBoxState.lookStoreType.forEach((i, index) => {
                                                        if (i.name === item.storeType) {
                                                            resIndex = index;
                                                        }
                                                    })
                                                    FloorBoxState.currentTypeIndex = resIndex;
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
                                                    this.sortContent = false;
                                                    FloorBoxState.isShow = true;
                                                    console.log('搜索' + item.storeType);
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
                                                    this.sortContent = false;
                                                    FloorBoxState.isShow = true;
                                                    console.log('搜索' + item.facilityType);
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
                                                    this.sortContent = false;
                                                    FloorBoxState.isShow = true;
                                                    console.log('搜索' + item.facilityType);

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
            </div>
            <FloorBox />
            <SelfInput />
        </div >;
    },
});
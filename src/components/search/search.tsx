import { defineComponent, reactive, watch } from 'vue';

import {
    container, sort_list, sort_content, search_box, sort_title, active, search_type, type_active, floor_content,
    hot_recommend, recommend_list, icon, sort_item, history_title, close_search, floor_active, default_content,
    floor_box, store_list, store_type, show_store, store_info, store_title, work_state, floor_res
} from './Search.module.scss';

import { MapObject } from '@/map/Map';
import { mapManager } from '@/map/MapManager';
import Icon from '@/components/icon/Icon';
import { StoreState } from '../storeBox/StoreBox';
import { searchStore } from '@/services';
import imgUrl from '@/assets/img/uniqlo.png';
import baseImg from '@/assets/img/base_point.png';
import locatURL from '@/assets/img/locate_icon.png';
import { SortBoxState } from '../sortBox/SortBox';
import { navigation } from '../navInfo/NavInfo';

export const SearchState: {
    isShowSort: boolean;
    isShowSearch: boolean;
    showCloseBtn: boolean;
    searchValue: string;
} = reactive({
    isShowSort: false,
    isShowSearch: true,
    showCloseBtn: false,
    searchValue: '',
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
                    storeType: '美容护理'
                }, {
                    typeId: 5,
                    storeType: '珠宝首饰'
                }, {
                    typeId: 6,
                    storeType: '生活时尚'
                }, {
                    typeId: 7,
                    storeType: '休闲运动'
                }, {
                    typeId: 8,
                    storeType: '母婴儿童'
                }, {
                    typeId: 9,
                    storeType: '服务'
                }, {
                    typeId: 10,
                    storeType: '超市'
                }, {
                    typeId: 11,
                    storeType: '家居'
                }, {
                    typeId: 12,
                    storeType: '电器'
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
                    facilityType: '母婴室'
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
            searchType: [
                {
                    type: 1,
                    icon: '',
                    name: '楼层',
                }, {
                    type: 2,
                    icon: '',
                    name: '分类',
                }, {
                    type: 3,
                    icon: '',
                    name: '默认排序',
                }
            ],
            currentSearchType: 0, //默认展示当前楼层
            defaultType: [
                {
                    type: 1,
                    name: '默认排序'
                }, {
                    type: 2,
                    name: '点赞最多'
                }, {
                    type: 3,
                    name: '优惠优先'
                }, {
                    type: 4,
                    name: '团购优先'
                }, {
                    type: 5,
                    name: '活动优先'
                }, {
                    type: 6,
                    name: '名称A-Z'
                }
            ],
            currentDefaultType: 0,
            storeList: [
                {
                    sort: '全部',
                    img: imgUrl,
                    title: '优衣库',
                    type: '休闲服饰',
                    time: '10:00-22:00',
                    state: 1 //营业中
                }, {
                    sort: '全部',
                    img: imgUrl,
                    title: '优衣库',
                    type: '休闲服饰',
                    time: '10:00-22:00',
                    state: 2 //维护中
                }, {
                    sort: '全部',
                    img: imgUrl,
                    title: '优衣库',
                    type: '休闲服饰',
                    time: '10:00-22:00',
                    state: 1 //营业中
                }, {
                    sort: '全部',
                    img: imgUrl,
                    title: '优衣库',
                    type: '休闲服饰',
                    time: '10:00-22:00',
                    state: 3 //休息中
                }, {
                    sort: '全部',
                    img: imgUrl,
                    title: '优衣库',
                    type: '休闲服饰',
                    time: '10:00-22:00',
                    state: 1 //营业中
                },
            ],
            showfloorRes: false,
            lookStoreType: [
                {
                    type: 1,
                    name: '全部',
                    number: 100,
                }, {
                    type: 2,
                    name: '男装',
                    number: 38,
                }, {
                    type: 3,
                    name: '女装',
                    number: 6,
                }, {
                    type: 4,
                    name: '设施',
                    number: 7,
                }, {
                    type: 5,
                    name: '珠宝/钟表/饰品',
                    number: 7,
                }
            ],
            currentLookIndex: -1,
        }
    },
    mounted() {
        watch(() => MapObject.currentRdfl, rdfl => {
            // 监听楼层变化
            if (!navigation.isMock) {
                this.removePoint();
                StoreState.isStoreBox = false;
                // // 隐藏上次楼层信息框
                // if (MapObject.Cmap?.markerManager.has('preview') && MapObject.Cmap?.markerManager.has('currentBrand')) {
                //     MapObject.Cmap?.markerManager.hide('preview');
                //     MapObject.Cmap?.markerManager.hide('currentBrand');
                //     StoreState.isStoreBox = false;
                // }
                this.currentFloorRes();
            }
        });
    },
    methods: {
        clearSearch() {
            SearchState.showCloseBtn = false;
            SearchState.isShowSort = false;
            this.showfloorRes = false;
            this.currentFloor = '';
            this.currentSearchType = 0;
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
        handleSearch(name: string) {
            SearchState.searchValue = name;
            mapManager.zoomTo(0.4);
            mapManager.pitchTo(0);
            searchStore({ name }).then(res => {
                if (res) SortBoxState.pointList = res;
                this.currentFloorRes();
                this.clearSearch();
                MapObject.backIndex?.();
                SortBoxState.isShow = true;
            })
        },
        currentFloorRes() {
            console.log('添加marker');
            if (SortBoxState.pointList.length === 1) {
                const { center, rd_fl, fl_name, name } = SortBoxState.pointList[0];
                const [lng, lat, height] = center;
                if (MapObject.currentRdfl !== rd_fl) {
                    MapObject.Cmap?.switchFloor(1, rd_fl);
                }
                const markData = {
                    location: [lng, lat] as [number, number],
                    height: height ? height : 0.9,
                    rdFl: rd_fl,
                    fl_name,
                    name,
                };
                StoreState.currentPoint =StoreState.endPoint= markData;
                MapObject.previewMarker.show(StoreState.currentPoint);
                MapObject.currentInfoBox.show(StoreState.currentPoint);
                mapManager.moveTo([lng, lat]);
            } else {
                SortBoxState.pointList.forEach((item, index) => {
                    if (MapObject.currentRdfl === item.rd_fl) {
                        const [lng, lat, height] = item.center;
                        // 添加marker
                        const dom = document.createElement('img');
                        dom.src = baseImg;
                        dom.style.width = '18px';
                        MapObject.Cmap?.markerManager.addMarker(`id${index}`, {
                            marker: dom,
                            lnglat: [lng, lat],
                        })
                        MapObject.Cmap?.markerManager.show(`id${index}`);
                    }
                })
            }
        },
        workState(id: number) {
            switch (id) {
                case 1:
                    return <div class={work_state} style={{ background: 'linear-gradient(91deg, #F5BAA4, #FBA797, #FE9A95)' }}>营业中</div>;
                case 2:
                    return <div class={work_state} style={{ background: '#F2B063' }}>维护中</div>;
                case 3:
                    return <div class={work_state} style={{ background: '#B3B3B3' }}>休息中</div>;
                default:
                    return null
            }
        },
        removePoint() {
            console.log('销毁marker');
            if (SortBoxState.pointList.length > 0) {
                SortBoxState.pointList?.map((item, index) => {
                    if (MapObject.Cmap?.markerManager.has(`id${index}`)) {
                        MapObject.Cmap?.markerManager.remove(`id${index}`);
                    }
                });
            }
        }
    },
    render() {
        return <div id={container} style={{ height: `${SearchState.isShowSort ? '100%' : 'auto'}` }}>
            <div class={search_box} style={{ display: `${SearchState.isShowSearch ? 'block' : 'none'}`, background: `${SearchState.isShowSort ? '#fff' : 'transparent'}` }}>
                <input type='text' placeholder='请输入搜索内容' value={SearchState.searchValue}
                    onClick={() => {
                        SearchState.searchValue = '';
                        SearchState.isShowSort = true;
                        SearchState.showCloseBtn = true;
                        MapObject.hideIndex?.();
                        // 销毁屏幕上的点
                        this.removePoint();
                    }}
                    onKeypress={e => {
                        if (e.keyCode && e.keyCode === 13) {
                            // @ts-ignore
                            if (`${e.target?.value}`) {
                                // @ts-ignore
                                SortBoxState.SortBoxTitle = `${e.target?.value}`;
                                // @ts-ignore
                                this.handleSearch(`${e.target?.value}`);
                            }
                        }
                    }}
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
            <div class={search_type} style={{ display: `${SearchState.isShowSort ? 'flex' : 'none'}` }}>
                {this.searchType.map((item, index) => {
                    return <div class={`${this.currentSearchType === index ? type_active : ''}`}
                        onClick={() => {
                            SearchState.isShowSort = true;
                            this.currentSearchType = index;
                        }}
                    >
                        {item.type === 1 ? <div>{this.currentFloor ? this.currentFloor : '楼层'}</div> : <div>{item.name}</div>}
                    </div>;
                })}
            </div>
            <div class={floor_content} style={{ display: `${SearchState.isShowSort && this.currentSearchType === 0 ? 'block' : 'none'}` }}>
                <div>
                    <div
                        class={`${this.allFloorStatus ? floor_active : ''}`}
                        onClick={() => { this.clearFloorType(); }}>全部楼层
                    </div>
                    {this.floorList.map((item, index) => {
                        return <div>
                            <div
                                style={{ color: `${this.floorType === index ? '#C6A76E' : '#000'}`, width: '24px' }}
                                onClick={() => {
                                    this.allFloorStatus = false;
                                    this.floorType = index;
                                    this.currentFloor = item.floor;
                                    this.currentSearchType = -1;
                                    this.showfloorRes = true;
                                }}>
                                {item.floor}
                            </div>
                        </div>;
                    })}
                </div>
            </div>
            {/* <div class={hot_recommend} style={{ display: `${SearchState.isShowSort && !SortBoxState.isShow  ? 'flex' : 'none'}` }}>
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
                                                SearchState.searchValue = item.storeType;
                                                console.log('搜索' + SearchState.searchValue);
                                                SearchState.isShowSort = false;

                                                if (SearchState.centmap) {
                                                    mapManager.zoomTo(0.4);
                                                    mapManager.pitchTo(0);
                                                    FloorState.isShow = true;
                                                    SortBoxState.FloorBoxTitle = SearchState.searchValue;
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
                                                SearchState.searchValue = item.storeType;
                                                console.log('搜索' + SearchState.searchValue);
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
            </div> */}
            <div class={sort_content} style={{ display: `${SearchState.isShowSort && this.currentSearchType === 1 ? 'block' : 'none'}` }}>
                <div>
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
                                                        this.currentStoreType = index;
                                                        SortBoxState.isShow = true;
                                                        SortBoxState.SortBoxTitle = item.storeType;
                                                        this.handleSearch(item.storeType);
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                                <div>
                                    {this.storeSort?.map((item, index) => {
                                        if (index > 3 && index < 8) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentStoreType = index;
                                                        SortBoxState.isShow = true;
                                                        SortBoxState.SortBoxTitle = item.storeType;
                                                        this.handleSearch(item.storeType);
                                                    }}>
                                                    {item.storeType}
                                                </div>
                                            </div>;
                                        }
                                    })}
                                </div>
                                <div>
                                    {this.storeSort?.map((item, index) => {
                                        if (index > 7) {
                                            return <div class={sort_item}>
                                                <div
                                                    class={`${this.currentStoreType === index ? active : ''}`}
                                                    onClick={() => {
                                                        this.currentStoreType = index;
                                                        SortBoxState.isShow = true;
                                                        SortBoxState.SortBoxTitle = item.storeType;
                                                        this.handleSearch(item.storeType);
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
                                                        this.currentFacilityType = index;
                                                        SortBoxState.isShow = true;
                                                        SortBoxState.SortBoxTitle = item.facilityType;
                                                        this.handleSearch(item.facilityType);
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
                                                        this.currentFacilityType = index;
                                                        SortBoxState.isShow = true;
                                                        SortBoxState.SortBoxTitle = item.facilityType;
                                                        this.handleSearch(item.facilityType);
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
            </div>
            <div class={default_content} style={{ display: `${SearchState.isShowSort && this.currentSearchType === 2 ? 'block' : 'none'}` }}>
                <div>
                    {this.defaultType.map((item, index) => {
                        return <div class={`${this.currentDefaultType === index ? type_active : ''}`}
                            onClick={() => {
                                this.currentDefaultType = index
                                // SortBoxState.isShow = true;
                            }}>
                            {item.name}
                        </div>;
                    })}
                </div>
            </div>
            <div class={floor_box} style={{ display: `${this.showfloorRes ? 'block' : 'none'}` }}>
                <div class={floor_res}>
                    <div class={store_list}>
                        <div>该层全部商户</div>
                        <div class={store_type}>
                            {this.lookStoreType?.map((item, index) => {
                                return <div
                                    class={`${this.currentLookIndex === index ? active : ''}`}
                                    onClick={() => {
                                        this.currentLookIndex = index;
                                        if (item.type === 4) {
                                            // 楼层设施
                                            this.storeList = [
                                                {
                                                    sort: '设施',
                                                    img: '',
                                                    title: '太古汇-洗手间',
                                                    type: '男女洗手间',
                                                    time: '10:00-22:00',
                                                    state: 0,
                                                }, {
                                                    sort: '设施',
                                                    img: '',
                                                    title: '太古汇-扶梯',
                                                    type: '扶梯',
                                                    time: '10:00-22:00',
                                                    state: 0,
                                                }, {
                                                    sort: '设施',
                                                    img: '',
                                                    title: '太古汇-母婴室',
                                                    type: '母婴室',
                                                    time: '10:00-22:00',
                                                    state: 0,
                                                }, {
                                                    sort: '设施',
                                                    img: '',
                                                    title: '太古汇-直梯',
                                                    type: '直梯（客梯）',
                                                    time: '10:00-22:00',
                                                    state: 0,
                                                }, {
                                                    sort: '设施',
                                                    img: '',
                                                    title: '太古汇-座椅',
                                                    type: '休息区/座椅',
                                                    time: '10:00-22:00',
                                                    state: 0,
                                                },
                                            ];
                                        } else {
                                            this.storeList = [
                                                {
                                                    sort: '全部',
                                                    img: imgUrl,
                                                    title: '优衣库',
                                                    type: '休闲服饰',
                                                    time: '10:00-22:00',
                                                    state: 1,
                                                }, {
                                                    sort: '全部',
                                                    img: imgUrl,
                                                    title: '优衣库',
                                                    type: '休闲服饰',
                                                    time: '10:00-22:00',
                                                    state: 2,
                                                }, {
                                                    sort: '全部',
                                                    img: imgUrl,
                                                    title: '优衣库',
                                                    type: '休闲服饰',
                                                    time: '10:00-22:00',
                                                    state: 1,
                                                }, {
                                                    sort: '全部',
                                                    img: imgUrl,
                                                    title: '优衣库',
                                                    type: '休闲服饰',
                                                    time: '10:00-22:00',
                                                    state: 3,
                                                }, {
                                                    sort: '全部',
                                                    img: imgUrl,
                                                    title: '优衣库',
                                                    type: '休闲服饰',
                                                    time: '10:00-22:00',
                                                    state: 1,
                                                },
                                            ]
                                        }
                                    }}>
                                    {item.name}({item.number})
                                </div>;
                            })}
                        </div>
                        <div class={show_store}>
                            {this.storeList.map(item => {
                                return <div>
                                    <div>
                                        {item.img ?
                                            <img src={item.img} alt="图片找不到" />
                                            : <div style={{ width: '53px', height: '53px', background: '#bbb' }}></div>
                                        }
                                    </div>
                                    <div class={store_info}>
                                        <div class={store_title}>{item.title}</div>
                                        {item.sort !== '设施' ? <div>
                                            <div>业态类型: {item.type}</div>
                                        </div> : <div>
                                            <div>{item.type}</div>
                                        </div>}
                                    </div>
                                    <img src={locatURL} alt="图片找不到" />
                                    {this.workState(item.state)}
                                </div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div >;
    },
});
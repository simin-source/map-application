import { defineComponent, reactive } from 'vue';
import {
    floor_box, spread_icon, floor_content, floor_title, show_store, store_type, store_list, store_info, store_title,
    active, close, work_state
} from './FloorBox.module.scss';

import spreadIcon from '@/assets/img/up.png';
import imgUrl from '@/assets/img/uniqlo.png';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import arrowLeftUrl from '../../assets/img/arrow_left.png';

export const FloorBoxState: {
    isSpread: Boolean;
    isShow: Boolean;
    FloorBoxTitle: String;
    isSearchRes: Boolean;
    currentTypeIndex: Number;
    lookStoreType: any[];
} = reactive({
    isSpread: false,
    isShow: false,
    FloorBoxTitle: 'WU | 广州太古汇',
    isSearchRes: false,
    currentTypeIndex: 0,
    lookStoreType: [],
});

export default defineComponent({
    name: 'FloorBox',
    data() {
        return {
            // lookStoreType: [
            //     {
            //         type: 1,
            //         name: '全部',
            //         number: 100,
            //     }, {
            //         type: 2,
            //         name: '男装',
            //         number: 38,
            //     }, {
            //         type: 3,
            //         name: '女装',
            //         number: 6,
            //     }, {
            //         type: 4,
            //         name: '设施',
            //         number: 7,
            //     }, {
            //         type: 5,
            //         name: '珠宝/钟表/饰品',
            //         number: 7,
            //     }
            // ],
            // currentTypeIndex: 0,
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
            ]
        }
    },
    created() {
        FloorBoxState.lookStoreType = [
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
        ];
    },
    methods: {
        workState(id: number) {
            switch (id) {
                case 1:
                    return <div class={work_state} style={{ background: '#93B6BE' }}>营业中</div>;
                case 2:
                    return <div class={work_state} style={{ background: '#F2B063' }}>维护中</div>;
                case 3:
                    return <div class={work_state} style={{ background: '#B3B3B3' }}>休息中</div>;
                default:
                    return null
            }
        },
    },
    render() {
        return <div class={floor_box} style={{ display: `${FloorBoxState.isShow ? 'block' : 'none'}` }}>
            {/* return <div class={floor_box} style={{ height: `${FloorBoxState.isSpread ? '100%' : '20px'}`, display: `${FloorBoxState.isShow ? 'block' : 'none'}` }}> */}
            {/* <div class={spread_icon}>
                <img
                    src={spreadIcon}
                    alt='图片找不到'
                    style={{ display: `${FloorBoxState.isSpread ? 'none' : 'block'}` }}
                    onClick={() => {
                        FloorBoxState.isSpread = true;
                        SearchState.isShowSearch = false;
                        MapObject.isCarBtn = false;
                    }}
                />
            </div> */}
            {/* <div
                class={close}
                style={{ display: `${FloorBoxState.isSpread ? 'block' : 'none'}` }}
                onClick={() => {
                    FloorBoxState.isSpread = false;
                    MapObject.isCarBtn = true;
                    SearchState.isShowSearch = true;
                }}
            >
                <img src={arrowLeftUrl} alt='图片找不到'/>
            </div> */}
            <div class={floor_content}>
                {/* <div class={floor_title} style={{ height: `${FloorBoxState.isSpread ? '60px' : '70px'}` }}>
                    {FloorBoxState.FloorBoxTitle}
                </div> */}
                <div class={store_list}>
                    <div style={{ display: `${FloorBoxState.isSearchRes ? 'none' : 'block'}` }}>该层全部商户</div>
                    <div class={store_type} style={{ display: `${FloorBoxState.isSearchRes ? 'none' : 'flex'}` }}>
                        {FloorBoxState.lookStoreType?.map((item, index) => {
                            return <div
                                class={`${FloorBoxState.currentTypeIndex === index ? active : ''}`}
                                onClick={() => {
                                    FloorBoxState.currentTypeIndex = index;
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
                    <div class={show_store} style={{ height: `${FloorBoxState.isSearchRes ? '98%' : 'calc(100% - 75px)'}` }}>
                        {this.storeList.map(item => {
                            return <div>
                                <div>
                                    {item.img ?
                                        <img src={item.img} alt="图片找不到" />
                                        : <div style={{ width: '75px', height: '75px', background: '#bbb' }}></div>
                                    }
                                </div>
                                <div class={store_info}>
                                    <div class={store_title}>{item.title}</div>
                                    {item.sort !== '设施' ? <div>
                                        <div>业态类型: {item.type}</div>
                                        {/* <div style={{ marginTop: '7px' }}>营业时间: <span style={{ color: '#FF8218' }}>{item.time}</span></div> */}
                                    </div> : <div>
                                        <div>{item.type}</div>
                                        <div style={{ marginTop: '7px' }}>使用时间: <span style={{ color: '#FF8218' }}>{item.time}</span></div>
                                    </div>}
                                </div>
                                {this.workState(item.state)}
                            </div>;
                        })}
                    </div>
                </div>
            </div>
        </div>;
    },
});
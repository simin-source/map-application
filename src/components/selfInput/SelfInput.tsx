import { defineComponent, reactive } from 'vue';
import {
    self_box, menu_list, menu_content, history_point
} from './SelfInput.module.scss';

import meImgUrl from '@/assets/img/me.png';
import likeImgUrl from '@/assets/img/like.png';
import pointImgUrl from '@/assets/img/point.png';
import { MapObject } from '@/map/Map';
import { SearchState } from '../search/search';
import arrowLeftUrl from '../../assets/img/arrow_left.png';

export const SelfInputState: {
    isShow: Boolean;
} = reactive({
    isShow: false,
});

export default defineComponent({
    name: 'SelfInput',
    data() {
        return {
            menuList: [
                {
                    img: pointImgUrl,
                    width: '30px',
                    title: '地图选点'
                }, {
                    img: likeImgUrl,
                    width: '38px',
                    title: '收藏夹'
                }, {
                    img: meImgUrl,
                    width: '34px',
                    title: '我的位置'
                },
            ],
            currentMenu: 0,
            historyContent: [
                {
                    name: '位置一',
                }, {
                    name: '位置二',
                }, {
                    name: '位置三',
                },
            ]
        }
    },
    methods: {
    },
    render() {
        return <div class={self_box} style={{ display: `${SelfInputState.isShow ? 'block' : 'none'}` }}>
            <div class={`flex-between ${menu_list}`}>
                {this.menuList.map((item, index) => {
                    return <div
                        class='flex-center'
                        style={{ border: `${this.currentMenu === index ? '1px solid #000' : ''}` }}
                        onClick={() => { this.currentMenu = index; }}>
                        <img src={item.img} style={{width:item.width}} alt='图片找不到' />
                        <div>{item.title}</div>
                    </div>
                })}
            </div>
            <div class={menu_content}>
                <div class={history_point}>
                    <div>历史搜索</div>
                    {this.historyContent.map(item => {
                        return <div>{item.name}</div>
                    })}
                </div>
            </div>
        </div>;
    },
});
import { defineComponent, reactive } from 'vue';

import Icon from '@/components/icon/Icon';
import { mapManager } from '@/map/MapManager';
import { PointMark } from '../pointMark/PointMark';
import {
    body, info_box, destination, layer, store_info, store_title
} from './NavigationEnd.module.scss';
import { CarState } from '../carBox/CarBox';
import navEndUrl from '@/assets/img/navEnd.png';
import imgUrl from '@/assets/img/uniqlo.png';
import { SearchState } from '../search/search';
import { compassState } from '../control/compass/Compass';
import { FloorState } from '../control/floor/Floor';
import { zoomState } from '../control/zoom/Zoom';
import { MapObject } from '@/map/Map';

const NavigationState: {
    show: boolean;
    confirm?: () => void;
    // close?: () => void;
    text: string;
} = reactive({
    show: false,
    text: '',
});

const InfoBox = defineComponent({
    name: 'NavigationEnd',
    render() {
        const { show } = NavigationState;
        return show ? (
            <div id="closeBox" class={layer}>
                <div class={info_box}>
                    <img src={navEndUrl} alt='图片找不到' />
                    <div>您已到达目的地附近</div>
                    <div class={destination}>
                        <div>
                            <img src={imgUrl} alt="图片找不到" />
                        </div>
                        <div class={store_info}>
                            <div class={store_title}>优衣库</div>
                            <div>
                                <div>业态类型: 男装女装</div>
                                <div style={{ marginTop: '7px' }}>营业时间: <span>10：00-22：00</span></div>
                            </div>
                        </div>
                    </div>
                    <div class='flex-center' onClick={this.confirm}><div>结束导航</div></div>
                </div>
            </div>
        ) : null;
    },
    methods: {
        confirm() {
            const { confirm, /* close */ } = NavigationState;
            if (confirm) confirm();
            // if (close) close();

            SearchState.isShowSort = true;
            compassState.isShow = true;
            FloorState.isShow = true;
            zoomState.isShow = true;
            MapObject.isCarBtn = true;
            NavigationState.show = false;
            CarState.isNavgateInfo = false;
            MapObject.endMarker.hide();
            MapObject.startMarker.hide();
        },
    },
});

class NavigationEnd {
    infoBox = InfoBox;
    constructor() {
        mapManager.onReady(unimap => {
            this.endPointMark = new PointMark('endPoint');
        });
    }
    private endPointMark?: PointMark;
    // 坐标 coordinate
    private endCoordinate?: [number, number];

    onConfirm(call: () => void) {
        NavigationState.confirm = call;
        return this;
    }
    show(text: string) {
        NavigationState.show = true;
        NavigationState.text = text;
        if (this.endCoordinate && this.endPointMark) {
            this.endPointMark.show({
                location: this.endCoordinate,
                rdFl: 0,
                height: 0.06,
            });
        }
        return this;
    }
    getEndPoint(lnglat: [number, number]) {
        this.endCoordinate = lnglat;
    }
    hide() {
        NavigationState.show = false;
        if (this.endPointMark) this.endPointMark.hide();
        return this;
    }
    // onClose(fun?: () => void) {
    //     if (fun) NavigationState.close = fun;
    //     return this;
    // }
}

export const navigationEnd = new NavigationEnd();
import { defineComponent, reactive } from 'vue';

import { mapManager } from '@/map/MapManager';
import { PointMark } from '../pointMark/PointMark';
import {
    info_box, destination, layer, store_info, store_title, confirm_end
} from './NavigationEnd.module.scss';
import { CarState } from '../carBox/CarBox';
import navEndUrl from '@/assets/img/navEnd.png';
import imgUrl from '@/assets/img/uniqlo.png';
import { SearchState } from '../search/search';
import { compassState } from '../control/compass/Compass';
import { FloorState } from '../control/floor/Floor';
import { zoomState } from '../control/zoom/Zoom';
import { MapObject } from '@/map/Map';
import { StoreState } from '../storeBox/StoreBox';

export const NavigationState: {
    show: boolean;
    confirm?: () => void;
    close?: () => void;
    text: string;
    isEnd: boolean;
} = reactive({
    show: false,
    text: '',
    isEnd: false,
});

const InfoBox = defineComponent({
    name: 'NavigationEnd',
    render() {
        return <div id="closeBox" class={layer} style={{ display: `${NavigationState.show || NavigationState.isEnd ? 'flex' : 'none'}` }}>
            <div class={info_box} style={{ display: `${NavigationState.show && !NavigationState.isEnd ? 'block' : 'none'}` }}>
                <img src={navEndUrl} alt='图片找不到' />
                <div>您已到达目的地附近</div>
                <div class={destination}>
                    <div>
                        <img src={imgUrl} alt="图片找不到" />
                    </div>
                    <div class={store_info}>
                        <div class={store_title}>{StoreState.endPoint?.name}</div>
                        <div>
                            <div>业态类型: 男装女装</div>
                            {/* <div style={{ marginTop: '7px' }}>营业时间: <span>10：00-22：00</span></div> */}
                        </div>
                    </div>
                </div>
                <div class='flex-center' onClick={this.confirm}><div>结束导航</div></div>
            </div>
            <div class={confirm_end} style={{ display: `${!NavigationState.show && NavigationState.isEnd ? 'flex' : 'none'}` }}>
                <img src={navEndUrl} alt='图片找不到' />
                <div>确认结束导航？</div>
                <div>
                    <div>取消</div>
                    <div onClick={this.confirm}>确定</div>
                </div>
            </div>
        </div>
            ;
    },
    methods: {
        confirm() {
            const { confirm, close } = NavigationState;
            if (confirm) confirm();
            if (close) close();
            MapObject.backIndex?.();
            NavigationState.show = NavigationState.isEnd = false;
            CarState.carNav = false;
            MapObject.showRightSet = true;
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
    onClose(fun?: () => void) {
        if (fun) NavigationState.close = fun;
        return this;
    }
}

export const navigationEnd = new NavigationEnd();
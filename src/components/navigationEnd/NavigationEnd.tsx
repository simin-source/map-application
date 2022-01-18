import { defineComponent, reactive } from 'vue';

import Icon from '@/components/icon/Icon';
import { mapManager } from '@/map/MapManager';
import { PointMark } from '../pointMark/PointMark';
import {
    body, info_box, layer, title,
} from './NavigationEnd.module.scss';

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
        const { show, text } = NavigationState;
        return show ? (
            <div id="closeBox" class={layer}>
                <div class={info_box}>
                    <div class={`flex-between ${title}`}>
                        <span>导航结束</span>
                        <div onClick={this.confirm}><Icon type="wrong" size={15} /></div>
                    </div>
                    <div class={body}>
                        <div>您已到达{text}附近</div>
                        <button onClick={this.confirm}><span>确定</span></button>
                    </div>
                </div>
            </div>
        ) :  null;
    },
    methods: {
        confirm() {
            const { confirm, /* close */ } = NavigationState;
            NavigationState.show = false;
            if (confirm) confirm();
            // if (close) close();
        },
    },
});

class NavigationEnd {
    InfoBox = InfoBox;
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
import { MapObject } from '@/map/Map';
import { defineComponent, reactive } from 'vue';
import { navigation } from '../navInfo/NavInfo';
import { StoreState } from '../storeBox/StoreBox';
import {
    confirm_box, confirm_text, confirm_btn
} from './ConfirmPoint.module.scss';

export const ConfirmState: {
    confirmStart: boolean;
    confirmEnd: boolean;
} = reactive({
    confirmStart: false,
    confirmEnd: false,
});

export default defineComponent({
    name: 'ConfirmPoint',
    data() {
        return {
        }
    },
    render() {
        return <div class={confirm_box} style={{ display: `${ConfirmState.confirmStart || ConfirmState.confirmEnd ? 'block' : 'none'}` }}>
            <div style={{ display: `${ConfirmState.confirmStart ? 'block' : 'none'}` }}>
                <div class={confirm_text}>是否选择{StoreState.startPoint.name}为起点?</div>
                <div class={confirm_btn}>
                    <div onClick={() => { ConfirmState.confirmStart = false; }}>取消</div>
                    <div onClick={() => {
                        StoreState.isStoreBox = false;
                        ConfirmState.confirmStart = false;
                        if (navigation.isMock) {
                            MapObject.previewMarker.hide();
                            StoreState.startPoint = StoreState.currentPoint;
                            // 测试数据
                            // StoreState.startPoint = {
                            //     location: [30.330310821533203, 3.13568115234375],
                            //     height: 0.9,
                            //     rdFl: 2,
                            //     fl_name: "L1",
                            //     name: 'dior',
                            // };
                            navigation.mockStartPoint = StoreState.startPoint;
                            MapObject.startMarker.show(StoreState.startPoint);
                            MapObject.currentInfoBox.hide();
                        }
                    }}>确认</div>
                </div>
            </div>
            <div style={{ display: `${ConfirmState.confirmEnd ? 'block' : 'none'}` }}>
                <div class={confirm_text}>是否选择{StoreState.endPoint.name}为终点?</div>
                <div class={confirm_btn}>
                    <div onClick={() => { ConfirmState.confirmEnd = false; }}>取消</div>
                    <div onClick={() => {
                        StoreState.isStoreBox = false;
                        ConfirmState.confirmEnd = false;
                        if (!navigation.isMock) {
                            MapObject.previewMarker.hide();
                            StoreState.endPoint = StoreState.currentPoint;
                            navigation.destination(StoreState.endPoint, true);
                            MapObject.endMarker.show(StoreState.endPoint);
                        }
                    }}>确认</div>
                </div>
            </div>
        </div>;
    },
});
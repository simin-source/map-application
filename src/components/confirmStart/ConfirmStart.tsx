import { MapObject } from '@/map/Map';
import { defineComponent, reactive } from 'vue';
import { CarState } from '../carBox/CarBox';
import { navigation } from '../navInfo/NavInfo';
import { StoreState } from '../storeBox/StoreBox';
import {
    confirm_box, confirm_text, confirm_btn
} from './ConfirmStart.module.scss';

export default defineComponent({
    name: 'ConfirmStart',
    data() {
        return {
        }
    },
    render() {
        return <div class={confirm_box} style={{ display: `${CarState.confirmStart ? 'block' : 'none'}` }}>
            <div>
                <div class={confirm_text}>是否选择{StoreState.startPoint.name}为起点?</div>
                <div class={confirm_btn}>
                    <div onClick={() => { CarState.confirmStart = false;}}>取消</div>
                    <div onClick={() => {
                        StoreState.isStoreBox = false;
                        CarState.confirmStart = false;
                        if (navigation.isMock) {
                            MapObject.previewMarker.hide();
                            navigation.mockStartPoint = StoreState.startPoint;
                            MapObject.startMarker.show(StoreState.startPoint);
                        }
                    }}>确认</div>
                </div>
            </div>
        </div>;
    },
});
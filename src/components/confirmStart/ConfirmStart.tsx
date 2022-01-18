import { defineComponent, reactive } from 'vue';
import { CarState } from '../carBox/CarBox';
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
                <div class={confirm_text}>是否选择 B1-111 为起点?</div>
                <div class={confirm_btn}>
                    <div onClick={() => { CarState.confirmStart = false; CarState.isCarStart = true; }}>取消</div>
                    <div onClick={() => { CarState.confirmStart = false; CarState.isOverview = true; }}>确认</div>
                </div>
            </div>
        </div>;
    },
});
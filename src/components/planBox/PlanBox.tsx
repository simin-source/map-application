import { defineComponent, reactive } from "vue";
import {
    route_btn,
    plan_box,
    plan_type,
    active
} from "./PlanBox.module.scss";
import straightUrl from '@/assets/img/straight2.png';
import staircaseUrl from '@/assets/img/staircase2.png';
import { navInfoState } from "../navInfo/NavInfo";
import { mapManager } from "@/map/MapManager";
import { MapObject } from "@/map/Map";
import { RightBoxState } from "../rightSet/RightSet";

export const planState: {
    isPlan: boolean;
    carNav: boolean;
    planContent: any[];
} = reactive({
    isPlan: false,
    carNav: false,
    planContent: [{
        type: 0,
        img: '',
        name: '智能推荐',
        meter: '253米',
        time: '--分钟',
    }, {
        type: 1,
        img: straightUrl,
        name: '直梯优先',
        meter: '220米',
        time: '--分钟',
    }, {
        type: 2,
        img: staircaseUrl,
        name: '扶梯优先',
        meter: '201米',
        time: '--分钟',
    }],
});

export default defineComponent({
    name: "PlanBox",
    data: function () {
        return {
            currentPlan: 0,
        };
    },
    methods: {
        runNav() {
            const { onNav, isMock, runMock } = navInfoState;
            mapManager.onReady(centmap => {
                const angle = centmap.getAngle();
                centmap.angle(-angle);
            });

            if (isMock) {
                if (runMock) runMock();
            } else {
                if (onNav) onNav();
            }
        },
    },
    render() {
        return (
            <div class={plan_box} style={{ display: `${planState.isPlan || planState.carNav ? 'block' : 'none'}` }}>
                <div class={plan_type} style={{ display: `${planState.carNav ? 'flex' : 'none'}` }}>
                    {planState.planContent?.map((item, index) => {
                        return <div class={`${this.currentPlan === index ? active : ''}`}
                            onClick={() => { this.currentPlan = index; RightBoxState.StoreRouteType = [item.type]; }}>
                            {item.img ? <div class='flex-center'>
                                <img src={item.img} style={{ width: '17px', marginRight: '2px' }} alt="图片找不到" />
                                {item.name}
                            </div> : <div>{item.name}</div>}
                            <div>{item.meter}</div>
                            <div>{item.time}</div>
                        </div>;
                    })}
                </div>
                <div class={route_btn}>
                    <div>目的地位于W层</div>
                    <div onClick={() => { if (planState.carNav) { MapObject.updateStart?.(); } else { this.runNav(); } }}>开始导航</div>
                </div>
            </div>
        );
    },
});

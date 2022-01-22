import { defineComponent, reactive } from "vue";
import {
    route_btn,
    plan_box,
    plan_type,
    active
} from "./PlanBox.module.scss";
import straightUrl from '@/assets/img/straight.png';
import staircaseUrl from '@/assets/img/staircase.png';
import { navInfoState } from "../navInfo/NavInfo";
import { mapManager } from "@/map/MapManager";
import { MapObject } from "@/map/Map";
import { CarState } from "../carBox/CarBox";

export const planState: {
    isPlan: boolean;
    carNav: boolean;
    carRouteType: string;
} = reactive({
    isPlan: false,
    carNav: false,
    carRouteType: ''
});

export default defineComponent({
    name: "PlanBox",
    data: function () {
        return {
            planContent: [{
                img: '',
                type: '智能推荐',
                meter: '253米',
                time: '5分钟',
            }, {
                img: straightUrl,
                type: '直梯优先',
                meter: '220米',
                time: '3分钟',
            }, {
                img: staircaseUrl,
                type: '扶梯优先',
                meter: '201米',
                time: '4分钟',
            }],
            currentPlan: 0,
        };
    },
    methods: {
        runNav() {
            MapObject.currentInfoBox.hide();
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
        }
    },
    render() {
        return (
            <div class={plan_box} style={{ display: `${planState.isPlan || planState.carNav ? 'block' : 'none'}` }}>
                <div class={plan_type} style={{ display: `${planState.carNav ? 'flex' : 'none'}` }}>
                    {this.planContent?.map((item, index) => {
                        return <div class={`${this.currentPlan === index ? active : ''}`}
                            onClick={() => { this.currentPlan = index; }}>
                            {item.img ? <div class='flex-center'>
                                <img src={item.img} style={{ width: '17px', marginRight: '2px' }} alt="图片找不到" />
                                {item.type}
                            </div> : <div>{item.type}</div>}
                            <div>{item.meter}</div>
                            <div>{item.time}</div>
                        </div>;
                    })}
                </div>
                <div class={route_btn}>
                    <div>目的地位于W层</div>
                    <div onClick={() => { this.runNav() }}>开始导航</div>
                </div>
            </div>
        );
    },
});

import { defineComponent, reactive } from 'vue';
import {
    right_box, map_type, type_content, route_type, route_content, voice, voice_btn, switch_btn,
} from './RightSet.module.scss';

import twoUrl from '@/assets/img/twoD.png';
import threeUrl from '@/assets/img/threeD.png';
import lastestUrl from '@/assets/img/lastest.png';
import straightUrl from '@/assets/img/straight.png';
import staircaseUrl from '@/assets/img/staircase.png';
import { mapManager } from '@/map/MapManager';

export const RightBoxState: {
    isShow: boolean;
    _3D: boolean;
    ready: boolean;
    StoreRouteType: string;
} = reactive({
    isShow: false,
    _3D: true,
    ready: false,
    StoreRouteType: '',
});

let _easeing = false;

export default defineComponent({
    name: 'RightSet',
    data() {
        return {
            clickSwitchBtn: false,
            planContent: [{
                img: lastestUrl,
                type: '距离最短',
            }, {
                img: straightUrl,
                type: '直梯',
            }, {
                img: staircaseUrl,
                type: '扶梯',
            }],
        }
    },
    mounted() {
        mapManager.onReady(centmap => {
            RightBoxState.ready = !!centmap;
            const init_3D = () => {
                const pitch = centmap.getPitch() as number;
                RightBoxState._3D = !!(+pitch.toFixed(2));
            };
            init_3D();
            centmap.on('pitch', () => {
                init_3D();
            });
        });
    },
    methods: {
        setPitch() {
            const { centmap } = mapManager;
            if (_easeing || !centmap) return;
            _easeing = true;
            const pitch = centmap.getPitch();
            mapManager.pitchTo(pitch === 0 ? 1.0472 : 0, {
                onComplete() {
                    _easeing = false;
                },
            });
        },
    },
    render() {
        return <div class={right_box} style={{ display: `${RightBoxState.isShow ? 'block' : 'none'}` }}
            onClick={() => { RightBoxState.isShow = false; }}>
            <div onClick={e => { e.stopPropagation(); RightBoxState.isShow = true; }}>
                <div class={map_type}>
                    <div>地图类型</div>
                    <div class={`flex-between ${type_content}`}>
                        <div onClick={() => { this.setPitch(); RightBoxState._3D = false; }}>
                            <img src={twoUrl} alt='图片找不到' />
                            <div>2D平面图</div>
                        </div>
                        <div onClick={() => { this.setPitch(); RightBoxState._3D = true; }}>
                            <img src={threeUrl} alt='图片找不到' />
                            <div>3D平面图</div>
                        </div>
                    </div>
                </div>
                <div class={route_type}>
                    <div>路线选择</div>
                    <div class={`flex-between ${route_content}`}>
                        {this.planContent.map(item => {
                            return <div onClick={() => { RightBoxState.StoreRouteType = item.type; }}>
                                <img src={item.img} alt='图片找不到' />
                                <div>{item.type}</div>
                            </div>;
                        })}
                    </div>
                </div>
                <div class={`flex-between ${voice}`}>
                    <div>语音播报</div>
                    <div class={voice_btn} onClick={() => { this.clickSwitchBtn = !this.clickSwitchBtn; }}>
                        <div class={switch_btn} style={{ left: `${this.clickSwitchBtn ? '23px' : '2px'}` }}></div>
                    </div>
                </div>
            </div>
        </div >;
    },
});
import { defineComponent, reactive } from 'vue';
import {
    right_box, map_type, type_content, route_type, route_content, voice, voice_btn, switch_btn, selected, title
} from './RightSet.module.scss';

import twoUrl from '@/assets/img/twoD.png';
import threeUrl from '@/assets/img/threeD.png';
import lastestUrl from '@/assets/img/lastest2.png';
import straightUrl from '@/assets/img/straight2.png';
import staircaseUrl from '@/assets/img/staircase2.png';
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
    StoreRouteType: '距离最短',
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
                img: staircaseUrl,
                type: '扶梯',
            }, {
                img: straightUrl,
                type: '直梯',
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
                <div class={title}>地图类型</div>
                <div class={map_type}>
                    <div class={`flex-between ${type_content}`}>
                        <div onClick={() => { this.setPitch(); RightBoxState._3D = false; }}>
                            <img src={twoUrl} alt='图片找不到' style={{ border: `${RightBoxState._3D ? '0' : '1px solid #0074ED'}` }} />
                            <div style={{ color: `${RightBoxState._3D ? '#5D5D5D' : '#0074ED'}` }}>2D平面图</div>
                            <div class={selected} style={{ display: `${RightBoxState._3D ? 'none' : 'block'}` }}>√</div>
                        </div>
                        <div onClick={() => { this.setPitch(); RightBoxState._3D = true; }}>
                            <img src={threeUrl} alt='图片找不到' style={{ border: `${RightBoxState._3D ? '1px solid #0074ED' : '0'}` }} />
                            <div style={{ color: `${RightBoxState._3D ? '#0074ED' : '#5D5D5D'}` }}>3D平面图</div>
                            <div class={selected} style={{ display: `${RightBoxState._3D ? 'block' : 'none'}` }}>√</div>
                        </div>
                    </div>
                </div>
                <div class={title}>路线选择</div>
                <div class={route_type}>
                    <div class={`flex-between ${route_content}`}>
                        {this.planContent.map(item => {
                            return <div onClick={() => { RightBoxState.StoreRouteType = item.type; }}>
                                <div style={{ background: `${RightBoxState.StoreRouteType === item.type ? '#0074ED' : '#fff'}` }}>
                                    <img src={item.img} alt='图片找不到' />
                                </div>
                                <div style={{ color: `${RightBoxState.StoreRouteType === item.type ? '#0074ED' : '#5D5D5D'}` }}>{item.type}</div>
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
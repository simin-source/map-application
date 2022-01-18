import { defineComponent, reactive } from 'vue';

import { mapManager } from '@/map/MapManager';
import { radian2Angle } from '@/utils/base';

import compassArrows from './compass_arrows.png';
import compassBG from './compass_background.png';
import compassFG from './compass_foreground.png';

import {
    compass_arrows, compass_bg, compass_container, compass_disk, compass_fg,
    BL, BR, TL, TR
} from './Compass.module.scss';

export const compassState = reactive({
    // bearing: 0,
    bearing: 1,
    pitch: 0,
    isShow: true,
});

export default defineComponent({
    name: 'Compass',
    render() {
        const { bearing, pitch } = compassState;
        return bearing ? <div class={compass_container} style={{ display: `${compassState.isShow ? 'block' : 'none'}` }} onClick={this.reset} >
            <img src={compassBG} class={compass_bg} style={{ transform: `rotate(${bearing}deg)` }} />
            <div class={compass_disk} style={{ transform: `rotateX(${pitch}deg)` }}>
                <img src={compassArrows} class={compass_arrows} />
                <div class={compass_fg} style={{ transform: `translateX(-50%) translateY(-50%) rotate(${bearing}deg)` }}>
                    <img src={compassFG} />
                    <div class={TL} />
                    <div class={TR} />
                    <div class={BL} />
                    <div class={BR} />
                </div>
            </div>
        </div> : null;
    },
    mounted() {
        mapManager.onReady(centmap => {
            const opt = centmap.getOptions();
            if (opt) compassState.pitch = opt.pitch;
            centmap.on('rotate', () => {
                const bearing = centmap.getAngle();
                const angle = radian2Angle(bearing);
                compassState.bearing = angle;
            });
            centmap.on('pitch', () => {
                const pitch = centmap.getPitch();
                const angle = radian2Angle(pitch);
                compassState.pitch = angle;
            });
        });
    },
    methods: {
        reset() {
            const { centmap } = mapManager;
            if (!centmap) return;
            mapManager.angleTo(0);
            mapManager.pitchTo(0);
        },
    },
});
import { defineComponent, reactive } from 'vue';

import Icon from '@/components/icon/Icon';
import { mapManager } from '@/map/MapManager';
import twoD from '@/assets/img/2D.png';
import threeD from '@/assets/img/3D.png';

import {
    button
} from './Stereoscopic.module.scss';

export const StereoscopicState = reactive({
    _3D: true,
    ready: false,
    isShow: true,
});
let _easeing = false;

export default defineComponent({
    name: 'Stereoscopic',
    render() {
        const { _3D, ready } = StereoscopicState;
        return ready ? <div class={button} style={{ display: `${StereoscopicState.isShow ? 'flex' : 'none'}` }} onClick={this.setPitch}>
            {/* <Icon type="car" size={18} color={_3D ? '#5781ff' : '#555555'} />
            <span style={{ color: _3D ? '#5781ff' : '#555555' }}>{_3D ? '3D' : '2D'}</span> */}
            <img src={`${_3D ? threeD : twoD}`} alt='图片找不到'/>
        </div> : null;
    },
    mounted() {
        mapManager.onReady(centmap => {
            StereoscopicState.ready = !!centmap;
            const init_3D = () => {
                const pitch = centmap.getPitch() as number;
                StereoscopicState._3D = !!(+pitch.toFixed(2));
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
});
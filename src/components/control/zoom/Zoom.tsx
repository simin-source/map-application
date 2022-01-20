import { animate, linear } from 'popmotion';
import { defineComponent, reactive } from 'vue';

import Icon from '@/components/icon/Icon';
import { mapManager } from '@/map/MapManager';
import { FloorState } from '@/components/control/floor/Floor';

import {
    zoomContainer
} from './Zoom.module.scss';
import { MapObject } from '@/map/Map';

export const zoomState: {
    centmap?: { [key: string]: any };
    isShow: boolean;
} = reactive({
    centmap: undefined,
    isShow: true,
});

export default defineComponent({
    name: 'Zoom',
    render() {
        const { centmap } = zoomState;
        return centmap ? (
            <div class={zoomContainer} style={{ display: `${zoomState.isShow ? 'block' : 'none'}` }}>
                <ul>
                    <li class="flex-center" onClick={this.zoomIn}><Icon type="add" color="#7d7562" size={18} /></li>
                    <li class="flex-center" onClick={this.zoomOut}><Icon type="minus" color="#7d7562" size={18} /></li>
                </ul>
            </div>
        ) : null;
    },
    mounted() {
        mapManager.onReady(centmap => {
            zoomState.centmap = centmap;
        });
    },
    methods: {
        zoomIn() {
            const { centmap } = zoomState;
            if (centmap) {
                const zoom = centmap.getZoom() as number;
                this.zoomTo(zoom * 1.65);
            }
        },
        zoomOut() {
            const { centmap } = zoomState;
            if (centmap) {
                const zoom = centmap.getZoom() as number;
                this.zoomTo(zoom * 0.6);
            }
        },
        zoomTo(to: number) {
            if (to > 0.346) {
                FloorState.isShow = true;
                MapObject.isCarBtn = true;
            } else {
                FloorState.isShow = false;
                MapObject.isCarBtn = false;
            }
            const { centmap } = zoomState;
            if (!centmap) return;
            mapManager.zoomTo(to);
        },
    },
});
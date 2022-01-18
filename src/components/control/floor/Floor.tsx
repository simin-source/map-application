import { animate } from 'popmotion';
import { defineComponent, reactive } from 'vue';

import { Loading } from '@/components/loading/Loading';
import { mapManager } from '@/map/MapManager';

import {
    active, down, floorContainer, scroll_box, up
} from './Floor.module.scss';
import { FloorBoxState } from '@/components/floorBox/FloorBox';

export const FloorState: {
    centmap?: { [key: string]: any };
    isShow: boolean;
} = reactive({
    centmap: undefined,
    isShow: false,
});

export default defineComponent({
    name: 'Floor',
    props: {
        length: {
            type: Number,
            default: 3,
        },
    },
    data() {
        return {
            isActive: '',
            floorInfo: ['W', 'WU', 'F1', 'F2', 'F3', 'F4'],
            currentBuildingID: undefined,
        } as {
            isActive: string;
            floorInfo: any[];
            currentBuildingID?: number;
        };
    },
    render() {
        const { centmap } = FloorState;
        const { length } = this;
        return centmap ? (
            <div class={floorContainer} style={{ display: `${FloorState.isShow ? 'block' : 'none'}` }}>
                {this.floorInfo.length > length ? <div class={`flex-center ${up}`} onClick={() => this.scrollTo('add')} /> : null}
                <ul class={scroll_box} style={{ maxHeight: `${length * 35}px` }}>
                    {
                        this.floorInfo.length > 1 ? this.floorInfo.map((floor: string, index: number) => {
                            return <li key={index} class="flex-center" onClick={() => this.changeFloor(index)}>
                                <span class={floor === this.isActive ? active : undefined}>{floor}</span>
                            </li>;
                        }) : null
                    }
                </ul>
                {this.floorInfo.length > length ? <div class={`flex-center ${down}`} onClick={() => this.scrollTo('less')} /> : null}
            </div>
        ) : null;
    },
    mounted() {
        mapManager.onReady(centmap => {
            FloorState.centmap = centmap;
            centmap.on('switchBuilding', ({ info }: { info: any }) => {
                const { floorList, currentFloor, buildingID } = info;
                if (typeof buildingID === 'number') this.currentBuildingID = buildingID;
                if (floorList as [] && typeof currentFloor === 'number') {
                    // this.floorInfo = floorList;
                    // this.isActive = floorList[currentFloor];
                    // this.scrollTo(currentFloor, 0);
                    this.floorInfo = ['W', 'WU', 'F1', 'F2', 'F3', 'F4'];
                    this.isActive = this.floorInfo[1];
                    this.scrollTo(1, 0);
                } else {
                    this.floorInfo = [];
                }
            });
        });
    },
    methods: {
        changeFloor(index: number) {
            const { centmap } = FloorState;
            if (centmap) {
                this.isActive = this.floorInfo[index];
                FloorBoxState.FloorBoxTitle = `${this.isActive} | 广州太古汇`
                // 切换楼层
                Loading.show();
                centmap.switchFloor(this.currentBuildingID, index, () => {
                    Loading.hide();
                });
                this.scrollTo(index);
            }
        },
        scrollTo(index: number | 'less' | 'add', duration = 100) {
            const scrollEle = document.querySelector(`.${scroll_box}`);
            if (!scrollEle) return;
            let top = scrollEle.scrollTop;
            if (typeof index === 'number') {
                top = (index - Math.round(this.length / 2) + 1) * 35;
            } else if (index === 'less') {
                top += this.length * 35;
            } else {
                top -= this.length * 35;
            }
            animate({
                from: scrollEle.scrollTop,
                to: top,
                onUpdate(p) {
                    scrollEle.scrollTo({
                        top: p,
                    });
                },
                duration,
            });
        },
    },
});
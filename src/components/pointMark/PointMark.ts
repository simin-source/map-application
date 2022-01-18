import previewIconImg from '@/assets/img/position.png';
import { mapManager } from '@/map/MapManager';
import { PointType } from '@/types';
import endIconImg from './img/end.png';
import startIconImg from './img/start.png';

class MarkerManager {
    manager: any;

    constructor(id: string, type: 'end' | 'start' | 'preview', size = 32) {
        // 创建mark位置元素
        const Icon = this._iconBox = document.createElement('div');
        const IconImg = this._iconImg = document.createElement('img');

        IconImg.src = this.getIconType(type);
        Icon.appendChild(IconImg);

        IconImg.style.width = '100%';
        IconImg.style.userSelect = 'none';
        Icon.style.position = 'absolute';
        Icon.style.width = `${size}px`;
        //图标点击事件
        Icon.addEventListener('click', e => {
            e.stopPropagation();
            if (this._onClick) this._onClick();
        });

        //加载
        mapManager.onReady(centmap => {
            const { markerManager } = centmap;
            this.manager = markerManager;

            markerManager.addMarker(id, {
                marker: Icon,
            });
            markerManager.hide(id);
        });
    }

    private _onClick?: () => void;
    private _iconBox: HTMLDivElement;
    private _iconImg: HTMLImageElement;

    setSize(size: number) {
        this._iconBox.style.width = `${size}px`;
    }

    changeIconType(type: 'end' | 'start' | 'preview') {
        this._iconImg.src = this.getIconType(type);
    }

    set onclick(fun: () => void) {
        this._onClick = fun;
    }

    private getIconType(type: 'end' | 'start' | 'preview') {
        switch (type) {
            case 'end':
                return endIconImg;
            case 'start':
                return startIconImg;
            default:
                return previewIconImg;
        }
    }
}

export class PointMark {
    constructor(private id: string, type: 'end' | 'start' | 'preview' = 'end', size = 32) {
        this.Marker = new MarkerManager(id, type, size);

        mapManager.onReady(Cmap => {
            Cmap.on('switchBuilding', ({ info }: {info: any}) => {
                const { floorList, buildingID, currentFloor } = info;
                if (typeof buildingID === 'number') this._currentBuildingId = buildingID;
                if (floorList && typeof currentFloor === 'number') {
                    this._currentFloorName = floorList[currentFloor];
                    this.toggleIconVisible();
                }
            });

            Cmap.on('switchFloor', ({ info }: {info: any}) => {
                const { floorList, buildingID, currentFloor } = info;
                if (typeof buildingID === 'number') this._currentBuildingId = buildingID;
                if (floorList && typeof currentFloor === 'number') {
                    this._currentFloorName = floorList[currentFloor];
                    this.toggleIconVisible();
                }
            });
        });

        // this.show('currentBuilding');
    }

    private Marker: MarkerManager;

    private _markData?: PointType;
    private _currentRdFl?: number;
    private _currentBuildingId?: number;
    private _currentFloorName?: string;
    private _currentbrandId?: string; //楼层+品牌名字

    set onClick(fun: () => void) {
        this.Marker.onclick = fun;
    }

    setSize = (size: number) => {
        this.Marker.setSize(size);
    }

    changeIconType = (type: 'end' | 'start' | 'preview') => {
        this.Marker.changeIconType(type);
    }

    show = (data: PointType) => {
        try {
            this._markData = {
                ...data,
                buildingID: this._currentBuildingId,
            };
            const { location, height } = data;
            this.Marker.manager.setLngLat(this.id, location, height);
            this.Marker.manager.show(this.id);
        } catch (error) {
            throw error;
        }
    }

    hide = () => {
        this._markData = undefined;
        this.Marker.manager.hide(this.id);
    }

    // 楼层不同控制显示与隐藏
    private toggleIconVisible() {
        const { _markData, _currentBuildingId, _currentFloorName } = this;
        if (_markData && typeof _markData.fl_name === 'string') {
            this.Marker.manager.hide(this.id);
            // rdFl为null,没有默认buildingID
            if (_currentBuildingId === _markData.buildingID && _currentFloorName === _markData.fl_name) this.Marker.manager.show(this.id);
        }
    }
}
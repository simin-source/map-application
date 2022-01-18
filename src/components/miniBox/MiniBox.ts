import { MapObject } from '@/map/Map';
import { mapManager } from '@/map/MapManager';
import { PointType } from '@/types';
import { StoreState } from '../storeBox/StoreBox';
import { compassState } from '../control/compass/Compass';
import { FloorState } from '../control/floor/Floor';
import { StereoscopicState } from '../control/stereoscopic/Stereoscopic';
import { zoomState } from '../control/zoom/Zoom';
import { FloorBoxState } from '../floorBox/FloorBox';
import { SearchState } from '../search/search';
import clothIconImg from './img/cloth.png';
import testImg from '@/assets/img/uniqlo.png';

import {
    active, brand_name, info_box, mini_arrow, mini_box, tips_box
} from './MiniBox.module.scss';

class MarkerManager {
    manager: any;

    constructor(id: string) {
        // 创建minibox元素
        const miniBox = document.createElement('div');
        const brandNameBox = document.createElement('div');
        const brandTitle = document.createElement('div');
        const brandName = this._brandName = document.createElement('div');
        const brandImg = document.createElement('img');
        const brandActiveBox = this._brandActive = document.createElement('div');
        const activeTitle = document.createElement('div');
        const activeMore = document.createElement('div');
        // const arrow = this._brandActive = document.createElement('div');

        miniBox.appendChild(brandNameBox);
        miniBox.appendChild(brandActiveBox);
        // miniBox.appendChild(arrow);
        brandNameBox.appendChild(brandTitle);
        brandNameBox.appendChild(brandName);
        brandNameBox.appendChild(brandImg);
        brandActiveBox.appendChild(activeTitle);
        brandActiveBox.appendChild(activeMore);

        miniBox.className = mini_box;
        brandNameBox.className = info_box;
        brandName.className = brand_name;
        brandImg.style.position = 'absolute';
        brandImg.style.width = '50px';
        brandImg.style.height = '50px';
        brandImg.style.top = '10px';
        brandImg.style.right = '15px';
        brandActiveBox.className = tips_box;
        activeTitle.className = active;
        activeMore.style.fontSize = '10px';
        activeMore.style.paddingTop = '5px';
        // arrow.className = mini_arrow;

        brandTitle.innerHTML = '品牌名称';
        brandImg.src = testImg;
        activeTitle.innerHTML = '秋冬新品服饰99元';
        activeMore.innerHTML = '点击查看更多 >';

        //加载
        mapManager.onReady(centmap => {
            const { markerManager } = centmap;
            this.manager = markerManager;
            markerManager.addMarker(id, {
                marker: miniBox,
            });
            markerManager.hide(id);
        });
    }

    private _onClick?: () => void;
    private _brandName: HTMLDivElement;
    private _brandActive: HTMLDivElement;

    set onclick(fun: () => void) {
        this._onClick = fun;
    }

    setBrandInfo = (brandInfo: { [key: string]: any }) => {
        const { name } = brandInfo;
        this._brandName.innerHTML = name;
    }
}

export class MiniBox {
    constructor(private id: string) {
        this.Marker = new MarkerManager(id);

        mapManager.onReady(Cmap => {
            Cmap.on('switchBuilding', ({ info }: { info: any }) => {
                const { floorList, buildingID, currentFloor } = info;
                if (typeof buildingID === 'number') this._currentBuildingId = buildingID;
                if (floorList && typeof currentFloor === 'number') {
                    this._currentFloorName = floorList[currentFloor];
                    this.toggleIconVisible();
                }
            });

            Cmap.on('switchFloor', ({ info }: { info: any }) => {
                const { floorList, buildingID, currentFloor } = info;
                if (typeof buildingID === 'number') this._currentBuildingId = buildingID;
                if (floorList && typeof currentFloor === 'number') {
                    this._currentFloorName = floorList[currentFloor];
                    this.toggleIconVisible();
                }
            });
        });
    }

    private Marker: MarkerManager;

    private _markData?: PointType;
    private _currentFloorName?: string;
    private _currentBuildingId?: number;
    // private _currentbrandId?: string; //楼层+品牌名字

    set onClick(fun: () => void) {
        this.Marker.onclick = fun;
    }
    setBrandInfo = (info: any) => {
        this.Marker.setBrandInfo(info);
    }

    show = (data: PointType, brandInfo: any) => {
        this.setBrandInfo(brandInfo);
        compassState.isShow = false;
        FloorState.isShow = false;
        zoomState.isShow = false;
        StereoscopicState.isShow = false;
        FloorBoxState.isShow = false;
        SearchState.isShowInput = false;
        MapObject.isCarBtn = false;
        SearchState.isShowSearch = false;
        StoreState.isStoreBox = true;
        MapObject.isBackIndex = true;
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
            if (_currentFloorName === _markData.fl_name && _currentBuildingId === _markData.buildingID) this.Marker.manager.show(this.id);
        }
    }
}
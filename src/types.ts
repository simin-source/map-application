export interface PointType {
    fl_name?: any; //展示默认楼层
    location: [number, number];
    rdFl: number;
    height?: number;
    buildingID?: number;
    resource?: any;
    name?: string;
}
export interface NavInfoItemType {
    description: string;
    distance: number;
    direction: number;
    layer: string;
}

export interface VoiceDataItemType {
    description: string;
    distance: number;
    veer: string;
    ids: string[];
    layer: string;
}
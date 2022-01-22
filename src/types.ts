export interface PointType {
    bd_name?: string;
    fl_name?: any; //展示默认楼层
    location: [number, number];
    center?: [number, number, number];
    rdFl: number;
    height?: number;
    buildingID?: number;
    resource?: any;
    name?: string;
    number?:string; //车位号
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
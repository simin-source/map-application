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

export interface SearchResType {
    bd_name: string;
    cat_id: number;
    center: [number, number, number];
    fl_id: number;
    fl_name: string;
    index: number;
    name: string;
    number: string;
    rd_fl: number;
    seq_id: number;
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
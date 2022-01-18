interface FeatureType {
    layer: any;
    properties: any;
    source: string;
    state: any;
    type: string;
    geometry: {coordinates: number[][][]; type: string};
}

interface PropertiesType {
    bound?: string;
    buildingID?: string;
    buildingName?: string;
    category?: number;
    centre?: string;
    color?: string;
    floorID?: string;
    floorName?: string;
    height?: number;
    id?: string;
    name?: string;
    strokeColor?: string;
}

const DEF_PI = 3.14159265359; // PI
const DEF_2PI = 6.28318530712; // 2*PI
const DEF_PI180 = 0.01745329252; // PI/180.0
const DEF_R = 6370693.5; // radius of earth

type findType = (feature: FeatureType) => boolean | [keyof PropertiesType, string | symbol | number];

export function findFeature(features: FeatureType[], type: findType) {
    return features.find(item => {
        if (type instanceof Array) {
            const [key, value] = type;
            return item.properties[key] === value;
        } else {
            return type(item);
        }
    });
}

function floatCompute(n1: number, n2: number) {
    const n1FlotLen = `${n1}`.split('.')[1] ? `${n1}`.split('.')[1].length : 0;
    const n2FlotLen = `${n2}`.split('.')[1] ? `${n2}`.split('.')[1].length : 0;
    const mul = n1FlotLen >= n2FlotLen ? Math.pow(10, n1FlotLen) : Math.pow(10, n2FlotLen);
    return ((n1 * mul) - (n2 * mul)) / mul;
}

export function findClosestPoint(current: [number, number], targets: Array<[number, number]>): [number, number] | undefined {
    return [...targets].sort((prev: [number, number], next: [number, number]) => {
        const distanceP = Math.sqrt(Math.pow(floatCompute(prev[0], current[0]), 2) + Math.pow(floatCompute(prev[1], current[1]), 2));
        const distanceN = Math.sqrt(Math.pow(floatCompute(next[0], current[0]), 2) + Math.pow(floatCompute(next[1], current[1]), 2));
        return distanceP - distanceN;
    })[0];
}

export function _4326to3857({ lng, lat }: any): any {
    const x = lng * 20037508.34 / 180;
    const y = Math.log(Math.tan((lat + 90) * Math.PI / 360)) / Math.PI * 20037508.34;
    return { lng: x, lat: y };
}

export function _3857to4326({ lng, lat }: any): any {
    const x = lng / 20037508.34 * 180;
    const y = Math.atan(Math.pow(Math.E, lat / 20037508.34 * Math.PI)) / Math.PI * 360 - 90;
    return { lng: x, lat: y };
}

export function computeDistance(current: [number, number], target: [number, number]) {
    return Math.sqrt(Math.pow(floatCompute(target[0], current[0]), 2) + Math.pow(floatCompute(target[1], current[1]), 2));
}

export function radian2Angle(radian: number) {
    return radian * 180 / Math.PI;
}

export function  angle2Radian(angle: number) {
    return angle * Math.PI / 180;
}
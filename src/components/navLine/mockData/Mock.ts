import { mapManager } from '@/map/MapManager';

import data from './data.json';

let store: Array<[number, number]> = [];

mapManager.onReady(centmap => {
    centmap.on('complete', () => {
        const d: Array<[number, number]> = [];
        data.forEach((i, ind) => {
            if (ind % 2 === 1) d.push([i, data[ind - 1]]);
        });
        setTimeout(() => {
            store = d.map(i => {
                return centmap.wgs84ToCmapCoord(...i);
            });
            // console.log(JSON.stringify(store));
        }, 500);
    });
});

export function getStartAndEnd() {
    return [store[0], store[store.length - 1]];
}

export function naviSimulate() {
    const { centmap } = mapManager;
    if (!centmap) return [];
    const routeManager = centmap.routeManager;
    return store.map(i => {
        const adsorbP = routeManager.attach(...i);
        return i[0] === adsorbP[0] && i[1] === adsorbP[1] ? undefined : [adsorbP[0], adsorbP[1], adsorbP[3]] as [number, number, number];
    });
}
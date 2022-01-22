export class Gesture {
    constructor(private _centmap: any) {
        _centmap.on('switchBuilding', ({ info }: { info: any }) => {
            const { floorList, buildingID, rdFl } = info;
            if (floorList && typeof rdFl === 'number' && typeof buildingID === 'number') {
                this._currentRdFls[`${buildingID}`] /* = this._currentRdFl */ = rdFl;
            }
        });

        _centmap.on('switchFloor', ({ info }: { info: any }) => {
            const { floorList, buildingID, rdFl } = info;
            if (floorList && typeof rdFl === 'number' && typeof buildingID === 'number') {
                this._currentRdFls[`${buildingID}`] /* = this._currentRdFl */ = rdFl;
            }
        });
    }

    private _currentRdFls: {
        [key: string]: number;
    } = {};

}
import { MapObject } from "@/map/Map";
import { defineComponent, reactive } from "vue";
import { compassState } from "../control/compass/Compass";
import { FloorState } from "../control/floor/Floor";
import { StereoscopicState } from "../control/stereoscopic/Stereoscopic";
import { zoomState } from "../control/zoom/Zoom";
import { FloorBoxState } from "@/components/floorBox/FloorBox";
import { SearchState } from "@/components/search/search";
import powerImg from '@/assets/img/newpower.png';
import transformUrl from '@/assets/img/transform.png';
import timeUrl from '@/assets/img/time.png';
import locationUrl from '@/assets/img/location.png';
import del1 from '@/assets/img/del1.png';
import del2 from '@/assets/img/del2.png';
import { PointMark } from '@/components/pointMark/PointMark';

import {
    car_box,
    car_brand,
    car_input,
    cph_wrap,
    cph_wrap_shadow,
    keyboard_wrap,
    k_del,
    keyboard,
    k_done,
    car_num,
    car_btn,
    num_btn,
    to_num,
    car_bottom,
    car_start,
    select_start,
    route_overview,
    route_btn,
    navigate,
    power,
    provice,
    car_tip
} from "./CarBox.module.scss";
import { PointType } from "@/types";
import { Centmap } from "@/native/Centmap";
import { navigation } from "../navInfo/NavInfo";

interface PoiInfoType {
    bd_name: string;
    fl_name: string | null;
    number: string;
    name: string;
    lnglat: [number, number];
    center: [number, number, number];
    seqId: number;
    fl_id: number;
    index: number;
    rdFl: number;
}

export const CarState: {
    isCarBrand: boolean;
    isCarNum: boolean;
    isCarStart: boolean;
    confirmStart: boolean;
    isOverview: boolean;
    isNavgate: boolean;
    isNavgateInfo: boolean;
    parkingNum: string;
    carBrand: string;
    parkingNumStore: PoiInfoType[];
} = reactive({
    isCarBrand: false,
    isCarNum: false,
    isCarStart: false,
    confirmStart: false,
    isOverview: false,
    isNavgate: false,
    isNavgateInfo: false,
    parkingNum: '',
    carBrand: '',
    parkingNumStore: [],
});

let carPosiMarker: PointMark;
carPosiMarker = new PointMark('toCar', 'end');

function floatCompute(n1: number, n2: number) {
    const n1FlotLen = `${n1}`.split('.')[1] ? `${n1}`.split('.')[1].length : 0;
    const n2FlotLen = `${n2}`.split('.')[1] ? `${n2}`.split('.')[1].length : 0;
    const mul = n1FlotLen >= n2FlotLen ? Math.pow(10, n1FlotLen) : Math.pow(10, n2FlotLen);
    return ((n1 * mul) - (n2 * mul)) / mul;
}

export function computeDistance(current: [number, number], target: [number, number]) {
    return Math.sqrt(Math.pow(floatCompute(target[0], current[0]), 2) + Math.pow(floatCompute(target[1], current[1]), 2));
}

export function newDestination() {
    const { parkingNumStore } = CarState;
    const navDestination = navigation.navDestination;
    if (navDestination) {
        let maxD = Number.MAX_VALUE;
        let target: PoiInfoType | undefined;
        const desXY = navDestination.location;
        parkingNumStore.forEach(i => {
            const currXY = [i.center[0], i.center[1]] as [number, number];
            // 计算目的地
            const d = computeDistance(desXY, currXY);
            if (d < maxD) {
                maxD = d;
                target = i;
            }
        });
        if (target) {
            const [x, y, height] = target.center;
            navigation.newDestination({
                location: [x, y],
                height,
                rdFl: target.rdFl,
                resource: target,
            });
            carPosiMarker.hide();
        }
    }
    return navDestination;
}

export default defineComponent({
    name: "CarBox",
    data: function () {
        return {
            provice: [
                "京",
                "津",
                "晋",
                "翼",
                "蒙",
                "辽",
                "黑",
                "吉",
                "沪",
                "苏",
                "浙",
                "皖",
                "闵",
                "赣",
                "鲁",
                "豫",
                "鄂",
                "湘",
                "粤",
                "桂",
                "琼",
                "川",
                "贵",
                "云",
                "藏",
                "渝",
                "陕",
                "甘",
                "青",
                "宁",
                "新",
                "使",
                "港",
                "澳",
                "台",
                "学",
                "虚",
                "W",
            ],
            numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
            letters: [
                "Q",
                "W",
                "E",
                "R",
                "T",
                "Y",
                "U",
                "P",
                "学",
                "领",
                "A",
                "S",
                "D",
                "F",
                "G",
                "H",
                "J",
                "K",
                "L",
                "警",
                "Z",
                "X",
                "C",
                "V",
                "B",
                "N",
                "M",
                "港",
                "澳",
            ],
            defaultCph: ['苏', '', '', '', '', '', ''],
            cph: [] as any[],
            defaultCarNum: ['B', '1', '6', '6', '6'],
            CarNumInfo: 'B1666',
            CarStart: {
                name: '我的位置',
            },
            show_keyboard: false,
            isShowBottom: true,
            delState: false,
            isTranslate: false,
            currentMarkData: {} as PointType,
        };
    },
    watch: {
        cph: {
            handler() {
                this.defaultCph = this.defaultCph?.map((item, index) => {
                    if (index === this.cph.length - 1) {
                        return this.cph[index];
                    } else {
                        return item;
                    }
                })
            },
            deep: true,
        },
        CarNumInfo(value) {
            console.log('-----------');
            console.log(value);

            if (!this.delState) {
                this.defaultCarNum = this.defaultCarNum?.map((item, index) => {
                    if (index < value.split('').length) {
                        return value.split('')[index];
                    } else {
                        return item;
                    }
                })
            } else {
                this.defaultCarNum = this.defaultCarNum?.map((item, index) => {
                    if (index > value.length - 1) {
                        return '';
                    } else {
                        return item;
                    }
                })
            }
        },
    },
    created() {
        // 初始化parkingNumStore
        // CarState.parkingNumStore
    },
    methods: {
        clickBoard: function (e: any) {
            e.stopPropagation();
            if (e.target.tagName.toLowerCase() === "span" || e.target.tagName.toLowerCase() === "img") {
                if (e.target.className.indexOf("k") == -1 && this.cph.length < 7) {
                    this.cph.push(e.target.textContent);
                }

                if (e.target.className.split(" ")[0] === "k-del") {
                    this.cph.pop();
                    this.defaultCph = this.defaultCph?.map((item, index) => {
                        if (index === this.cph.length) {
                            return '';
                        } else {
                            return item;
                        }
                    })
                }

                if (e.target.className.split(" ")[0] === "k-done") {
                    // this.setPlateNumber(this.cph)
                    this.cphInputClick();
                    this.$emit("plate-number", this.cph);
                }
            }
        },
        cphInputClick: function () {
            this.show_keyboard = !this.show_keyboard;
            this.isShowBottom = !this.isShowBottom;
        },
        searchCar(parkingNum?: string) {
            console.log('开始寻车');
            const { parkingNumStore } = CarState;
            if (parkingNum) {
                // 车位号查询
                CarState.parkingNum = `${this.defaultCarNum}`;
                // CarState.isCarStart = true;
                // CarState.isCarNum = false;
                // CarState.isCarBrand = false;
                const res = parkingNumStore.filter(i => i.number.toLowerCase().includes(parkingNum.toLowerCase()));
                console.log('车位号寻车' + parkingNum);
                if (res.length < 2) {
                    this.showCurrentParking(res[0])
                }
            } else {
                // 车牌查询
                CarState.carBrand = `${this.defaultCarNum}`;
                // CarState.isCarNum = false;
                // CarState.isCarBrand = false;
                // CarState.isCarStart = false;
                // CarState.confirmStart = true;
                const carBrand = this.cph.join('');
                if (carBrand.length < 7) return;
                const res = parkingNumStore.filter(item => item.bd_name === carBrand);
                console.log('车牌寻车' + carBrand);
                if (res.length < 2) {
                    this.showCurrentParking(res[0])
                }
            }
        },
        showCurrentParking(res: PoiInfoType) {
            //相当于Cmap绑定的click
            const { center, rdFl = 0, } = res;
            const [lng, lat, height] = center;
            const info: PointType = {
                location: [lng, lat] as [number, number],
                height: height ? height : 0.9,
                rdFl,
                resource: res,
            };
            this.currentMarkData = info;
            console.log('展示mark');
            carPosiMarker.show(info)
            // 进入选择起点页
            CarState.isCarNum = false;
            CarState.isCarBrand = false;
            CarState.isCarStart = true;
        },
        confirm(mock: boolean) {
            navigation.destination(this.currentMarkData, mock);
        }
    },
    render() {
        return (
            <div class={car_box} style={{ display: `${CarState.isCarNum || CarState.isCarBrand || CarState.isCarStart || CarState.isOverview || CarState.isNavgate ? 'block' : 'none'}` }}>
                <div class={car_num} style={{ display: `${CarState.isCarNum ? 'flex' : 'none'}` }}>
                    <div>输入车位号 : </div>
                    <input
                        type="text"
                        value={this.CarNumInfo}
                        onKeydown={e => {
                            if (e && e.keyCode === 8) {
                                // 按 删除键
                                this.delState = true;
                                let temp = this.CarNumInfo.split('');
                                temp.pop();
                                this.CarNumInfo = temp.join('');
                                console.log('删除');
                                console.log(this.CarNumInfo);
                            } else {
                                this.delState = false;
                            }
                        }}
                        onChange={(e: any) => {
                            // console.log('==============');
                            // console.log(e.target.value); //123
                            // console.log(this.CarNumInfo); //1234
                            if (!this.delState) {
                                this.CarNumInfo = e.target?.value.slice(0, 5);
                                console.log('添加');
                                console.log(this.CarNumInfo);
                            }
                        }}
                    />
                    <div class={car_input}>
                        <div>
                            <div>楼层</div>
                            {this.defaultCarNum?.map((item, index) => {
                                if (index < 2) {
                                    return <div
                                        class={`${cph_wrap} ${cph_wrap_shadow}`}
                                        onClick={this.cphInputClick}
                                    >
                                        {item}
                                    </div>
                                }
                            })}
                        </div>
                        <div>
                            <div>号码</div>
                            {this.defaultCarNum?.map((item, index) => {
                                if (index > 1) {
                                    return <div
                                        class={`${cph_wrap} ${cph_wrap_shadow}`}
                                        onClick={this.cphInputClick}
                                    >
                                        {item}
                                    </div>
                                }
                            })}
                        </div>
                    </div>
                    <div>
                        <div class={car_btn} onClick={() => { this.searchCar(`${this.defaultCarNum}`) }}>一键寻车</div>
                    </div>
                </div>
                <div class={car_brand} style={{ display: `${CarState.isCarBrand ? 'flex' : 'none'}` }}>
                    <div>手动输入车牌</div>
                    <div class={car_input}>
                        <div class={`${cph_wrap} ${cph_wrap_shadow}`} style={{ width: '22%' }} onClick={this.cphInputClick}>
                            {this.defaultCph?.map((item, index) => {
                                if (index < 2) {
                                    return (
                                        <span>
                                            {item}
                                        </span>
                                    );
                                }
                            })}
                        </div>
                        <strong style={{ fontSize: '35px', color: '#7d7562', paddingBottom: '5px' }}>·</strong>
                        <div class={`${cph_wrap} ${cph_wrap_shadow}`} style={{ width: 'calc(78% - 40px)' }} onClick={this.cphInputClick}>
                            {this.defaultCph?.map((item, index) => {
                                if (index > 1) {
                                    return (
                                        <span>
                                            {item}
                                        </span>
                                    );
                                }
                            })}
                            <span class={power}><img src={powerImg} alt="图片找不到" /><span>新能源</span></span>
                        </div>
                    </div>
                    <div class={car_bottom} style={{ display: `${this.isShowBottom ? 'block' : 'none'}` }}>
                        <div class={to_num}>
                            <div>默认为系统推荐停车位若车位停于别处请手动输入车位号</div>
                            <div class={num_btn} onClick={() => { CarState.isCarNum = true; CarState.isCarBrand = false; }}>输入车位号</div>
                        </div>
                        <div class='flex-center'>
                            <div class={car_btn} onClick={() => { this.searchCar() }}>一键寻车</div>
                        </div>
                    </div>
                    <div
                        class={keyboard_wrap}
                        onClick={this.clickBoard}
                        style={{ display: `${this.show_keyboard ? "block" : "none"}` }}
                    >
                        {/* <div
                            class={`${keyboard} ${provice}`}
                            style={{
                                display: `${this.cph.length === 7 ? "flex" : "none"}`,
                                justifyContent: "flex-end",
                            }}
                        >
                            <span class={`k-done ${k_done}`}>完成</span>
                        </div> */}
                        {this.cph.length === 0 ? (
                            <div class={provice}>
                                <div class={keyboard}>
                                    {this.provice.slice(0, 10)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.provice.slice(10, 20)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.provice.slice(20, 30)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.provice.slice(30)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                    <span class={`k-del ${k_del}`}>
                                        <img class="k-del" src={del1} alt="图标找不到" />
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div class={provice}>
                                <div
                                    class={keyboard}
                                    style={{ display: `${this.cph.length > 1 ? "flex" : "none"}` }}
                                >
                                    {this.numbers?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.letters.slice(0, 10)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.letters.slice(10, 20)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                </div>
                                <div class={keyboard}>
                                    {this.letters.slice(20)?.map((item) => {
                                        return <span>{item}</span>;
                                    })}
                                    <span class={`k-del ${k_del}`} style={{ width: 'calc(10% - 6px)' }}>
                                        <img class="k-del" src={del2} alt="图标找不到" />
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div class={car_start} style={{ display: `${CarState.isCarStart ? 'flex' : 'none'}` }}>
                    <div class={car_tip}>请输入或点击地图选择起点</div>
                    <div class={select_start}>
                        <div style={{ flexDirection: `${this.isTranslate ? 'column-reverse' : 'column'}` }}>
                            <div>
                                <p style={{ background: '#5880d0' }}></p>
                                {/* <input type="text" value={this.CarStart.name} placeholder="请选择起点" /> */}
                                <input type="text" placeholder="请选择起点" />
                            </div>
                            <div style={{ width: '100%', height: '1px', backgroundColor: '#BBBBBB', padding: '0' }}></div>
                            <div>
                                <p style={{ background: '#D05858' }}></p>
                                <input type="text" value={this.CarNumInfo} readonly />
                            </div>
                        </div>
                        <div style={{ marginLeft: '10px' }} onClick={() => { this.isTranslate = !this.isTranslate; }}>
                            <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                        </div>
                    </div>
                    <div class={car_btn}>
                        <div onClick={() => { this.confirm(true) }}>模拟导航</div>
                        <div onClick={() => { this.confirm(false) }}>一键寻车</div>
                    </div>
                </div>
                <div class={route_overview} style={{ display: `${CarState.isOverview ? 'flex' : 'none'}` }}>
                    <div>
                        <div><img src={locationUrl} style={{ fontSize: '20px' }} alt='图片找不到' />距离210米</div>
                        <div style={{ marginLeft: '63px' }}><img src={timeUrl} alt='图片找不到' />约2分12秒</div>
                    </div>
                    <div class={select_start}>
                        <div style={{ flexDirection: `${this.isTranslate ? 'column-reverse' : 'column'}` }}>
                            <div>
                                <p style={{ background: '#5880d0' }}></p>
                                <input type="text" value={this.CarStart.name} placeholder="请选择起点" />
                            </div>
                            <div style={{ width: '100%', height: '1px', backgroundColor: '#BBBBBB', padding: '0' }}></div>
                            <div>
                                <p style={{ background: '#D05858' }}></p>
                                <input type="text" value={this.CarNumInfo} readonly />
                            </div>
                        </div>
                        <div style={{ marginLeft: '10px' }} onClick={() => { this.isTranslate = !this.isTranslate; }}>
                            <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                        </div>
                    </div>
                    <div class={route_btn} style={{ marginTop: '10px' }}>
                        <div>模拟导航</div>
                        <div style={{ marginLeft: '45px' }} onClick={() => { CarState.isOverview = false; CarState.isNavgate = true; CarState.isNavgateInfo = true; }}>开始导航</div>
                    </div>
                </div>
                <div class={navigate} style={{ display: `${CarState.isNavgate ? 'flex' : 'none'}` }}>
                    <div class={'flex-center'}>
                        <div>距离目的地210米</div>
                    </div>
                    <div class={route_btn}>
                        <div
                            onClick={() => {
                                CarState.isNavgate = false;
                                CarState.isNavgateInfo = false;
                                SearchState.isShowSearch = true;
                                // 控件显示，注意楼层控件需要在指定图层才能显示
                                compassState.isShow = true;
                                zoomState.isShow = true;
                                StereoscopicState.isShow = true;
                                MapObject.isCarBtn = true;
                                if (SearchState.centmap) {
                                    const zoom = SearchState.centmap.getZoom() as number;
                                    if (zoom > 0.346) {
                                        FloorState.isShow = true;
                                        FloorBoxState.isShow = true;
                                        FloorBoxState.isSearchRes = false;
                                        FloorBoxState.FloorBoxTitle = 'F1 | 广州太古汇';
                                    }
                                }
                            }}
                        >
                            退出
                        </div>
                        <div style={{ marginLeft: '45px' }} onClick={() => { CarState.isOverview = false; CarState.isNavgate = false; CarState.isNavgateInfo = true; }}>全览</div>
                    </div>
                </div>
            </div >
        );
    },
});

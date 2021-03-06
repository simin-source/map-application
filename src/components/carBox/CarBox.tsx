import { MapObject } from "@/map/Map";
import { defineComponent, reactive } from "vue";
import powerImg from '@/assets/img/newpower.png';
import transformUrl from '@/assets/img/transform.png';
import del1 from '@/assets/img/del1.png';
import del2 from '@/assets/img/del2.png';

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
    power,
    provice,
    car_tip,
    car_navtop,
    locate_icon,
    detail_locate,
    layer,
    select_btn
} from "./CarBox.module.scss";
import { PointType, SearchResType } from "@/types";
import { navigation, navInfoState } from "../navInfo/NavInfo";
import { StoreState } from "../storeBox/StoreBox";
import SelfInput, { SelfInputState } from "../selfInput/SelfInput";
import PlanBox, { planState } from "../planBox/PlanBox";
import { carNumber, searchStore } from "@/services";
import { PointMark } from "../pointMark/PointMark";

export const CarState: {
    isCarBrand: boolean;
    isCarNum: boolean;
    isCarStart: boolean;
    isOverLine: boolean;
    carNav: boolean;
    parkingNum: string;
    carBrand: string;
    parkingNumStore: PointType[];
} = reactive({
    isCarBrand: false,
    isCarNum: false,
    isCarStart: false,
    isOverLine: false,
    carNav: false,
    parkingNum: '',
    carBrand: '',
    parkingNumStore: [],
});

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
        let target: PointType | undefined;
        const desXY = navDestination.location;
        parkingNumStore.forEach((i: PointType) => {
            const currXY = [i.center?.[0], i.center?.[1]] as [number, number];
            // 计算目的地
            const d = computeDistance(desXY, currXY);
            if (d < maxD) {
                maxD = d;
                target = i;
            }
        });
        if (target) {
            const [x, y, height] = target.center ? target.center : target.location;
            navigation.newDestination({
                location: [x, y],
                height,
                rdFl: target.rdFl,
                resource: target,
            });
            MapObject.endMarker.hide();
        }
    }
    return navDestination;
}

const carTarget = new PointMark('cartarget');

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
            defaultCarNum: ['J', '-', '6', '0', '7'],
            CarNumInfo: 'J-607',
            CarStart: {
                name: '我的位置',
            },
            show_keyboard: false,
            isShowBottom: true,
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
                    this.cphInputClick();
                    this.$emit("plate-number", this.cph);
                }
            }
        },
        cphInputClick: function () {
            this.show_keyboard = !this.show_keyboard;
            this.isShowBottom = !this.isShowBottom;
        },
        searchCar() {
            console.log('开始寻车');
            // const { parkingNumStore } = CarState;
            if (`${this.CarNumInfo.slice(0, 5)}`) {
                // 车位号查询
                CarState.parkingNum = `${this.defaultCarNum.join('')}`;
                console.log('车位号寻车' + CarState.parkingNum);
                // carNumber({ number: CarState.parkingNum }).then(res => {
                //     if (res) {
                //         this.showCurrentParking(res[0])
                //     }
                // });
                let test = {
                    bd_name: "太古汇",
                    cat_id: 109014001,
                    center: [99.94352722167969, 15.965194702148438, 0.05999999865889549] as [number, number, number],
                    fl_id: -3,
                    fl_name: "P",
                    index: 514,
                    name: "普通停车位",
                    number: "F-441",
                    rd_fl: 5,
                    seq_id: 1,
                };
                this.showCurrentParking(test);
            } else {
                // 车牌查询
                CarState.carBrand = `${this.defaultCph.join('')}`;
                if (CarState.carBrand.length < 7) return;
                // const res = parkingNumStore.filter(item => item.bd_name === carBrand);
                console.log('车牌寻车' + CarState.carBrand);
                // if (res.length < 2) {
                //     // this.showCurrentParking(res[0])
                //     this.showCurrentParking()
                // }
            }
        },
        showCurrentParking(res: SearchResType) {
            const { center, rd_fl, fl_name, name, number } = res;
            const [lng, lat, height] = center;
            const markData = {
                location: [lng, lat] as [number, number],
                height: height ? height : 0.9,
                rdFl: rd_fl,
                fl_name,
                name,
                number,
            } as PointType;
            StoreState.currentPoint = StoreState.endPoint = markData;
            // 添加终点marker
            MapObject.endMarker = carTarget;
            if (!navigation.isMock) {
                MapObject.updateEnd?.();
            }
            CarState.isCarNum = false;
            CarState.isCarBrand = false;
            CarState.isCarStart = true;
        },
        async getRouteInfo() {
            if (StoreState.startPoint.rdFl && StoreState.endPoint.rdFl) {
                let pathInfo1 = await MapObject.Cmap?.routeManager.route(StoreState.startPoint.location[0], StoreState.startPoint.location[1], StoreState.startPoint.rdFl, StoreState.endPoint.location[0], StoreState.endPoint.location[1], StoreState.endPoint.rdFl, 0, [0]);
                let pathInfo2 = await MapObject.Cmap?.routeManager.route(StoreState.startPoint.location[0], StoreState.startPoint.location[1], StoreState.startPoint.rdFl, StoreState.endPoint.location[0], StoreState.endPoint.location[1], StoreState.endPoint.rdFl, 0, [1]);
                let pathInfo3 = await MapObject.Cmap?.routeManager.route(StoreState.startPoint.location[0], StoreState.startPoint.location[1], StoreState.startPoint.rdFl, StoreState.endPoint.location[0], StoreState.endPoint.location[1], StoreState.endPoint.rdFl, 0, [2]);
                planState.planContent = planState.planContent.map((item, index) => {
                    switch (index) {
                        case 0:
                            let param1 = {
                                type: item.type,
                                img: item.img,
                                name: item.name,
                                meter: `${pathInfo1.distance.toFixed(0)}米`,
                                time: item.time,
                            }
                            return param1;
                        case 1:
                            let param2 = {
                                type: item.type,
                                img: item.img,
                                name: item.name,
                                meter: `${pathInfo2.distance.toFixed(0)}米`,
                                time: item.time,
                            }
                            return param2;
                        case 2:
                            let param3 = {
                                type: item.type,
                                img: item.img,
                                name: item.name,
                                meter: `${pathInfo3.distance.toFixed(0)}米`,
                                time: item.time,
                            }
                            return param3;
                        default:
                            return item;
                    }
                })
            }
        }
    },
    render() {
        return (
            <div class={car_box} style={{ display: `${CarState.isCarNum || CarState.isCarBrand || CarState.isCarStart ? 'block' : 'none'}` }}>
                <div class={layer} style={{ display: 'flex' }}>
                    <div class={car_num} style={{ display: `${CarState.isCarNum ? 'flex' : 'none'}` }}>
                        <div>输入车位号 : </div>
                        <input
                            type="text"
                            v-model={this.CarNumInfo}
                            value={this.CarNumInfo}
                            onKeyup={e => {
                                console.log(this.CarNumInfo);
                                if (e && e.keyCode === 8) {
                                    console.log('删除');
                                    this.defaultCarNum = this.defaultCarNum?.map((item, index) => {
                                        if (index > this.CarNumInfo.length - 1) {
                                            return '';
                                        } else {
                                            return item;
                                        }
                                    })
                                } else {
                                    console.log('添加');
                                    this.CarNumInfo = this.CarNumInfo.slice(0, 5);
                                    if (this.CarNumInfo.length < 5) {
                                        let temp = new Array(5 - this.CarNumInfo.length);
                                        let res = this.CarNumInfo.split('').concat(temp);
                                        // @ts-ignore
                                        this.defaultCarNum = res.fill('', this.CarNumInfo.length)
                                    } else {
                                        this.defaultCarNum = this.CarNumInfo.split('');
                                    }
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
                        <div class={to_num}>
                            <div>默认为系统推荐停车位若车位停于别处请手动输入车位号</div>
                            <div class={num_btn} onClick={() => { CarState.isCarNum = true; this.show_keyboard = false; CarState.isCarBrand = false; }}>输入车位号</div>
                        </div>
                    </div>
                    <div class={car_bottom} style={{ display: `${this.isShowBottom ? 'block' : 'none'}` }}>
                        <div class={car_btn} onClick={() => { this.searchCar() }}>一键寻车</div>
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
                    <div class={car_navtop}>
                        <div class={select_start}>
                            <div class={locate_icon}>
                                <p style={{ background: '#78C458' }}>起</p>
                                <div style={{ width: '3px', height: '3px', background: '#D5D5D5', borderRadius: '50%', margin: '2px' }}></div>
                                <div style={{ width: '3px', height: '3px', background: '#D5D5D5', borderRadius: '50%', margin: '2px' }}></div>
                                <div style={{ width: '3px', height: '3px', background: '#D5D5D5', borderRadius: '50%', margin: '2px' }}></div>
                                <p style={{ background: '#F17171' }}>终</p>
                            </div>
                            <div class={detail_locate}>
                                <div>
                                    <input
                                        type="text"
                                        value={StoreState.startPoint?.name}
                                        placeholder="我的位置"
                                        onClick={() => {
                                            SelfInputState.isShow = !SelfInputState.isShow;
                                        }}
                                        onKeypress={e => {
                                            if (e.keyCode && e.keyCode === 13) {
                                                // console.log(`搜索历史${e.target?.value}`);
                                                // @ts-ignore
                                                searchStore({ name: `${e.target?.value}` }).then(res => {
                                                    if (res) SelfInputState.historyContent = SelfInputState.historyContent.concat(res);
                                                })
                                            }
                                        }}
                                    />
                                    {StoreState.startPoint?.fl_name ? <div>{StoreState.startPoint?.fl_name}</div> :
                                        <div class={select_btn}
                                            style={{ background: 'linear-gradient(91deg, #95E476, #83D063, #7AC75A)' }}
                                            onClick={() => {
                                                if (navigation.isMock) {
                                                    StoreState.startPoint = StoreState.currentPoint;
                                                }
                                                this.getRouteInfo();
                                                planState.carNav = true;
                                            }}
                                        >
                                            设为起点
                                        </div>
                                    }
                                </div>
                                <div>
                                    <input type="text"
                                        value={StoreState.endPoint?.name}
                                        placeholder="我的位置"
                                        onClick={() => {
                                            SelfInputState.isShow = !SelfInputState.isShow;
                                        }}
                                        onKeypress={e => {
                                            if (e.keyCode && e.keyCode === 13) {
                                                // console.log(`搜索历史${e.target?.value}`);
                                                // @ts-ignore
                                                searchStore({ name: `${e.target?.value}` }).then(res => {
                                                    if (res) SelfInputState.historyContent = SelfInputState.historyContent.concat(res);
                                                })
                                            }
                                        }}
                                    />
                                    {StoreState.endPoint?.fl_name ? <div>{StoreState.endPoint?.fl_name}</div> :
                                        <div class={select_btn}
                                            style={{ background: 'linear-gradient(91deg, #30adff, #3c8dff, #3c8dff)' }}
                                            onClick={() => {
                                                StoreState.endPoint = StoreState.currentPoint;
                                                MapObject.updateEnd?.();
                                                MapObject.updateStart?.();//先终点，后起点，最后重新画路线
                                            }}
                                        >
                                            设为终点
                                        </div>
                                    }
                                </div>
                            </div>
                            <div style={{ marginLeft: '10px' }} onClick={() => {
                                let temp = StoreState.endPoint;
                                navInfoState.isMock = false;
                                // 更新终点
                                StoreState.endPoint = StoreState.startPoint;
                                if (StoreState.endPoint.rdFl) MapObject.updateEnd?.();
                                // 更新起点
                                StoreState.startPoint = temp;
                                if (StoreState.startPoint.rdFl) MapObject.updateStart?.();
                            }}>
                                <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                            </div>
                        </div>
                        {/* <div class={car_tip}>请输入或点击地图选择起点</div> */}
                    </div>
                    <PlanBox />
                    <SelfInput />
                </div>
            </div >
        );
    },
});

import { MapObject } from "@/map/Map";
import { defineComponent, reactive } from "vue";
import { SearchState } from "@/components/search/search";
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
    car_navtop
} from "./CarBox.module.scss";
import { PointType } from "@/types";
import { navigation } from "../navInfo/NavInfo";
import { StoreState } from "../storeBox/StoreBox";
import { SelfInputState } from "../selfInput/SelfInput";
import PlanBox, { planState } from "../planBox/PlanBox";

export const CarState: {
    isCarBrand: boolean;
    isCarNum: boolean;
    isCarStart: boolean;
    confirmStart: boolean;
    carNav: boolean;
    parkingNum: string;
    carBrand: string;
    parkingNumStore: PointType[];
} = reactive({
    isCarBrand: false,
    isCarNum: false,
    isCarStart: false,
    confirmStart: false,
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
            defaultCarNum: ['A', '1', '2', '3', ''],
            CarNumInfo: 'A123',
            CarStart: {
                name: '我的位置',
            },
            show_keyboard: false,
            isShowBottom: true,
            isTranslate: false,
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
        searchCar(parkingNum?: string) {
            console.log('开始寻车');
            const { parkingNumStore } = CarState;
            if (parkingNum) {
                // 车位号查询
                CarState.parkingNum = `${this.defaultCarNum}`;
                const res = parkingNumStore.filter(i => i.number?.toLowerCase().includes(parkingNum.toLowerCase()));
                console.log('车位号寻车' + parkingNum);
                if (res.length < 2) {
                    // this.showCurrentParking(res[0])
                    this.showCurrentParking()
                }
            } else {
                // 车牌查询
                CarState.carBrand = `${this.defaultCph}`;
                const carBrand = this.cph.join('');
                if (carBrand.length < 7) return;
                const res = parkingNumStore.filter(item => item.bd_name === carBrand);
                console.log('车牌寻车' + carBrand);
                if (res.length < 2) {
                    // this.showCurrentParking(res[0])
                    this.showCurrentParking()
                }
            }
        },
        showCurrentParking(res?: PointType) {
            // const { center, rdFl = 0, } = res;
            // const [lng, lat, height] = center;
            // const info: PointType = {
            //     location: [lng, lat] as [number, number],
            //     height: height ? height : 0.9,
            //     rdFl,
            //     resource: res,
            // };
            // console.log('展示mark');
            // carPosiMarker.show(info)
            let tempMarkData = {
                location: [22.16351318359375, 2.6662068367004395],
                height: 0.9,
                rdFl: 2,
                fl_name: 'L1',
                name: 'DIOR',
            } as PointType;
            console.log('展示mark');
            // 设置终点
            StoreState.endPoint = tempMarkData;
            this.confirm(true);
            // 进入选择起点页
            CarState.isCarNum = false;
            CarState.isCarBrand = false;
            CarState.isCarStart = true;
            planState.carNav = true;
        },
        confirm(mock: boolean) {
            if (!navigation.isMock) {
                MapObject.previewMarker.hide();
                navigation.destination(StoreState.endPoint, true);
                MapObject.endMarker.show(StoreState.endPoint);
            }
        }
    },
    render() {
        return (
            <div class={car_box} style={{ display: `${CarState.isCarNum || CarState.isCarBrand || CarState.isCarStart ? 'block' : 'none'}` }}>
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
                    <div>
                        <div class={car_btn} onClick={() => { this.searchCar(`${this.CarNumInfo.slice(0, 5)}`) }}>一键寻车</div>
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
                    <div class={car_navtop}>
                        <div class={select_start}>
                            <div style={{ flexDirection: `${this.isTranslate ? 'column-reverse' : 'column'}` }}>
                                <div>
                                    <p style={{ background: '#5880d0' }}></p>
                                    <input type="text"
                                        value={StoreState.startPoint?.name}
                                        placeholder="请选择起点"
                                        onClick={() => {
                                            SearchState.isShowSort = true;
                                            SearchState.isShowSearch = true;
                                            SelfInputState.isShow = true;
                                            SearchState.showCloseBtn = true;
                                        }} />
                                </div>
                                <div style={{ width: '100%', height: '1px', backgroundColor: '#BBBBBB', padding: '0' }}></div>
                                <div>
                                    <p style={{ background: '#D05858' }}></p>
                                    <input type="text" value={StoreState.endPoint?.name} readonly />
                                </div>
                            </div>
                            <div style={{ marginLeft: '10px' }} onClick={() => { this.isTranslate = !this.isTranslate; }}>
                                <img src={transformUrl} style={{ width: '20px' }} alt='图片找不到' />
                            </div>
                        </div>
                        <div class={car_tip}>请输入或点击地图选择起点</div>
                    </div>
                    <PlanBox />
                </div>
            </div >
        );
    },
});

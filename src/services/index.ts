import { SERVERURL } from "@/App";
import { httpRequest } from "./httpRequest";

export function searchStore(data: { name: string }) {
    return httpRequest({
        url: `${SERVERURL}/taikoohui.searchShop`,
        data,
    });
}

export function carNumber(data: { number: string }) {
    return httpRequest({
        url: `${SERVERURL}/taikoohui.searchPark`,
        data,
    });
}

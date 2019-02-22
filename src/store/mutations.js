import * as types from './mutation-types'
import { setStore, getStore } from '../config/mUtils'
export default {
    //记录当前经度纬度
    [types.RECORD_ADDRESS](state, { latitude, longitude }) {
        state.latitude = latitude;
        state.longitude = longitude;
    },
    [types.RECORD_SHOPDETAIL](state, detail) {
        state.shopDetail = detail;
    },
    //加入购物车
    [types.ADD_CART](state, { shopid, category_id, item_id, food_id, name, price, specs, packing_fee, sku_id, stock }) {

    }
}



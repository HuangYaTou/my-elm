<template>
    <div class="city_container">
        <head-top :head-title="cityName" goBack="true">
            <router-link class="change_city" to="/home" slot="changeCity">切换城市</router-link>
        </head-top>
        <form class="city_form" v-on:submit.prevent>
            <div>
                <input type="search" class="city_input input_style" placeholder="请输入学校、商务楼、地址" required v-model="inputValue">
            </div>
            <div>
                <input type="submit" class="city_submit input_style" value="提交" @click="postpois">
            </div>
        </form>
        <header class="pois_search_history" v-if="historyTitle">搜索历史</header>
        <ul class="getpois_ul">
            <li v-for="(item, index) in placeList" :key="index" @click="nextPage(index, item.geohash)">
                <h4 class="pois_name ellipsis">{{item.name}}</h4>
                <p class="pois_address ellipsis">{{item.address}}</p>
            </li>
        </ul>
        <footer v-if="historyTitle&&placeList.length" class="clear_all_history" @click="clearAll"></footer>
        <div class="search_none_place" v-if="placeNone">很抱歉，无搜索结果！</div>
    </div>
</template>

<script>
import headTop from '../../components/header/head'
import {currentCity, searchPlace} from '../../service/getData'
import {getStore, setStore, removeStore} from '../../config/mUtils'
export default {
    data() {
        return {
            cityId: '',  //当前城市id
            cityName: '',
            inputValue: '',  //搜索地址
            placeList: [],
            placeHistory: [],  //历史搜索记录
            historyTitle: true,  //默认显示搜索历史头部，点击搜索后隐藏
            placeNone: false,  //无搜索结果，显示提示信息
        }
    },
    components: {
        headTop
    },
    mounted() {
        this.cityId = this.$route.params.cityId;
        //获取当前城市名称
        currentCity(this.cityId).then(res=>{
            this.cityName = res.name;
        })
        this.initData();
    },
    methods: {
        initData() {
            //获取 搜索历史记录
            if(getStore('placeHistory')) {
                this.placeList = JSON.parse(getStore('placeHistory'));
            }
            else {
                this.placeList = [];
            }
        },
        //发送搜索信息
        postpois() {
            if(this.inputValue) {
                searchPlace(this.cityId, this.inputValue).then(res=>{
                    this.historyTitle = false;
                    this.placeList = res;
                    this.placeNone = res.length ? false : true;
                })
            }
        },
        //点击搜索结果进入下一页面时进行判断，是否已经有一样的历史记录
        //如果没有则新增，如果有则不做重复存储，判断完进入下一页
        nextPage(index, geohash) {
            let history = getStore('placeHistory');
            let choosePlace = this.placeList[index];
            if(history) {
                let flag = false;
                this.placeHistory = JSON.parse(history);
                this.placeHistory.forEach(item=>{
                    if(item.geohash==geohash) {
                        flag = true;
                    }
                });
                if(!flag) {
                    this.placeHistory.push(choosePlace);
                }
            }
            else {
                this.placeHistory.push(choosePlace);
            }
            setStore('placeHistory,', this.placeHistory);
            this.$router.push({
                path: '/msite',
                query: {geohash}
            });
        },
        clearAll() {
            removeStore('placeHistory');
            this.initData();
        }
    }
}
</script>

<style lang="scss" scoped>
    @import 'src/style/mixin';
    .city_container{
        padding-top: 2.35rem;
    }
    .change_city{
        right: 0.4rem;
        @include sc(0.6rem, #fff);
        @include ct;
    }
    .city_form{
        background-color: #fff;
        border-top: 1px solid $bc;
        border-bottom: 1px solid $bc;
        padding-top: 0.4rem;
        div{
            width: 90%;
            margin: 0 auto;
            text-align: center;
            .input_style{
                border-radius: 0.1rem;
                margin-bottom: 0.4rem;
                @include wh(100%, 1.4rem);
            }
            .city_input{
                border: 1px solid $bc;
                padding: 0 0.3rem;
                @include sc(0.65rem, #333);
            }
            .city_submit{
                background-color: $blue;
                @include sc(0.65rem, #fff);
            }
        }
    }
    .pois_search_history{
        border-top: 1px solid $bc;
        border-bottom: 1px solid $bc;
        padding-left: 0.5rem;
        @include font(0.475rem, 0.8rem);
    }
    .getpois_ul{
        background-color: #fff;
        border-top: 1px solid $bc;
        li{
            margin: 0 auto;
            padding-top: 0.65rem;
            border-bottom: 1px solid $bc;
            .pois_name{
                margin: 0 auto 0.35rem;
                width: 90%;
               @include sc(0.65rem, #333);
            }
            .pois_address{
                width: 90%;
                margin: 0 auto 0.55rem;
                @include sc(0.45rem, #999);
            }
        }
    }
    .search_none_place{
        margin: 0 auto;
        @include font(0.65rem, 1.75rem);
        color: #333;
        background-color: #fff;
        text-indent: 0.5rem;
    }
    .clear_all_history{
        @include sc(0.7rem, #666);
        text-align: center;
        line-height: 2rem;
        background-color: #fff;
    }
</style>
<template>
    <div class="food_container">
        <head-top :head-title="headTitle" goBack="true"></head-top>
        <section class="sort_container">
            <!-- 分类 -->
            <div class="sort_item" :class="{choose_type:sortBy=='food'}">
                <div class="sort_item_container" @click="chooseType('food')">
                    <div class="sort_item_border">
                        <span :class="{category_title:sortBy=='food'}">{{foodTitle}}</span>
                        <svg width='10' height='10' xmlns="http://www.w3.org/2000/svg" version='1.1' class="sort_icon">
                            <polygon points="0,3 10,3 5,8"></polygon>
                        </svg>
                    </div>
                </div>
                <transition name="showlist" v-show="category">
                    <section class="category_container sort_detail_type" v-show="sortBy=='food'">
                        <section class="category_left">
                            <ul>
                                <li class="category_left_li" v-for="(item, index) in category" :key="index" :class="{category_active:restaurant_category_id==item.id}" @click="selectCategoryName(item.id, index)">
                                    <section>
                                        <img class="category_icon" :src="getImgPath(item.image_url)" v-if="index">
                                        <span>{{item.name}}</span>
                                    </section>
                                    <section>
                                        <span class="category_count">{{item.count}}</span>
                                        <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg" version="1.1" class="category_arrow" v-if="index">
                                            <path d="M0 0 L6 4 L0 8" style="fill:none; stroke:#bbb; stroke-width:1;"></path>
                                        </svg>
                                    </section>
                                </li>
                            </ul>
                        </section>
                        <section class="category_right">
                            <ul>
                                <li class="category_right_li" v-for="(item, index) in categoryDetail" :key="index" :class="{category_right_choosed: restaurant_category_ids==item.id||(!restaurant_category_ids)&&index==0}" @click="getCategoryIds(item.id, item.name)">
                                    <span>{{item.name}}</span>
                                    <span>{{item.count}}</span>
                                </li>
                            </ul>
                        </section>
                    </section>
                </transition>
            </div>
            <!-- 排序 -->
            <div class="sort_item" :class="{choose_type:sortBy=='sort'}">
                <div class="sort_item_container" @click="chooseType('sort')">
                    <div class="sort_item_border">
                        <span :class="{category_title:sortBy=='sort'}">排序</span>
                        <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" version="1.1" class="sort_icon">
                            <polygon points="0,3 10,3 5,8"></polygon>
                        </svg>
                    </div>
                </div>
                <transition name="showlist"></transition>
            </div>
        </section>
    </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import {getImgPath} from '../../components/common/mixin'
import {msiteAddress, foodCategory, foodDelivery, foodActivity} from '../../service/getData'
import headTop from '../../components/header/head'
import shopList from '../../components/common/shoplist'
export default {
    mixins:[getImgPath],
    data(){
        return {
            geohash:'',
            headTitle:'',
            foodTitle:'',  //当前分类名称
            restaurant_category_id: '',  //食品类型id值
            restaurant_category_ids: '',  //筛选类型的id
            sortBy: '',  //筛选的条件
            category: null,  //category 分类左侧数据
            categoryDetail: null,  //category 分类右侧的详细数据
            sortByType: null,  //根据何种方式排序
            Delivery: null,  //配送方式数据
            Activity: null,  //商家支持活动数据
            delivery_mode: null,  //选中的配送方式
            support_ids: [],  //选中的商铺活动列表
            filterNum: 0,  //所选中的所有样式的集合
            confirmStatus: false  //确认选择
        }
    },
    components:{
        headTop,
        shopList
    },
    created() {
        this.initData();
    },
    computed:{
        ...mapState([
            'latitude',
            'longitude'
        ])
    },
    methods: {
        ...mapMutations(['RECORD_ADDRESS']),
        async initData() {
            this.geohash = this.$route.query.geohash;
            this.headTitle = this.$route.query.title;
            this.restaurant_category_id = this.$route.query.restaurant_category_id;
            this.foodTitle = this.headTitle;
            if(!this.latitude) {
                let res = await msiteAddress(this.geohash);
                this.RECORD_ADDRESS(res);
            }
            //获取category分类左侧数据
            this.category = await foodCategory(this.latitude, this.longitude);
            //初始化时定位当前category分类左侧默认选择项，在右侧展示其sub_categories列表
            this.category.forEach(item=>{
                if(this.restaurant_category_id==item.id) {
                    this.categoryDetail = item.sub_categories;
                }
            });
            //获取筛选列表的配送方式
            this.Delivery = await foodDelivery(this.latitude, this.longitude);
            //获取筛选列表的商铺活动
            this.Activity = await foodActivity(this.latitude, this.longitude);
            //记录 support_ids 的状态，默认不选中，点击状态取反，status为true时为选中状态
            this.Activity.forEach((item, index)=>{
                this.support_ids[index] = {status:false, id:item.id};
            });
        },
        //点击顶部三个选项，展示不同的列表（选中当前选项进行展示，同时收回其他选项）
        async chooseType(type){
            if(this.sortBy!==type) {
                this.sortBy = type;
                if(type=='food'){
                    this.foodTitle = '分类';
                }
                else {
                    this.foodTitle = this.headTitle;
                }
            }
            else {  //再次点击相同选项时收回列表
                this.sortBy = '';
                if(type=='food'){
                    this.foodTitle = this.headTitle;
                }
            }
        },
        //选中category左侧列表的某个选项时，右侧渲染响相应的sub_categories列表
        selectCategoryName(id, index) {
            //第一个选项--全部商家，，因为没有自己的列表，所以点击则默认获取所有数据
            if(index==0){
                this.restaurant_category_ids = null;
                this.sortBy = '';
            }
            else {
                this.restaurant_category_id = id;
                this.categoryDetail = this.category[index].sub_categories;
            }
        },
        //选中category右侧列表的某个选项时，进行筛选，重新获取数据并渲染
        getCategoryIds(id, name) {
            console.log('food.vue--getCategoryIds--id='+id+', name='+name);
            this.restaurant_category_ids = id;
            this.sortBy = '';
            this.foodTitle = this.headTitle = name;
        },
        //点击某个排序方式，获取事件对象的data值，并根据获取的值重新获取数据并渲染
        sortList(event) {
            let node;
            if(event.target.nodeName.toUpperCase()!=='p') {
                node = event.target.parentNode;
            }
            else {
                node = event.target;
            }
            this.sortByType = node.getAttribute('data');
            this.sortBy = '';
        },
        //筛选选项中的配送方式
        selectDeliveryMode(id) {
            if(this.delivery_mode==null){
                this.filterNum++;
                this.delivery_mode = id;
            }
            else if(this.delivery_mode==id) {
                this.filterNum--;
                this.delivery_mode=null;
            }
            else {
                this.delivery_mode = id;
            }
        },
        //点击商家活动，状态取反
        selectSupportIds(index, id) {
            //数组替换新的值
            this.support_ids.splice(index, 1, {
                status: !this.support_ids[index].status,
                id
            });
            //重新计算filterNum的个数
            this.filterNum=this.delivery_mode==null?0:1;
            this.support_ids.forEach(item=>{
                if(item.status) {
                    this.filterNum++;
                }
            })
        },
        //只有点击清空按钮才清空数据，否则一直保持原有状态
        clearSelect() {
            this.support_ids.map(item=>{
                item.status = false;
            });
            this.filterNum = 0;
            this.delivery_mode = null;
        },
        //点击确认时，将需要筛选的id值传递给子组件，并且收回列表
        confirmSelectFun() {
            this.confirmStatus = !this.confirmStatus;
            this.sortBy = '';
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../style/mixin';
.food_container {
  padding-top: 3.6rem;
}
.sort_container {
  background-color: #fff;
  border-bottom: 0.025rem solid #f1f1f1;
  position: fixed;
  top: 1.95rem;
  right: 0;
  width: 100%;
  display: flex;
  z-index: 13;
  box-sizing: border-box;
  .sort_item {
    @include sc(0.55rem, #444);
    @include wh(33.3%, 1.6rem);
    text-align: center;
    line-height: 1rem;
    .sort_item_container {
      @include wh(100%, 100%);
      position: relative;
      z-index: 14;
      background-color: #fff;
      box-sizing: border-box;
      padding-top: 0.3rem;
      .sort_item_border {
        height: 1rem;
        border-right: 0.025rem solid $bc;
      }
    }
    .sort_icon {
      vertical-align: middle;
      transition: all 0.3s;
      fill: #666;
    }
  }
  .choose_type {
    .sort_item_container {
      .category_title {
        color: $blue;
      }
      .sort_icon {
        transform: rotate(180deg);
        fill: $blue;
      }
    }
  }
  .showlist-enter-active,
  .showlist-leave-active {
    transition: all 0.3s;
    transform: translateY(0);
  }
  .showlist-enter,
  .showlist-leave-active {
    opacity: 0;
    transform: translateY(-100%);
  }
  .sort_detail_type {
    width: 100%;
    position: absolute;
    display: flex;
    top: 1.6rem;
    left: 0;
    border-top: 0.025rem solid $bc;
    background-color: #fff;
  }
  .category_container {
    .category_left {
      flex: 1;
      background-color: #f1f1f1;
      height: 16rem;
      overflow-y: auto;
      span {
        @include sc(0.5rem, #666);
        line-height: 1.8rem;
      }
      .category_left_li {
        @include fj;
        padding: 0 0.5rem;
        .category_icon {
          @include wh(0.8rem, 0.8rem);
          vertical-align: middle;
          margin-right: 0.2rem;
        }
        .category_count {
          background-color: #ccc;
          @include sc(0.4rem, #fff);
          padding: 0 0.1rem;
          border: 0.025rem solid #ccc;
          border-radius: 0.8rem;
          vertical-align: middle;
          margin-right: 0.25rem;
        }
        .category_arrow {
          vertical-align: middle;
        }
      }
      .category_active {
        background-color: #fff;
      }
    }
    .category_right {
      flex: 1;
      background-color: #fff;
      padding-left: 0.5rem;
      height: 16rem;
      overflow-y: auto;
      .category_right_li {
        @include fj;
        height: 1.8rem;
        line-height: 1.8rem;
        padding-right: 0.5rem;
        border-bottom: 0.025rem solid $bc;
        span {
          color: #666;
        }
      }
      .category_right_choosed {
        span {
          color: $blue;
        }
      }
    }
  }
  .sort_list_container {
    width: 100%;
    .sort_list_li {
      height: 2.5rem;
      display: flex;
      align-items: center;
      svg {
        @include wh(0.7rem, 0.7rem);
        margin: 0 0.3rem 0 0.8rem;
      }
      p {
        line-height: 2.5rem;
        flex: auto;
        text-align: left;
        text-indent: 0.25rem;
        border-bottom: 0.025rem solid $bc;
        @include fj;
        align-items: center;
        span {
          color: #666;
        }
      }
      .sort_select {
        span {
          color: $blue;
        }
      }
    }
  }
  .filter_container {
    flex-direction: column;
    align-items: flex-start;
    min-height: 10.6rem;
    background-color: #f1f1f1;
    .filter_header_style {
      @include sc(0.4rem, #333);
      line-height: 1.5rem;
      height: 1.5rem;
      text-align: left;
      padding-left: 0.5rem;
      background-color: #fff;
    }
    .filter_ul {
      display: flex;
      flex-wrap: wrap;
      padding: 0 0.5rem;
      background-color: #fff;
      .filter_li {
        display: flex;
        align-items: center;
        border: 0.025rem solid #eee;
        @include wh(4.7rem, 1.4rem);
        margin-right: 0.25rem;
        border-radius: 0.125rem;
        padding: 0 0.25rem;
        margin-bottom: 0.25rem;
        svg {
          @include wh(0.8rem, 0.8rem);
          margin-right: 0.125rem;
        }
        span {
          @include sc(0.4rem, #333);
        }
        .filter_icon {
          @include wh(0.8rem, 0.8rem);
          font-size: 0.5rem;
          border: 0.025rem solid $bc;
          border-radius: 0.15rem;
          margin-right: 0.25rem;
          line-height: 0.8rem;
          text-align: center;
        }
        .activity_svg {
          margin-right: 0.25rem;
        }
        .selected_filter {
          color: $blue;
        }
      }
    }
    .confirm_filter {
      display: flex;
      background-color: #f1f1f1;
      width: 100%;
      padding: 0.3rem 0.2rem;
      .filter_button_style {
        @include wh(50%, 1.8rem);
        font-size: 0.8rem;
        line-height: 1.8rem;
        border-radius: 0.2rem;
      }
      .clear_all {
        background-color: #fff;
        margin-right: 0.5rem;
        border: 0.025rem solid #fff;
      }
      .confirm_select {
        background-color: #56d176;
        color: #fff;
        border: 0.025rem solid #56d176;
        span {
          color: #fff;
        }
      }
    }
  }
}
.showcover-enter-active,
.showcover-leave-active {
  transition: opacity 0.3s;
}
.showcover-enter,
.showcover-leave-active {
  opacity: 0;
}
.back_cover {
  position: fixed;
  @include wh(100%, 100%);
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
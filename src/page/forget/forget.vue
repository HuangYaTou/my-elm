<template>
    <div class="restContainer">
        <head-top head-title="重置密码" goBack="true"></head-top>
        <form action="" class="resetForm">
            <section class="input_container phone_number">
                <input type="text" placeholder="账号" maxlength="11" v-model="phoneNumber" @input="inputPhone">
            </section>
            <section class="input_container">
                <input type="password" placeholder="旧密码" v-model="oldPassword">
            </section>
            <section class="input_container">
                <input type="password" placeholder="请输入新密码" v-model="newPassword">
            </section>
            <section class="input_container">
                <input type="password" placeholder="请确认新密码" v-model="confirmPassword">
            </section>
            <section class="input_container captcha_code_container">
                <input type="text" placeholder="请输入验证码" maxlength="6" v-model="mobileCode">
                <div class="img_change_img">
                    <img v-show="captchaCodeImg" :src="captchaCodeImg">
                    <div class="change_img" @click="getCaptchaCode">
                        <p>看不清</p>
                        <p>换一张</p>
                    </div>
                </div>
            </section>
        </form>
        <div class="login_container" @click="resetButton">确认修改</div>
        <alert-tip v-if="showAlert" :alertText="alertText" :showHide="showAlert" @closeTip="closeTip"></alert-tip>
    </div>
</template>

<script>
import headTop from '../../components/header/head'
import alertTip from '../../components/common/alertTip'
import {mobileCode, checkExist, getCaptchas, changePassword} from '../../service/getData'
export default {
    data() {
        return {
            phoneNumber: null,
            oldPassword: null,
            newPassword: null,
            rightPhoneNumber: false,
            confirmPassword: null,
            captchaCodeImg: null,  //验证码地址
            mobileCode: null,  //短信验证码
            computedTime: 0,  //倒数计时
            showAlert: false,
            alertText: null,
            accountType: 'mobile',  //注册方式
        }
    },
    components: {
        headTop,
        alertTip
    },
    created() {
        this.getCaptchaCode();
    },
    methods: {
        inputPhone() {
            if(/.+/gi.test(this.phoneNumber)) {
                this.rightPhoneNumber = true;
            }
            else {
                this.rightPhoneNumber = false;
            }
        },
        //获取验证码
        async getVerifyCode() {
            if(this.rightPhoneNumber) {
                this.computedTime = 30;
                this.timer = setInterval(()=>{
                    this.computedTime--;
                    if(this.computedTime==0){
                        clearInterval(this.timer);
                    }
                }, 1000);
                //判断用户是否存在
                let res = await checkExist(this.phoneNumber, this.accountType);
                if(res.message) {
                    this.showAlert = true;
                    this.alertText = res.message;
                    return;
                }
                else if(!res.is_exists) {
                    this.showAlert = true;
                    this.alertText = '您输入的手机号尚未绑定';
                    return;
                }
                //获取验证信息
                let getCode = await mobileCode(this.phoneNumber);
                if(getCode.message) {
                    this.showAlert = true;
                    this.alertText = getCode.message;
                    return;
                }
                this.validate_token = getCode.validate_token;
            }
        },
        //获取图片验证码
        async getCaptchaCode() {
            let res = await getCaptchas();
            this.captchaCodeImg = res.code;
        },
        //重置密码
        async resetButton() {
            if(!this.phoneNumber) {
                this.showAlert = true;
                this.alertText = '请输入正确的账号';
                return;
            }
            else if(!this.oldPassword) {
                this.showAlert = true;
                this.alertText = '请输入旧密码';
                return;
            }
            else if(!this.newPassword) {
                this.showAlert = true;
                this.alertText = '请输入新密码';
                return;
            }
            else if(!this.confirmPassword) {
                this.showAlert = true;
                this.alertText = '请输入确认密码';
                return;
            }
            else if(this.newPassword !== this.confirmPassword) {
                this.showAlert = true;
                this.alertText = '两次输入的密码不一致';
                return;
            }
            else if(!this.mobileCode) {
                this.showAlert = true;
                this.alertText = '请输入验证码';
                return;
            }
            //发送重置信息
            let res = await changePassword(this.phoneNumber, this.oldPassword, this.newPassword, this.confirmPassword, this.mobileCode);
            if(res.message) {
                this.showAlert = true;
                this.alertText = res.message;
                this.getCaptchaCode();
            }
            else {
                this.showAlert = true;
                this.alertText = '密码修改成功';
            }
        },
        closeTip() {
            this.showAlert = false;
        }
    }
}
</script>

<style lang="scss" scoped>
    @import 'src/style/mixin';

    .restContainer{
        padding-top: 1.95rem;
    }
    .resetForm{
        background-color: #fff;
        margin-top: .6rem;
        .input_container{
            display: flex;
            justify-content: space-between;
            padding: .6rem .8rem;
            border-bottom: 1px solid #f1f1f1;
            input{
                @include sc(.7rem, #666);
            }
            button{
                @include sc(.65rem, #fff);
                font-family: Helvetica Neue,Tahoma,Arial;
                padding: .28rem .4rem;
                border: 1px;
                border-radius: 0.15rem;
            }
            .right_phone_number{
                background-color: #4cd964;
            }
        }
        .phone_number{
            padding: .3rem .8rem;
        }
        .captcha_code_container{
            height: 2.2rem;
            .img_change_img{
                display: flex;
                align-items: center;
                img{
                    @include wh(3.5rem, 1.5rem);
                    margin-right: .2rem;
                }
                .change_img{
                    display: flex;
                    flex-direction: 'column';
                    flex-wrap: wrap;
                    width: 2rem;
                    justify-content: center;
                    p{
                        @include sc(.55rem, #666);
                    }
                    p:nth-of-type(2){
                        color: #3b95e9;
                        margin-top: .2rem;
                    }
                }
            }
        }
    }
    .captcha_code_container{
        height: 2.2rem;
        .img_change_img{
            display: flex;
            align-items: center;
            img{
                @include wh(3.5rem, 1.5rem);
                margin-right: .2rem;
            }
            .change_img{
                display: flex;
                flex-direction: 'column';
                flex-wrap: wrap;
                width: 2rem;
                justify-content: center;
                p{
                    @include sc(.55rem, #666);
                }
                p:nth-of-type(2){
                    color: #3b95e9;
                    margin-top: .2rem;
                }
            }
        }
    }
    .login_container{
        margin: 1rem .5rem;
        @include sc(.7rem, #fff);
        background-color: #4cd964;
        padding: .5rem 0;
        border: 1px;
        border-radius: 0.15rem;
        text-align: center;
    }
</style>
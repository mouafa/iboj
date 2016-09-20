<style lang="less" scoped>
@import '../common/less/colors.less';
.history-tab:nth-child(odd) {
    background-color: @color-dark-grey1;
}

table {
    width: 100%;
    tr > th {
        text-align: left;
    }
    th,
    td {
        border-bottom: 1px solid #ddd;
    }
}
</style>
<template>
    <div class="hpanel row  bg-white  m-none p-sm bg-white">
        <modal :show="showModal">
        <div class="p-sm panel-heading capital" slot="header">
            <i class="fa fa-usd m-r-sm"></i><span v-ii18n="rechargeMyWallet"></span>
        </div>
            <div class="p-sm m-b-md" slot="body">
            <!-- <p class="text-danger m-b-xs error" v-if="error">
                <span>{{error}}</span>
            </p> -->
                <div class='container-preview-component'>
                    <div class="radio radio-success radio-inline">
                        <input type="radio" id="code" value="Code" v-model="Pmethod">
                        <label  for="code"><img src="/assets/images/code.png" class="m-b-sm" alt="logo"></label>
                    </div>
                    <div class="radio radio-success radio-inline">
                        <input type="radio" id="paypal" value="Paypal" v-model="Pmethod" disable>
                        <label for="paypal"><img src="/assets/images/paypal.png" class="m-b-sm" alt="logo"></label>
                    </div>
                    <div class="radio radio-success radio-inline">
                        <input type="radio" id="visa" value="Visa" v-model="Pmethod">
                        <label  for="visa"><img src="/assets/images/visa.png" class="m-b-sm" alt="logo"></label>
                    </div>
                </div>
                <div class="p-sm" v-if="Pmethod == 'Code'">
                     <input type="search" class="form-control m-xs" v-model="codeR | numeric" name="code card" placeholder="XXXXXX XXXXX XXXXX XX">
                </div>
                <div class="p-sm" v-if="Pmethod == 'Paypal'">
                     <input type="search" class="form-control m-xs" v-model="Rvalue | numeric" name="Rvalue" placeholder="For Example 100$...">
                </div>
                <div class="p-sm capital" v-if="Pmethod == 'Visa'">
                     <span v-ii18n="notAvailableNow"></span>
                </div>
            </div>
            <div slot="footer" class="pull-right m-r-md m-t-sm row ">
                <button @click="cancel" class="font-light btn-link text-white hand font-8 uppercase" v-ii18n="cancel"></button>
                <button class="w-xs font-light btn btn-success m-l-md font-8 uppercase" @click="send" v-ii18n="send"></button>
            </div>
        </modal>
        <div class="col-md-3 text-center p-none">
            <div class="small capital">
                <i class="fa fa-shopping-bag"></i><span v-ii18n="myWallet"></span>
            </div>
            <div>
                <h1 class="sans-serif font-extra-bold m-t-xl m-b-xs">
                                {{wallet}}$
                            </h1>
                <small class="capital" v-ii18n="untilToday"></small>
            </div>
            <div class="m-t-sm btn brd-blue bg-white text-info font-bold capital" @click="showModal = true; this.error = '';">
                <i class="fa fa-credit-card"></i><span v-ii18n="recharge"></span>
            </div>
        </div>
        <div class="col-md-9 p-none p-l-sm capital">
            <div class="small m-b-xs">
                <i class="fa fa-exchange"></i><span v-ii18n="exchangeCurrentMonth"></span>
            </div>
            <table>
                <tr>
                    <th v-ii18n="date"></th>
                    <th v-ii18n="reason"></th>
                    <th></th>
                </tr>
                <tr v-for='item in history' class='history-tab p-xs'>
                    <td class='p-xxs font-8'>{{item.date | toDate}}</td>
                    <td class='p-xxs font-8'>{{item.reason}}</td>
                    <td class='p-xxs'>{{item.value}}</td>
                </tr>
            </table>
        </div>
    </div>
</template>
<script>
// var $ = window.$ = require('jquery');
var connector = require('../../services/connect.js');
// var _ = require('underscore');
var modal = require('../common/modal.vue');
module.exports = {
    data: function() {
        return {
            error: '',
            showModal: false,
            wallet: 0,
            Pmethod: 'Code',
            history: [],
            codeR: ''
        }
    },
    components:{
        modal:modal
    },
    props: {
        profile: {
            type: Object,
            require: true
        }
    },
    created: function() {
        var that = this;
        connector.apiCall('', '/wallet/history', 'GET', function(error, response) {
            that.history = response;
        });
        connector.apiCall('', '/wallet', 'GET', function(error, response) {
            that.wallet = response;
        });
    },
    methods: {
        cancel: function(){
          this.showModal = false;
          this.error = '';
        },
        send: function(){
            var that = this;
          connector.apiCall({code: this.codeR}, '/wallet/recharge', 'POST', function(error, response) {
            if(error)
                that.error =  error.responseJSON.data.message;
            else that.showModal = false;
          });
        }
    }
}
</script>

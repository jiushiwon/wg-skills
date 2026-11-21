<template><Commerce :categories="categoryData" /></template>
<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Commerce from '@/skills/uniapp-ui-template-builder-skill/templates/uniapp-vue3/commerce/commerce.vue'
const categoryData=ref<Array<{id:string;label:string;image?:string;productIds?:string[];children?:Array<{id:string;label:string;image?:string;productIds:string[]}>}>|undefined>()
onLoad(options=>{if(options?.categoryMode==='multi')categoryData.value=[{id:'digital',label:'数码设备',image:'/static/commerce/laptop.jpg',children:[{id:'laptop',label:'电脑',image:'/static/commerce/laptop.jpg',productIds:['laptop']},{id:'phone',label:'手机',image:'/static/commerce/phone.jpg',productIds:['phone']}]},{id:'accessories',label:'日常配件',image:'/static/commerce/headphones.jpg',children:[{id:'headphones',label:'耳机',image:'/static/commerce/headphones.jpg',productIds:['headphones']},{id:'watch',label:'腕表',image:'/static/commerce/watch.jpg',productIds:['watch']}]}]})
</script>
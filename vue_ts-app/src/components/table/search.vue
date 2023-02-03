<!-- search.vue -->
<template>
  <el-form :model="searchModel" :inline="true" class="form_inline search" @submit.native.prevent ref="form">
    <el-form-item v-for="(item, index) in searchConfig.slice(0, 3)" :key="index" :prop="item.prop"
      :label="item.label ? item.label : ''" :rules="item.rules" class="search-item">
      <formItem v-model="searchModel[item.prop]" :itemOptions="item" />
    </el-form-item>
    <template v-if="searchConfig.length > 3 && moreSearch">
      <el-form-item v-for="(item, index) in searchConfig.slice(3)" :key="3 + index" :prop="item.prop"
        :label="item.label ? item.label : ''" :rules="item.rules" class="search-item"
        :class="{ span2: twiceDatePickerType.includes(item.datePickerType) }">
        <formItem v-model="searchModel[item.prop]" :item-options="item" />
      </el-form-item>
    </template>
    <div v-if="searchConfig.length" class="search-button">
      <el-button type="primary" @click="search" v-bind="searchBtnConfig">搜索</el-button>
      <el-button plain @click="reset" v-bind="searchBtnConfig">重置</el-button>
      <!-- 其他的按钮需求通过插槽传入 -->
      <slot name="searchBtn" :searchData="searchModel"></slot>
      <el-button v-if="searchConfig.length > 3" link @click="moreSearch = !moreSearch" style="color:#409eff">更多
        <el-icon>
          <ArrowDown :style="{
            transform: moreSearch
              ? ' rotate(-180deg)'
              : ' rotate(0deg)',
          }" />
        </el-icon>
      </el-button>
    </div>
  </el-form>
</template>
 
<!-- search.vue -->
<script lang="ts" setup>
import { ref, toRefs } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue'
import formItem from './formItem.vue';
const emits = defineEmits(["search"])
const props = defineProps({
  searchConfig: { // 搜索条件配置项
    type: Array<any>,
    required: true,
    default() {
      return []
    }
  },
  searchModel: { // 搜索条件绑定值
    type: Object,
    required: true,
    default() {
      return {}
    }
  },
  searchReset: { // 搜索条件默认值重置值
    type: Object,
    default() {
      return {}
    }
  },
  searchBtnConfig: {
    type: Object,
    default() {
      return {}
    }
  }
})
const { searchConfig, searchModel, searchReset } = toRefs(props)
// 表单dom对象
const form = ref()
// 是否显示更多搜索项
const moreSearch = ref(false)
// 要显示两倍宽度的日期选择项
const twiceDatePickerType = ["datetimerange", "daterange", "monthrange"]
const search = () => {
  emits('search', props.searchModel)
}
// 重置表单项为默认值
const reset = () => {
  if (props.searchReset) { // 如果传入有默认值，则重置后为默认值
    Object.keys(props.searchModel).forEach((item) => {
      props.searchModel[item] = props.searchReset[item]
    })
  } else {
    Object.keys(props.searchModel).forEach((item) => {
      props.searchModel[item] = ''
    })
  }
  form.value.resetFields()
  emits('search', props.searchModel)
}
</script>
<style scoped>
.search {
  display: grid;
  gap: 0px 20px;
  grid-template-columns: repeat(3, minmax(0px, 1fr));
}

.search-item {
  margin-bottom: 20px;
}

.span2 {
  grid-column: span 2/span 2;
}

.search-button {
  grid-column-start: 3;
  grid-column-end: 4;
  width: 100%;
  text-align: right;
}
</style>
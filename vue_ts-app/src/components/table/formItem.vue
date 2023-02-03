<!-- 表单匹配项 -->
<template>
  <el-input v-if="isInput" v-model="currentVal" :placeholder="placeholder" v-bind="bindProps" v-on="bindEvents"
    style="width: 100%;"></el-input>

  <el-input-number v-if="isInputNumber" v-model="currentVal" v-bind="bindProps" v-on="bindEvents"
    :controls-position="itemOptions['controls-position'] || 'right'" style="width: 100%;"
    :placeholder="placeholder"></el-input-number>

  <el-select v-if="isSelect" v-model="currentVal" v-bind="bindProps" v-on="bindEvents" clearable style="width: 100%;"
    :placeholder="placeholder">
    <el-option v-for="(selectItem, selectIndex) in itemOptions.selectList" :key="selectIndex"
      :label="selectItem[itemOptions.listLabel]" :value="selectItem[itemOptions.listValue]"></el-option>
  </el-select>

  <!-- datetimerange-->
  <el-date-picker v-if="isDatePickerDateTimeRange" v-model="currentVal" v-bind="bindProps" v-on="bindEvents"
    type="datetimerange" clearable start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"
    value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%;"></el-date-picker>
  <!-- daterange -->
  <el-date-picker v-if="isDatePickerDateRange" v-model="currentVal" v-bind="bindProps" v-on="bindEvents"
    type="daterange" clearable start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"
    value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
  <!-- monthrange -->
  <el-date-picker v-if="isDatePickerMonthRange" v-model="currentVal" v-bind="bindProps" v-on="bindEvents"
    type="monthrange" clearable start-placeholder="开始日期" range-separator="至" end-placeholder="结束日期"
    value-format="YYYY-MM" style="width: 100%;"></el-date-picker>

  <!-- others -->
  <el-date-picker v-if="isDatePickerOthers" v-model="currentVal" v-bind="bindProps" v-on="bindEvents"
    :type="itemOptions.datePickerType" clearable placeholder="请选择日期" style="width: 100%;"></el-date-picker>

  <el-cascader v-if="isCascader" v-model="currentVal" v-bind="bindProps" v-on="bindEvents" clearable
    style="width: 100%;"></el-cascader>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';

const emits = defineEmits(["update:modelValue"])
const props = defineProps({
  modelValue: {
    type: [String, Number]
  },
  itemOptions: {
    type: Object,
    default() {
      return {}
    }
  }
})
const { itemOptions } = toRefs(props)

// 双向绑定数据值
const currentVal = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits("update:modelValue", val)
  }
})
const placeholder = computed(() => {
  return props.itemOptions.type === "select" ? "请选择" + props.itemOptions.label : "请输入" + props.itemOptions.label
})
// 绑定属性
const bindProps = computed(() => {
  let obj = { ...itemOptions.value }
  // 移除冗余属性
  delete obj.label
  delete obj.prop
  delete obj.type
  delete obj.rules
  if (obj.type = "date-picker") {
    delete obj.datePickerType
  }
  if (obj.type === 'select') {
    delete obj.selectList
    delete obj.listLabel
    delete obj.listValue
  }
  return obj
})
// 绑定方法
const bindEvents = computed(() => {
  return itemOptions.value.events || {}
})
// el-input
const isInput = computed(() => {
  return itemOptions.value.type === 'input'
})
// el-input-number
const isInputNumber = computed(() => {
  return itemOptions.value.type === 'input-number'
})
// el-select
const isSelect = computed(() => {
  return itemOptions.value.type === 'select'
})
// el-date-picker (type: datetimerange)
const isDatePickerDateTimeRange = computed(() => {
  const isDatePicker = itemOptions.value.type === 'date-picker'
  const isDateTimeRange = itemOptions.value.datePickerType === 'datetimerange'
  return isDatePicker && isDateTimeRange
})
// el-date-picker (type: daterange)
const isDatePickerDateRange = computed(() => {
  const isDatePicker = itemOptions.value.type === 'date-picker'
  const isDateRange = itemOptions.value.datePickerType === 'daterange'
  return isDatePicker && isDateRange
})
// el-date-picker (type: monthrange)
const isDatePickerMonthRange = computed(() => {
  const isDatePicker = itemOptions.value.type === 'date-picker'
  const isMonthRange = itemOptions.value.datePickerType === 'monthrange'
  return isDatePicker && isMonthRange
})
//  el-date-picker (type: other)
const isDatePickerOthers = computed(() => {
  const isDatePicker = itemOptions.value.type === 'date-picker'
  return isDatePicker && !isDatePickerDateTimeRange.value && !isDatePickerDateRange.value && !isDatePickerMonthRange.value
})
// el-cascader
const isCascader = computed(() => {
  return itemOptions.value.type === 'cascader'
})


</script>


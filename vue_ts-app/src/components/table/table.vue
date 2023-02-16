<!-- table.vue -->
<template>
  <Search :searchConfig="searchConfig" :searchModel="searchModel" :searchReset="searchReset"
    :searchBtnConfig="searchBtnConfig" @search="getData(1)" v-if="searchConfig && searchConfig.length>0">
    <template v-slot:searchBtn="{ searchData }">
      <!-- 其他的按钮需求通过插槽传入 -->
      <slot name="searchBtn" :searchData="searchData"></slot>
    </template>
  </Search>
  <!-- 批量操作按钮，因为每个需求不同，批量操作的功能也不同，所以这里只放一个插槽，不设置默认内容，所有按钮均在父级设置 -->
  <div class="multiple-operation">
    <slot name="multiple-operation" :selectionData="selectionData"></slot>
  </div>
  <!-- 页面主表格 -->
  <el-table :data="tableData" :row-key="rowKey" v-loading="loading" @selection-change="selectionChange"
    style="border-radius: 4px;" v-bind="$attrs">
    <!-- 可选框（多选） -->
    <el-table-column v-if="selection === 'multiple'" type="selection" align="center" width="55"
      :reserve-selection="rowKey ? true : false" :selectable="selectable" />
    <!-- 可选框（单选） -->
    <el-table-column v-else-if="selection === 'single'" align="center" width="30">
      <template #default="scope">
        <el-radio v-model="selectionRadio" :label="scope.$index" :disabled="selectable ? !selectable(scope.row) : false"
          @change="selectionChangeSingle(scope.row)">
          {{ '' }}
        </el-radio>
      </template>
    </el-table-column>
    <!-- 展开行 -->
    <el-table-column v-if="expand" type="expand">
      <template v-slot:default="scope">
        <slot name="expand" :row="scope.row" :index="scope.$index"></slot>
      </template>
    </el-table-column>
    <!-- 展示数据 -->
    <el-table-column v-for="(item, index) in tableColumn" :key="index" :prop="item.prop" :label="item.label"
      :align="item.align" :show-overflow-tooltip="item.ellipsis" v-bind="{ ...tableColumnConfig, ...item.attrs }">
      <template v-if="item.slot" #default="scope">
        <slot :name="item.prop" :row="scope.row" :index="scope.$index"></slot>
      </template>
      <template v-else v-slot:default="scope">
        <span v-if="item.dictCode">
          {{ filterStatus(scope.row[item.dictCode],dict[item.dictCode]) }}
        </span>
        <span v-else-if="item.format">
          {{ item.format(scope.row) }}
        </span>
        <span v-else>
          {{ scope.row[item.prop] }}
        </span>
      </template>
    </el-table-column>
    <!-- 操作列：由于各行操作按钮可能并不相同，加上要权限控制，下面只放置一个插槽 -->
    <el-table-column v-if="setupConfig.width !== '0'" :fixed="setupConfig.fixed" :align="setupConfig.align"
      :width="setupConfig.width" label="操作">
      <template v-slot:default="scope">
        <slot name="setup" :row="scope.row" :index="scope.$index"></slot>
      </template>
    </el-table-column>
    <!-- 空状态 -->
    <template slot="empty">
      <p>{{ emptyText }}</p>
    </template>
  </el-table>
  <!-- 分页 -->
  <el-pagination v-if="pagination" :pager-count="5" :page-sizes="pageSizes || [10, 20, 50, 100]"
    :total="tableTotal || 0" v-model:page-size="pageInfo.pageSize" v-model:current-page="pageInfo.currentPage"
    layout="total, sizes, prev, pager, next, jumper" @size-change="sizeChange"
    @current-change="pageChange"></el-pagination>
</template>
 
<!-- table.vue -->
<script lang="ts" setup>
import { onMounted, reactive, toRefs, computed, PropType } from 'vue';
import Search from './search.vue'
import { tableColumn, rowKey, selectable, ResultType } from './type/table'

const props = defineProps({
  requestApi: { // 列表接口（必填）
    type: Function,
    required: true
  },
  tableColumn: { // 自定义列配置
    type: Array as PropType<tableColumn[]>,
    default: () => []
  },
  tableColumnConfig: {
    type: Object,
    dafault: {}
  },
  otherConfig: { // 其他配置
    type: Object,
    default: () => {
      return {
        list: 'list' // 接口返回数据的列表字段的字段名（因为在组件里面调接口，可能不同业务不同项目组不同一个开发者返回给前端的参数名不一致，这里进行兼容）
      }
    }
  },
  dict: { // 全部字典
    type: [Array, Object],
    default: () => []
  },
  selection: { // 是否显示可选框（多选-multiple 、单选-single ）
    type: String as PropType<'multiple' | 'single'>
  },
  selectable: { // 当前行是否可选择
    type: Function as PropType<selectable>
  },
  rowKey: { // 用来优化 Table 的渲染； 在使用reserve-selection功能与显示树形数据时，该属性是必填的
    type: [String, Number, Function] as PropType<rowKey>,
    default: () => ""
  },
  setupConfig: {
    type: Object,
    default: () => {
      return {
        width: 'auto'
      }
    }
  },
  pagination: { // 是否需要分页，默认需要
    type: Boolean,
    default: true
  },
  pageSizes: { // 分页的下拉框选项
    type: Array<number>
  },
  expand: { // 是否展开行
    type: Boolean,
    default: false
  },
  searchConfig: { // 搜索条件配置项
    type: Array,
    default() {
      return []
    }
  },
  searchReset: { // 搜索条件默认值重置值
    type: Object
  },
  searchBtnConfig: {
    type: Object,
    default() {
      return {}
    }
  },
  emptyText: {
    type: String
  }
})
const { requestApi, tableColumn, tableColumnConfig, otherConfig, dict, selection, selectable, rowKey, setupConfig, pagination, pageSizes, expand, searchConfig, searchReset, emptyText } = toRefs(props)
const state = reactive({
  loading: true,
  tableData: [],
  tableTotal: 0,
  pageInfo: {
    pageSize: 10,
    currentPage: 1
  },
  selectionRadio: '',
  selectionData: [] as any[],
  searchModel: props.searchReset ? JSON.parse(JSON.stringify(props.searchReset)) : {}
})
const { loading, tableData, tableTotal, pageInfo, selectionRadio, selectionData, searchModel } = toRefs(state)
onMounted(() => {
  getData()
})

const filterStatus = computed(() => {
  return function (value: number, array: Array<any>, code = 'value', name = 'label') {
    if (!value && value !== 0) { // 要把0摘出来，一般0都是正常的数据，所以不能只用  !value
      return ''
    }
    const find = array.find(e => (e[code] === value.toString()) || (e[code] === value)) // 字符型数值型都得匹配

    if (find) {
      return find[name]
    } else { // 没有匹配的就原样返回
      return value
    }
  }
})
const getData = (currentPage = state.pageInfo.currentPage) => {
  if (currentPage) { // 如果传入值，则从该值的页码数开始
    state.pageInfo.currentPage = currentPage
  }
  state.loading = true
  const fun = props.requestApi   // 获取请求的接口方法
  const pageInfo = { // 分页信息
    pageSize: state.pageInfo.pageSize,
    currentPage: state.pageInfo.currentPage
  }
  let param = { // 其他的搜素条件
    ...state.searchModel
  }
  if (props.pagination) { // 如果需要分页，则传分页信息
    param = { ...param, ...pageInfo }
  }
  // 请求接口
  fun(param).then((res: ResultType) => {
    // 后台返回形如
    state.tableData = props.pagination ? res.data[props.otherConfig.list] || [] : res.data
    state.tableTotal = res.data?.count || res.data?.total || 0;
    // 分页时如果当前页没有数据 且排除第一页
    if (props.pagination) {
      if (!res.data[props.otherConfig.list].length && state.pageInfo.currentPage !== 1) {
        // 页码减去 1
        state.pageInfo.currentPage -= 1;
        // 再调用自己
        getData();
      }
    }
  }).finally(() => {
    state.loading = false
  })
}

// 多选，选择行数据change
const selectionChange = (selection: Array<any>) => {
  state.selectionData = selection
}

// 单选，选择行数据change
const selectionChangeSingle = (selection: number) => {
  state.selectionData = [selection]
}

// 条数变化
const sizeChange = (size: number) => {
  state.pageInfo.currentPage = 1
  state.pageInfo.pageSize = size
  getData()
}

// 页码变化
const pageChange = (page: number) => {
  state.pageInfo.currentPage = page
  getData()
}

// 导出获取列表的函数
defineExpose({
  getData
})
</script>
<style scoped>
.table {
  margin: 30px;
}

.multiple-operation {
  margin-bottom: 10px;
}
</style>
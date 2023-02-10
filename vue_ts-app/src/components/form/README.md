## 功能

1. 可配置型的表单，通过 json 对象的方式自动生成表单
2. 具备完善的功能， 表单验证， 动态删减表单，集成第三方插件
3. 用法简单，扩展性好，便于维护
4. 多场景，如： 弹框嵌套表单

## 已完成

1. 分析`element-plus`表单能够用在哪些方面做优化
2. 完善类型，支持 ts（利用类型校验文件）
3. 具备原有的`element-plus`表单功能（利用属性透传 例如 v-bind="attr"）
4. 集成第三方插件： markdown 编辑器，富文本编辑器等等（使用了 wangEditor）。

## 资料

`element-plus`使用的表单校验插件是 async-validator 这个库，

[async-validator 地址](https://github.com/yiminghe/async-validator/blob/master/src/interface.ts)

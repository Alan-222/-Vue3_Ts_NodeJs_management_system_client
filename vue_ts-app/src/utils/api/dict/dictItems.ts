import $http from '../../http';
// 对字典项进行增删改
export const addDictItem = (form: DictItemFormData) => {
  return $http({
    url: '/dict/item/addDictItem',
    method: 'post',
    data: form
  });
};

export const updateDictItem = (dictItem_id: number, form: DictItemFormData) => {
  return $http({
    url: '/dict/item/editDictItem?id=' + dictItem_id,
    method: 'post',
    data: form
  });
};

export const deleteDictItems = (dictItem_id: Object) => {
  return $http({
    url: '/dict/item/delDictItem',
    method: 'post',
    data: dictItem_id
  });
};

// 根据id获取字典数据
export const getDictItemDetail = (dictItem_id: number) => {
  return $http({
    url: '/dict/item/getDictItem',
    method: 'get',
    params: {
      id: dictItem_id
    }
  });
};

import $http from '../../http';

// 获取字典列表
export const listDicts = (params: DictQueryForm) => {
  return $http({
    url: '/dict/listDict',
    method: 'get',
    params: params
  });
};

export const addDict = (form: DictFormData) => {
  return $http({
    url: '/dict/addDict',
    method: 'post',
    data: form
  });
};

export const updateDict = (dict_id: number, form: DictFormData) => {
  return $http({
    url: '/dict/editDict?id=' + dict_id,
    method: 'post',
    data: form
  });
};

export const deleteDicts = (dict_id: object) => {
  return $http({
    url: '/dict/delDict',
    method: 'post',
    data: dict_id
  });
};

// 根据id获取字典数据
export const getDictDetail = (dict_id: number) => {
  return $http({
    url: '/dict/getDict',
    method: 'get',
    params: {
      id: dict_id
    }
  });
};

// 根据字典名称获取字典数据
export const getDictByName = (dict_code: string) => {
  return $http({
    url: '/dict/getDictByName',
    method: 'get',
    params: {
      dict_code: dict_code
    }
  });
};

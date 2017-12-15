<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SchemaController extends Controller
{


    private $_filter = array(
        '_id',
        'id',
        'start',
        'action',
        'page',
        'limit',
        '__create_time__',
        '__removed__',
        '__modify_time__',
        '__old_id__',
        '__old_data__',
        '__project_id__',
        '__collection_id__',
        '__plugin_id__',
        '__plugin_collection_id__'
    );


    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * 获取表结构
     *
     */
    public function getCollectionSchema()
    {
        $query = array();
        $collection_id = request('collection_id', null);

        if ($collection_id == null) {
            return error('collection_id不能为空');
        }
        $query['collection_id'] = $collection_id;
        $db = new \App\Http\Models\Schema();
        $res = $db->getAllRecord($query, ['sort' => -1]);
        foreach ($res as &$val) {
            if ($val['schema_type'] == 'file') {
                $val['cellTemplate'] = "<a target=\"_blank\" ng-href=\"{{grid.getCellValue(row, col)}}\"><img width=\"64px\" height=\"30px\" ng-src=\"{{grid.getCellValue(row, col)}}?w=64&h=64\" lazy-src></a>";
            }
        }

        return result('ok', $res);
    }

    /**
     * 获取指定表的搜索结构
     * Created by kuppo.
     */
    public function getCollectionSchemaForSearch()
    {
        $query = array();
        $collection_id = request('collection_id', null);

        if ($collection_id == null) {
            return error('collection_id不能为空');
        }
        $query['collection_id'] = $collection_id;
        $db = new \App\Http\Models\Schema();
        $res = $db->getAllRecord($query, ['sort' => -1]);

        return result('ok', $res);
    }

    /**
     * 添加新属性
     *
     */
    public function save()
    {
        $name = request('name', '');
        $zh_name = request('zh_name', '');
        $schema_type = request('schema_type', '');
        $remark = request('remark', '');
        $collection_id = request('collection_id', '');
        $sort = (int)request('sort', 0);
        $visible = request('visible', true);
        if (($visible === 'false') || ($visible === false)) {
            $visible = false;
        } else {
            $visible = true;
        }
        $schema_id = request('_id', '');
        if (!$collection_id) {
            return error('未选集合');
        }
        if (!$name) {
            return error('名字为必填项');
        }
        if (!$schema_type) {
            return error('类型为必填项');
        }
        if ($this->checkSchemaNameExist($name, $collection_id, $schema_id)) {
            return error('属性名已经存在');
        }

        if (has_special_characters($name)) {
            return error('字段名必须为以英文字母开始的“字母、数字、下划线”的组合,“点”标注子属性时，子属性必须以字母开始');
        }

        if (in_array(strtolower($name), $this->_filter, true)) {
            return error('保留字段不允许作为字段名称,保留字段为：' . join(',', $this->_filter));
        }

        $data = array();
        $data['name'] = $name;
        $data['zh_name'] = $zh_name;
        $data['schema_type'] = $schema_type;
        $data['collection_id'] = $collection_id;
        $data['sort'] = $sort;
        $data['visible'] = $visible;
        $data['remark'] = $remark;
        $data['displayName'] = $data['zh_name'] . '(' . $data['name'] . ')';

        $db = new \App\Http\Models\Schema();
        if ($schema_id) {
            $old_data = $db->getOneById($schema_id);
            $db->updateByID($schema_id, $data);

            // 如果修改了字段名称，那么对于数据集合中的对应字段进行重命名操作
            if ($name != $old_data['name']) {
                $modelDocument = new \App\Http\Models\Document($collection_id);
                $modelDocument->updateMany([], ['$rename' => [$old_data['name'] => $name]]);
            }
        } else {
            $db->addRecord($data);
            //为集合现有数据添加默认值
            $modelDocument = new \App\Http\Models\Document($collection_id);
            $default_value = $db->getDefaultValue($schema_type);
            $modelDocument->addDefaultData([$name => ['$exists' => false]], ['$set' => [$name => $default_value]]);
        }

        return result('添加信息成功');
    }


    /**
     * 批量编辑
     */
    public function saveAll()
    {
        $data = request('data', []);

        $db = new \App\Http\Models\Schema();

        foreach ($data as $val) {
            if (!isset($val['_id'])) {
                break;
            }
            $schema_id = $val['_id'];
            $arr = [
                'sort' => 0,
                'visible' => true
            ];
            if (isset($val['sort'])) {
                $arr['sort'] = (int)$val['sort'];
            }
            if (isset($val['visible'])) {
                $arr['visible'] = (($val['visible'] === 'false') || ($val['visible'] === false)) ? false : true;
            }

            $db->updateByID($schema_id, $arr);
        }

        return result('保存成功');
    }


    /**
     * 删除属性
     *
     * @author kuppo
     * @name 删除新的项目
     * @version 2013.11.14 kuppo
     * @return JsonModel
     */
    public function delete()
    {
        $id = request('id', null);


        if (!$id) {
            return error('请选择你要删除的项');
        }
        $db = new \App\Http\Models\Schema();
        $db->delete($id);
        return result('删除信息成功');
    }

    /**
     * 检测集合的属性是否存在
     *
     * @param string $info
     * @return boolean
     */
    private function checkSchemaNameExist($info, $collection_id, $schema_id = null)
    {
        $db = new \App\Http\Models\Schema();
        $query = [
            'name' => $info,
            'collection_id' => $collection_id
        ];
        if ($schema_id) {
            $query['_id'] = ['$ne' => myMongoId($schema_id)];
        }
        $info = $db->getOneRecord($query);

        if ($info == null) {
            return false;
        }
        return true;
    }
}

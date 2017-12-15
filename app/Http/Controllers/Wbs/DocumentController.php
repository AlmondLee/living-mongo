<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DocumentController extends Controller
{
    /** @var  \App\Http\Models\Collection */
    private $collectionInfo;

    /** @var  \App\Http\Models\Document */
    private $modelDocument;


    public function __construct()
    {
        $this->middleware('auth');

        $collection_id = request('collection_id', '');
        $this->collection_id = $collection_id;
        if (!$collection_id) {
            return error('collection_id不能为空');
        }

        $this->modelDocument = new \App\Http\Models\Document($collection_id);
    }

    /**
     * 读取集合中的文档
     */
    public function index()
    {
        $page = request('page', 1);
        $num = request('num', 10);
        $query = request('query', []);
        $query = $this->modelDocument->formatQuery($query);

        $modelSchema = new \App\Http\Models\Schema();
        $classifyFiled = $modelSchema->classifyFiled($this->collection_id);
        $res = $this->modelDocument->getList($query, ['_id' => -1], $page, $num);
        foreach ($res['datas'] as &$val) {
            foreach ($classifyFiled['embedded_document_fields'] as $file_field) {
                if (isset($val[$file_field])) {
                    $val[$file_field] = json_encode($val[$file_field]);
                }
            }
            foreach ($classifyFiled['date_fields'] as $date_field) {
                if (isset($val[$date_field]) && ($val[$date_field] instanceof \MongoDB\BSON\UTCDateTime)) {
                    $val[$date_field] = date('Y-m-d H:i:s', seconds($val[$date_field]->__tostring()));
                }
            }
        }
        return result('ok', $res);
    }


    /**
     * 添加或编辑
     */
    public function save()
    {
        $collection_id = request('collection_id', null);
        $new_data = request('data', []);
        $document_id = isset($new_data['_id']) ? $new_data['_id'] : null;

        if (!$collection_id) {
            return error('参数错误');
        }

        if ($document_id) {
            $old_data = $this->modelDocument->getOneById($document_id);
        } else {
            $old_data = [];
        }
        try {
            $datas = $this->formatData($collection_id, $new_data, $old_data);
        } catch (\Exception $e) {
            return error($e->getMessage());
        }

        //不知道当初为什么要存collection_id，先屏蔽
//        $datas['collection_id'] = $collection_id;
        if ($document_id) {
            $this->modelDocument->updateByID($document_id, $datas);
        } else {
            $this->modelDocument->addRecord($datas);
        }

        return result('添加信息成功');
    }


    /**
     * 添加或编辑
     */
    public function saveAll()
    {
        $collection_id = request('collection_id', null);
        $new_datas = request('data', []);
        if (!$collection_id) {
            return error('参数错误');
        }
        foreach ($new_datas as $new_data) {
            $document_id = $new_data['_id'];
            try {
                $old_data = $this->modelDocument->getOneById($document_id);
                $datas = $this->formatData($collection_id, $new_data, $old_data);
            } catch (\Exception $e) {
                return error($e->getMessage());
            }

            $this->modelDocument->updateByID($document_id, $datas);
        }

        return result('保存成功');
    }

    /** 格式化要新增或保存的数据
     *  $collection_id  集合id
     *  $new_data     要插入的数据
     *  $old_data     老数据（保存操作需要此参数，新增操作不需要此参数）
     */
    private function formatData($collection_id, $new_data, $old_data = [])
    {
        //判断数据是否过期
        if ($old_data) {
            if ($new_data['__MODIFY_TIME__'] != $old_data['__MODIFY_TIME__']) {
                throw new \Exception("数据已过期，请刷新后重新编辑！");
            }
        }

        //获取该表的结构
        $modelSchema = new \App\Http\Models\Schema();
        $query = [
            'collection_id' => $collection_id
        ];
        $schema = $modelSchema->getAllRecord($query);
        $datas = [];

        //处理有结构的字段
        foreach ($schema as $val) {
            if (isset($new_data[$val['name']])) {
                $data = $new_data[$val['name']];
                switch ($val['schema_type']) {
                    case "single-line-text" :
                        $datas[$val['name']] = $data;
                        break;
                    case "multi-line-text" :
                        $datas[$val['name']] = $data;
                        break;
                    case "digital" :
                        $datas[$val['name']] = floatToInt($data);
                        break;
                    case "float-digital" :
                        $datas[$val['name']] = floatval($data);
                        break;
                    case "non-input" :
                        if (is_bool($data)) {
                            $datas[$val['name']] = $data;
                        } else if ($data == 'true') {
                            $datas[$val['name']] = true;
                        } else if ($data == 'false') {
                            $datas[$val['name']] = false;
                        } else {
                            throw new \Exception($val['zh_name'] . "字段不是bool类型！");
                        }
                        break;
                    case "array" :
                        if (is_array($data)) {
                            $datas[$val['name']] = $data;
                        } elseif (is_string($data)) {
                            $datas[$val['name']] = explode(',', $data);
                        } else {
                            throw new \Exception($val['zh_name'] . "字段不是数组！");
                        }
                        break;
                    case "embedded-document" :
                        if (json_decode($data)) {
                            $datas[$val['name']] = json_decode($data, true);
                        } else {
                            throw new \Exception($val['zh_name'] . "字段不符合json格式！");
                        }
                        break;
                    case "file" :
                        $datas[$val['name']] = $data;
                        break;
                    case "rich-text" :
                        $datas[$val['name']] = $data;
                        break;
                    case "date" :
                        if (milliseconds($data) === false) {
                            throw new \Exception($val['zh_name'] . "字段不符合日期格式！");
                        }
                        $data = new \MongoDB\BSON\UTCDateTime(milliseconds($data));
                        $datas[$val['name']] = $data;
                        break;
                }
            } else {
                $datas[$val['name']] = $modelSchema->getDefaultValue($val['schema_type']);
            }
        }

        if (empty($datas)) {
            throw new \Exception("提交数据中未包含有效字段！");
        }
        return $datas;
    }



    /**
     * 删除
     */
    public function delete()
    {
        $ids = request('ids', []);
        if (empty($ids)) {
            return error('请选择你要删除的项');
        }
        foreach ($ids as $val) {
            $this->modelDocument->delete($val);
        }
        return result('删除信息成功');
    }

    /**
     * 清空指定表
     */
    public function clearTable()
    {
        $collection_id = request('collection_id', '');
        $collection_name = request('collection_name', '');

        if (!$collection_id) {
            return error('请选择你要删除的项');
        }

        $db = new \App\Http\Models\Collection();
        $collectioninfo = $db->getOneById($collection_id);
        if ($collection_name != $collectioninfo['name']) {
            return error('确认信息不符！');
        }
        $this->modelDocument->remove([]);

        return result('删除信息成功');
    }
}

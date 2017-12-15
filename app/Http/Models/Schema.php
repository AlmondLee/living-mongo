<?php
namespace App\Http\Models;


class Schema extends Model
{
    public $collectionName = 'schema';
    public $__wbsmgt__ = true;

    /**
     * "single-line-text" : "单行文本",
     * "multi-line-text" : "多行文本",
     * "digital" : "整型数字",
     * "float-digital" : "浮点型数字",
     * "non-input" : "是非",
     * "array" : "数组",
     * "embedded-document" : "内嵌文档",
     * "file" : "文件",
     * "rich-text" : "富文本",
     * "date" : "日期"
     */
    const field_single_line_text = 'single-line-text';
    const field_multi_line_text = 'multi-line-text';
    const field_digital = 'digital';
    const field_float_digital = 'float-digital';
    const field_non_input = 'non-input';
    const field_array = 'array';
    const field_embedded_document = 'embedded-document';
    const field_file = 'file';
    const field_rich_text = 'rich-text';
    const field_date = 'date';


    /**
     * 获取指定结构的默认值
     */
    public function getDefaultValue($schema_type)
    {
        switch ($schema_type) {
            case "single-line-text" :
                $defaultValue = '';
                break;
            case "multi-line-text" :
                $defaultValue = '';
                break;
            case "digital" :
                $defaultValue = 0;
                break;
            case "float-digital" :
                $defaultValue = floatval(0);
                break;
            case "non-input" :
                $defaultValue = false;
                break;
            case "array" :
                $defaultValue = [];
                break;
            case "embedded-document" :
                $defaultValue = ["" => ""];
                break;
            case "file" :
                $defaultValue = '';
                break;
            case "rich-text" :
                $defaultValue = '';
                break;
            case "date" :
                $defaultValue = new \MongoDB\BSON\UTCDateTime(0);
                break;
            default:
                $defaultValue = '';
                break;
        }
        return $defaultValue;
    }

    /**
     * 将指定表的字段分类输出
     */
    public function classifyFiled($collection_id)
    {
        $single_line_text_fields = [];
        $multi_line_text_fields = [];
        $digital_fields = [];
        $float_digital_fields = [];
        $non_input_fields = [];
        $array_fields = [];
        $embedded_document_fields = [];
        $file_fields = [];
        $rich_text_fields = [];
        $date_fields = [];

        $collection = $this->getAllRecord(['collection_id' => $collection_id]);
        foreach ($collection as $val) {
            //"file" : "文件"
            if ($val['schema_type'] == self::field_file) {
                array_push($file_fields, $val['name']);
                continue;
            }
            //"date" : "日期
            if ($val['schema_type'] == self::field_date) {
                array_push($date_fields, $val['name']);
                continue;
            }
            //embedded-document" : "内嵌文档"
            if ($val['schema_type'] == self::field_embedded_document) {
                array_push($embedded_document_fields, $val['name']);
                continue;
            }
            //"single-line-text" : "单行文本"
            if ($val['schema_type'] == self::field_single_line_text) {
                array_push($single_line_text_fields, $val['name']);
                continue;
            }
            //"multi-line-text" : "多行文本"
            if ($val['schema_type'] == self::field_multi_line_text) {
                array_push($multi_line_text_fields, $val['name']);
                continue;
            }
            //"digital" : "整型数字"
            if ($val['schema_type'] == self::field_digital) {
                array_push($digital_fields, $val['name']);
                continue;
            }
            //"float-digital" : "浮点数字"
            if ($val['schema_type'] == self::field_float_digital) {
                array_push($float_digital_fields, $val['name']);
                continue;
            }
            //"non-input" : "是非"
            if ($val['schema_type'] == self::field_non_input) {
                array_push($non_input_fields, $val['name']);
                continue;
            }
            //"array" : "数组"
            if ($val['schema_type'] == self::field_array) {
                array_push($array_fields, $val['name']);
                continue;
            }
            //"rich-text" : "富文本"
            if ($val['schema_type'] == self::field_rich_text) {
                array_push($rich_text_fields, $val['name']);
                continue;
            }
        }
        return [
            'file_fields' => $file_fields,
            'date_fields' => $date_fields,
            'embedded_document_fields' => $embedded_document_fields,
            'single_line_text_fields' => $single_line_text_fields,
            'multi_line_text_fields' => $multi_line_text_fields,
            'digital_fields' => $digital_fields,
            'float_digital_fields' => $float_digital_fields,
            'non_input_fields' => $non_input_fields,
            'array_fields' => $array_fields,
            'rich_text_fields' => $rich_text_fields,
        ];
    }

    /**
     * 获取结构名所组成的数组
     */
    public function getSchema($collection_id)
    {
        $collection = $this->getAllRecord(['collection_id' => $collection_id]);
        $arr = [];
        foreach ($collection as $val) {
            array_push($arr, $val['name']);
        }
        return $arr;
    }


    /** 获取单条记录
     * @param $query
     * @param array $fields
     * @return mixed
     */
    public function getOneRecord($query = [], $fields = [])
    {
        return $this->findOne($query, $fields);
    }

    /** 添加记录
     * @param $data
     */
    public function addRecord($data)
    {
        $this->insert($data);
    }

    /** 更新记录
     * @param $id
     * @param $data
     */
    public function updateByID($id, $data)
    {
        $query = [
            '_id' => $id instanceof \MongoDB\BSON\ObjectID ? $id : myMongoId($id)
        ];
        $data = [
            '$set' => $data
        ];
        $this->update($query, $data);
    }

    /** 获取列表
     * @param $query
     * @param $sort
     * @param $page
     * @param $num
     * @return mixed
     */
    public function getList($query = [], $sort = [], $page = 1, $num = 10, $fields = [])
    {
        return $this->find($query, $sort, ($page - 1) * $num, $num, $fields);
    }

    /** 更新and返回
     * @param $data
     */
    public function findAndUpdate($id, $data)
    {
        $query = [
            '_id' => $id instanceof \MongoDB\BSON\ObjectID ? $id : myMongoId($id)
        ];

        $option = [
            'query' => $query,
            'update' => $data,
        ];
        return $this->findAndModify($option);
    }


    /** 更新记录
     * @param $query
     * @param $data
     */
    public function updateRecord($query, $data)
    {
        $data = [
            '$set' => $data
        ];
        $this->update($query, $data);
    }

    /**  获取所有数据
     * @return mixed
     */
    public function getAllRecord($query = [], $sort = [], $fields = [])
    {
        return $this->findAll($query, $sort, $fields);
    }

    /** 获取单条记录
     * @param $query
     * @param array $fields
     * @return mixed
     */
    public function getOneById($id, $fields = [])
    {
        $query = [
            '_id' => $id instanceof \MongoDB\BSON\ObjectID ? $id : myMongoId($id)
        ];
        $result = $this->findOne($query, $fields);
        return $result;
    }

    /**  上传文件返回文件id
     * @param $file_name
     * @return bool
     */
    public function uploadAndGetId($file_name)
    {
        if (!empty($_FILES[$file_name])) {
            $logoinfo = $this->uploadFile($file_name);
            $file_id = $logoinfo[$file_name]['_id']['$id'];
        } else {
            $file_id = false;
        }
        return $file_id;
    }

    /** 删除
     */
    public function delete($id)
    {
        $query = [
            '_id' => $id instanceof \MongoDB\BSON\ObjectID ? $id : myMongoId($id)
        ];
        return $this->remove($query);
    }

    public function uploadMulAndGetId($file_name)
    {
        $arrayImages = array();
        for ($i = 1; ; $i++) {
            if (empty($_FILES[$file_name . $i]))
                break;
            if ($_FILES[$file_name . $i]['size']) {
                $arrayTmp = $this->uploadFile($file_name . $i);
                $arrayImages[] = $arrayTmp[$file_name . $i]['_id']['$id'];
            }
        }
        return $arrayImages;
    }

    /** count
     */
    public function getCount($query)
    {
        return $this->count($query);
    }
}
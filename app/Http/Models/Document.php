<?php
namespace App\Http\Models;


class Document extends Model
{

    public function __construct($collectionName,$PRODUCTION = null)
    {
        $this->collectionName = $collectionName;
        parent::__construct();
        $this->PRODUCTION = $PRODUCTION;
    }



    /** 处理查询语句
     */
    public function formatQuery($input_query)
    {
        $output_query = [];
        foreach ($input_query as $query_key => $query_val) {
            if ($query_key == '_id') {
                if ($query_val['text'] != '') {
                    $output_query['_id'] = myMongoId($query_val['text']);
                    continue;
                }
            }
            if (!is_array($query_val)) {
                if ($query_val == '') {
                    continue;
                }
                $output_query[$query_key] = (bool)$query_val;
            } else {
                $a = [];
                foreach ($query_val as $key => $val) {
                    if ($val == '') {
                        continue;
                    }
                    if ($key == 'text') {
                        if (isset($query_val['fuzzy']) && $query_val['fuzzy'] && ($query_val['fuzzy'] != 'false')) {
                            $a = new \MongoDB\BSON\Regex(".*" . $val . ".*", 'i');
                        } else {
                            $a = $val;
                        }
                    }
                    if ($key == 'start') {
                        $a['$gte'] = myMongoData($val);
                    }
                    if ($key == 'end') {
                        $a['$lte'] = myMongoData($val);
                    }
                    if ($key == 'min') {
                        $a['$gte'] = (float)$val;
                    }
                    if ($key == 'max') {
                        $a['$lte'] = (float)$val;
                    }
                }
                if ($a) {
                    $output_query[$query_key] = $a;
                }
            }
        }
//        dd($input_query, $output_query);
        return $output_query;
    }

    /** 更新记录通过option
     * @param $query
     * @param $option
     */
    public function updateByOption($query, $option)
    {
        $this->update($query, $option);
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
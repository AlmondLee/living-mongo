<?php
namespace App\Http\Models;


class Test extends Model
{
    public $collectionName = '594f6cabd0c3bc72ab7c83c3';

    public function __construct($PRODUCTION = null)
    {
        parent::__construct();
        $this->PRODUCTION = $PRODUCTION;
    }

    /** 获取单条记录
     * @param $query
     * @param array $fields
     * @return mixed
     */
    public function getOneRecord($query = [], $fields = [])
    {
        $res = $this->findOne($query, $fields);
        return convertToPureArray($res);
    }

    /** 添加记录
     * @param $data
     */
    public function addRecord($data)
    {
        $res = $this->insert($data);
        if ($res) {
            return $res['_id'];
        } else {
            return null;
        }
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
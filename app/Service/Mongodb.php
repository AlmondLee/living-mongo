<?php
namespace App\Service;

class Mongodb
{

    /**
     * 查询操作列表
     *
     * @var array
     */
    private $_queryHaystack = array(
        '$and',
        '$or',
        '$nor',
        '$not',
        '$where'
    );

    /**
     * 更新操作列表
     *
     * @var array
     */
    private $_updateHaystack = array(
        '$set',
        '$inc',
        '$unset',
        '$rename',
        '$setOnInsert',
        '$addToSet',
        '$pop',
        '$pullAll',
        '$pull',
        '$pushAll',
        '$push',
        '$each',
        '$slice',
        '$sort',
        '$bit',
        '$isolated'
    );

    /**
     * 是否开启追加参数__REMOVED__:true
     *
     * @var boolean
     */
    private $_noAppendQuery = false;

    /**
     * 强制同步写入操作
     *
     * @var boolean
     */
    const fsync = false;

    /**
     * 是否开启更新不存在插入数据
     *
     * @var boolean
     */
    const upsert = false;

    /**
     * 允许更改多项
     *
     * @var boolean
     */
    const multiple = true;

    /**
     * 仅此一项
     *
     * @var boolean
     */
    const justOne = false;

    /**
     * 构造函数
     */
    private $__PRODUCTION__;

    public function __construct($collection = null, $__PRODUCTION__ = false)
    {
        $this->__PRODUCTION__ = $__PRODUCTION__;
            $mongodb_address = env('MONGODB_HOST');
            $this->mongodb_address = env('MONGODB_HOST');


        $this->database = (new \MongoDB\Client($mongodb_address))->WBS;
        if ($collection) {
            $this->no_pre_collection_id = $collection;
            $collection = 'wbs_' . $collection;
            $this->collection_id = $collection;
            $this->collection = $this->database->$collection;
        }

        return $this;
    }


    public function getBucket()
    {
        return $this->database->selectGridFSBucket();
    }

    public function getFileDocumentForStream()
    {
        return $this->database->selectGridFSBucket();
    }

    public function uploadFile($fieldName)
    {
        if (!isset($_FILES[$fieldName])) {
            throw new \Exception('$_FILES[$fieldName]无效');
        }

        $bucket = $this->database->selectGridFSBucket();
        $options = ['metadata' => ['type' => $_FILES[$fieldName]['type']]];
        $file = fopen($_FILES[$fieldName]['tmp_name'], 'rb');
        $info = $bucket->uploadFromStream($_FILES[$fieldName]['name'], $file, $options);

        return [
            '_id' => myMongoId($info),
            'url' => '//' . $_SERVER['HTTP_HOST'] . '/file/' . myMongoId($info),
            'url_https' => '//' . $_SERVER['HTTP_HOST'] . '/file/' . myMongoId($info),
        ];
    }

    /**
     * 是否开启追加模式
     *
     * @param boolean $boolean
     */
    public function setNoAppendQuery($boolean)
    {
        $this->_noAppendQuery = is_bool($boolean) ? $boolean : false;
    }

    /**
     * 检测是简单查询还是复杂查询，涉及复杂查询采用$and方式进行处理，简单模式采用连接方式进行处理
     *
     * @param array $query
     * @throws \Exception
     */
    private function appendQuery(array $query = null)
    {
        if (!is_array($query)) {
            $query = array();
        }
        if ($this->_noAppendQuery) {
            return $query;
        }

        $keys = array_keys($query);
        $intersect = array_intersect($keys, $this->_queryHaystack);
        if (!empty($intersect)) {
            $query = array(
                '$and' => array(
                    $query,
                    array(
                        '__REMOVED__' => false
                    )
                )
            );
        } else {
            $query['__REMOVED__'] = false;
        }
        return $query;
    }


    /**
     * aggregate框架指令达成
     *
     * @return mixed
     */
    public function aggregate($pipeline, $op = NULL, $op1 = NULL)
    {
        if (!$this->_noAppendQuery) {
            if (isset($pipeline[0]['$geoNear'])) {
                $first = array_shift($pipeline);
                array_unshift($pipeline, array(
                    '$match' => array(
                        '__REMOVED__' => false
                    )
                ));
                array_unshift($pipeline, $first);
            } elseif (isset($pipeline[0]['$match'])) {
                // 解决率先执行$match:{__REMOVED__:false}导致的性能问题
                $pipeline[0]['$match'] = $this->appendQuery($pipeline[0]['$match']);
            } else {
                array_unshift($pipeline, array(
                    '$match' => array(
                        '__REMOVED__' => false
                    )
                ));
            }
        }

        return $this->collection->aggregate($pipeline)->toArray();
    }

    /**
     * 统计符合条件的数量
     *
     * @see MongoCollection::count()
     */
    public function count($query = NULL)
    {
        $query = $this->appendQuery($query);
        $options = array();
        return $this->collection->count($query, $options);
    }

    /**
     * 根据指定字段
     *
     * @param string $key
     * @param array $query
     */
    public function distinct($key, $query = null)
    {
        $query = $this->appendQuery($query);
        return $this->collection->distinct($key, $query);
    }


    /**
     * 新的写法，创建索引
     *
     * @param array $keys
     * @param array $options
     */
    public function createIndex($keys, array $options = NULL)
    {
        if ($this->checkIndexExist($keys)) {
            return true;
        }
        $default = array();
        $default['background'] = true;
        $default['w'] = 0;
        $options = ($options === NULL) ? $default : array_merge($default, $options);
        if (version_compare(\MongoClient::VERSION, '1.5.0', '>='))
            return $this->collection->createIndex($keys, $options);
        else
            return $this->collection->ensureIndex($keys, $options);
    }

    /**
     * 检测集合的某个索引是否存在
     *
     * @param array $keys
     * @return boolean
     */
    public function checkIndexExist($keys)
    {
        $indexs = $this->collection->getIndexInfo();
        if (!empty($indexs) && is_array($indexs)) {
            foreach ($indexs as $index) {
                if ($index['key'] == $keys) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 查询符合条件的项目，自动排除__REMOVED__:true的结果集
     *
     * @see MongoCollection::find()
     */
    public function findAll($query = [], $sort = [], $fields = [])
    {
        $options = [];
        if (!empty($sort)) {
            $options['sort'] = $sort;
        }
        if (!empty($fields)) {
            $options['projection'] = $fields;
        }
        $cursor = $this->collection->find($this->appendQuery($query), $options)->toArray();

        return convertToPureArray($cursor);
    }

    /**
     * 返回值不做convertToPureArray处理
     *
     * @see MongoCollection::find()
     */
    public function findAllOrg($query = [], $sort = [], $fields = [])
    {
        $options = [];
        if (!empty($sort)) {
            $options['sort'] = $sort;
        }
        if (!empty($fields)) {
            $options['projection'] = $fields;
        }
        $cursor = $this->collection->find($this->appendQuery($query), $options)->toArray();

        return $cursor;
    }

    /**
     * 查询符合条件的一条数据
     *
     * @see MongoCollection::findOne()
     */
    public function findOne($query = [], $fields = [])
    {
        $options = [];
        if (!empty($fields)) {
            $options['projection'] = $fields;
        }
        $restaurant = $this->collection->findOne($this->appendQuery($query), $options);
        return convertToPureArray($restaurant);
    }

    /**
     * 获取符合条件的全部数据
     *
     * @param array $query
     * @param array $sort
     * @param int $skip
     * @param int $limit
     * @param array $fields
     * @return array
     */
    public function find($query = [], $sort = [], $skip = 0, $limit = 0, $fields = [])
    {
        $fields = empty($fields) ? array() : $fields;
        $options = [];

        if (!empty($sort)) {
            $options['sort'] = $sort;
        }

        if (!empty($skip)) {
            $options['skip'] = (int)$skip;
        }

        if ($limit > 0) {
            $options['limit'] = (int)$limit;
        }

        if (!empty($fields)) {
            $options['projection'] = $fields;
        }
        $cursor = $this->collection->find($this->appendQuery($query), $options)->toArray();
        $total = $this->collection->count($this->appendQuery($query));

        $rst = array(
            'datas' => $cursor,
            'total' => $total
        );
        return convertToPureArray($rst);
    }

    /**
     * findAndModify操作
     * 特别注意：__REMOVED__ __MODIFY_TIME__ __CREATE_TIME__ 3个系统保留变量在update参数中的使用
     *
     * @param array $query
     * @param array $update
     * @param array $fields
     * @param array $options
     * @return array
     */
    public function findAndModify(array $query, array $update = [], array $fields = [], array $options = [])
    {
        $query = $this->appendQuery($query);

        unset($options['upsert']);

        if (!empty($fields)) {
            $options['projection'] = $fields;
        }
        $updatedRestaurant = $this->collection->findOneAndUpdate($query, $update, $options);
        return $updatedRestaurant;
    }


    /**
     * 插入数据
     *
     * @param array $object
     * @param array $options
     */
    public function insert($a)
    {
        $a = $this->formatInsertData($a);
        if (empty($a))
            throw new \Exception('$object is NULL');

        array_unset_recursive($a, array(
            '__CREATE_TIME__',
            '__MODIFY_TIME__',
            '__REMOVED__'
        ));

        if (isset($a['_id'])) {
            $a['_id'] = $a['_id'] instanceof \MongoDB\BSON\ObjectID ? $a['_id'] : myMongoId($a['_id']);
        }

        if (!isset($a['__CREATE_TIME__'])) {
            $a['__CREATE_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());
        }

        if (!isset($a['__MODIFY_TIME__'])) {
            $a['__MODIFY_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());
        }

        if (!isset($a['__REMOVED__']) && !$this->_noAppendQuery) {
            $a['__REMOVED__'] = false;
        }
        $insertOneResult = $this->collection->insertOne($a);

        return [
            '_id' => myMongoId($insertOneResult->getInsertedId())
        ];
    }

    /**
     * 批量插入数据
     *
     * @param array $object
     * @param array $options
     */
    public function insertMany($datas)
    {
        if (empty($datas))
            return [];

        foreach ($datas as &$data) {
            if (isset($data['_id'])) {
                $data['_id'] = $data['_id'] instanceof \MongoDB\BSON\ObjectID ? $data['_id'] : myMongoId($data['_id']);
            }

            $data['__CREATE_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());
            $data['__MODIFY_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());
            $data['__REMOVED__'] = false;
        }

        $insertManyResult = $this->collection->insertMany($datas);

        return $insertManyResult->getInsertedIds();
    }


    /**
     * 禁止物理drop操作,改为重命名集合
     */
    function drop($query = [])
    {
        $oldCollectionName = $this->collection_id;
        $newCollectionName = 'bak_' . date('YmdHis') . '_' . $oldCollectionName;
        $total = $this->collection->count([]);
        if ($total) {
            $server = (new \MongoDB\Client($this->mongodb_address));
            $command = array("renameCollection" => "WBS." . $oldCollectionName, "to" => "WBS." . $newCollectionName, "dropTarget" => "true");
            $command = new \MongoDB\Driver\Command($command);
            $dropres = $server->getManager()->executeCommand("admin", $command)->toArray();
            if (isset($dropres[0]->ok) && $dropres[0]->ok) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }


    /**
     * 删除指定范围的数据
     *
     * @param array $criteria
     * @param array $options
     */
    public function remove($criteria = NULL, array $options = NULL)
    {
        if ($criteria === NULL)
            throw new \Exception('$criteria is NULL');

        $default = array(
            'justOne' => self::justOne,
            'fsync' => self::fsync
        );

        $options = ($options === NULL) ? $default : array_merge($default, $options);

        if (!$options['justOne']) {
            $options['multiple'] = true;
        }

        $criteria = $this->appendQuery($criteria);
        return $this->collection->updateMany($criteria, array(
            '$set' => array(
                '__REMOVED__' => true
            )
        ), $options);

    }

    /**
     * 更新指定范围的数据
     *
     * @param array $criteria
     * @param array $object
     * @param array $options
     */
    public function update($criteria, $object, array $options = NULL)
    {
        if (!is_array($criteria))
            throw new \Exception('$criteria is array');

        if (empty($object))
            throw new \Exception('$object is empty');

        $keys = array_keys($object);
        foreach ($keys as $key) {
            if (!in_array($key, $this->_updateHaystack, true)) {
                throw new \Exception('$key must contain ' . join(',', $this->_updateHaystack));
            }
        }
        $default = array(
            'upsert' => self::upsert,
            'multiple' => self::multiple,
            'fsync' => self::fsync
        );

        $options = ($options === NULL) ? $default : array_merge($default, $options);

        $criteria = $this->appendQuery($criteria);
        array_unset_recursive($object, array(
            '__CREATE_TIME__',
            '__MODIFY_TIME__',
            '__REMOVED__'
        ));

        $object['$set']['__MODIFY_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());

        $updateResult = $this->collection->updateOne($criteria, $object, $options);
        return $updateResult;
    }

    /**
     * 更新指定范围的数据
     *
     * @param array $criteria
     * @param array $object
     * @param array $options
     */
    public function updateMany($criteria, $object, array $options = NULL)
    {
        if (!is_array($criteria))
            throw new \Exception('$criteria is array');

        if (empty($object))
            throw new \Exception('$object is empty');

        $keys = array_keys($object);
        foreach ($keys as $key) {
            if (!in_array($key, $this->_updateHaystack, true)) {
                throw new \Exception('$key must contain ' . join(',', $this->_updateHaystack));
            }
        }
        $default = array(
            'upsert' => self::upsert,
            'multiple' => self::multiple,
            'fsync' => self::fsync
        );

        $options = ($options === NULL) ? $default : array_merge($default, $options);

        $criteria = $this->appendQuery($criteria);
        array_unset_recursive($object, array(
            '__CREATE_TIME__',
            '__MODIFY_TIME__',
            '__REMOVED__'
        ));

        $object['$set']['__MODIFY_TIME__'] = new \MongoDB\BSON\UTCDateTime(milliseconds());

        $updateResult = $this->collection->updateMany($criteria, $object, $options);
        return $updateResult;
    }


    /** 将结构里有而插入的时候没有的字段补齐
     *  $collection_id  集合id
     *  $new_data     要插入的数据
     */
    private function formatInsertData($new_data)
    {
        //获取该表的结构
        $query = [
            'collection_id' => $this->no_pre_collection_id
        ];
        $db = new \App\Service\Mongodb('schema', (bool)PRODUCTION);
        $schema = $db->findAll($query);

        //将结构里有而插入的时候没有的字段补齐
        $datas = [];
        foreach ($schema as $val) {
            if (!isset($new_data[$val['name']])) {
                switch ($val['schema_type']) {
                    case "single-line-text" :
                        $datas[$val['name']] = '';
                        break;
                    case "multi-line-text" :
                        $datas[$val['name']] = '';
                        break;
                    case "digital" :
                        $datas[$val['name']] = 0;
                        break;
                    case "non-input" :
                        $datas[$val['name']] = false;
                        break;
                    case "array" :
                        $datas[$val['name']] = [];
                        break;
                    case "embedded-document" :
                        $datas[$val['name']] = ["" => ""];
                        break;
                    case "file" :
                        $datas[$val['name']] = '';
                        break;
                    case "rich-text" :
                        $datas[$val['name']] = '';
                        break;
                    case "date" :
                        $data = new \MongoDB\BSON\UTCDateTime(0);
                        $datas[$val['name']] = $data;
                        break;
                }
            }
        }

        return array_merge($datas, $new_data);
    }

}

<?php

namespace App\Http\Controllers\Wbs;

use App\Http\Controllers\Controller;

/**
 * 索引控制器
 */
class IndexController extends Controller
{
    /**
     * 索引类型
     */
    private $_indexType = array(
        '2d',
        '2dsphere',
        'text',
        'hashed'
    );

    private $database;
    private $collection;
    private $collection_id;

    public function __construct()
    {
        $collection_id = request('collection_id', '');
        $this->nopre_collection_id =  $collection_id;
        $this->collection_id = 'wbs_' . $collection_id;

            $mongodb_address = env('MONGODB_HOST');


        $this->database = (new \MongoDB\Client($mongodb_address))->WBS;
        $this->collection = $this->database->$collection_id;
    }

    /**
     * 获取全部索引信息
     */
    public function index()
    {
        $res = [];
        foreach ($this->collection->listIndexes() as $indexInfo) {
            $arr = [];
            $arr['name'] = $indexInfo['name'];
            $arr['key'] = $indexInfo['key'];
            array_push($res, $arr);
        }
        return result('ok', $res);
    }

    /**
     * 添加数据集合的索引
     */
    public function create()
    {
        $keys = request('keys', '');
        if (!isJson($keys)) {
            return error('keys必须符合json格式');
        }

        $keys = json_decode($keys, true);
        if (!is_array($keys) || empty($keys)) {
            return error('请检查$keys是否为空');
        }

        $keys = $this->filterKey($keys);
        // 检测字段是否都存在
        if (!$this->checkKeys(array_keys($keys))) {
            return error('键值中包含未定义的字段');
        }

        try {
            $this->collection->createIndex($keys);
        } catch (\Exception $e) {
            return error($e->getMessage());
        }
        return result('ok');
    }

    /**
     * 删除数据集合的索引
     */
    public function delete()
    {
        $index_name = request('index_name', '');

        try {
            $this->collection->dropIndex($index_name);
        } catch (\Exception $e) {
            return error($e->getMessage());
        }
        return result('ok');
    }

    /**
     * 检测所得的键名是否
     */
    private function checkKeys($keys)
    {
        if (!is_array($keys)) {
            throw new \Exception('$keys必须为数组');
        }
        $db = new \App\Http\Models\Schema();
        $schema = $db->getSchema($this->nopre_collection_id);
        return count($keys) === count(array_intersect($keys, $schema));
    }


    /**
     * 规范化创建索引的keys
     */
    private function filterKey($keys)
    {
        if (!is_array($keys)) {
            throw new \Exception('$keys必须是数组');
        }

        array_walk($keys, function (&$items, $index) {
            $items = trim($items);
            if (preg_match("/^[-]?1$/", $items)) {
                $items = intval($items);
            } else {
                $items = strtolower($items);
                if (in_array($items, $this->_indexType)) {
                    $items = strval($items);
                } else {
                    throw new \Exception("无效的索引类型");
                }
            }
        });
        return $keys;
    }

}

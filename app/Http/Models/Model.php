<?php
namespace App\Http\Models;


class Model
{

    public $collectionName = null;

    //是否同时更新正式和测试环境
    public $__wbsmgt__ = false;


    public $PRODUCTION = null;

    /**
     * 使用api方式更新的api接口
     * @var string
     */
    public $url = 'http://xxxxx/xx/xx/xx';

    public function __construct()
    {
        if (!$this->collectionName) {
            throw new \Exception('未设置数据库名或集合名');
        }
    }

    /**
     * 走api方式的文件上传
     */
//    public function uploadFile($fieldName)
//    {
//        if (!isset($_FILES[$fieldName])) {
//            throw new \Exception('$_FILES[$fieldName]无效');
//        }
//
//        $parameter = [
//            '__collection__' => $this->collectionName,
//            '__action__' => 'uploadFile',
//            '__PRODUCTION__' => (int)PRODUCTION,
//            '__wbsmgt__' => (int)$this->__wbsmgt__,
//            '__arguments__' => serialize([$fieldName]),
//            $fieldName => new \CURLFile($_FILES[$fieldName]['tmp_name']),
//        ];
//        $res = request_url($this->url, true, $parameter);
//        return $res['reponse'];
//    }

    /**
     * 直接链接数据库文件上传
     */
    public function uploadFile($fieldName)
    {
        if (!isset($_FILES[$fieldName])) {
            throw new \Exception('$_FILES[$fieldName]无效');
        }

        $__collection__ = $this->collectionName;
        $__action__ = 'uploadFile';
        $__arguments__ = [$fieldName];
        $__PRODUCTION__ = (bool)PRODUCTION;
        $__wbsmgt__ = (bool)$this->__wbsmgt__;

        $wbsConnect = new \App\Service\WbsConnect();
        return $wbsConnect->connect($__collection__, $__action__, $__arguments__, $__PRODUCTION__, $__wbsmgt__);
    }

    /**
     * 走API
     */
//    public function __call($name, $arguments)
//    {
//        $parameter = [
//            '__collection__' => $this->collectionName,
//            '__action__' => $name,
//            '__PRODUCTION__' => (int)PRODUCTION,
//            '__wbsmgt__' => (int)$this->__wbsmgt__,
//            '__arguments__' => serialize($arguments),
//        ];
//        $res = request_url($this->url, true, $parameter);
//        return $res['reponse'];
//    }

    /**
     * wbs直接调用数据库
     */
    public function __call($name, $arguments)
    {
        if ($this->PRODUCTION === null) {
            $PRODUCTION = PRODUCTION;
        } else {
            $PRODUCTION = $this->PRODUCTION;
        }

        $__collection__ = $this->collectionName;
        $__action__ = $name;
        $__arguments__ = $arguments;
        $__PRODUCTION__ = (bool)$PRODUCTION;
        $__wbsmgt__ = (bool)$this->__wbsmgt__;

        $wbsConnect = new \App\Service\WbsConnect();
        return $wbsConnect->connect($__collection__, $__action__, $__arguments__, $__PRODUCTION__, $__wbsmgt__);
    }

}
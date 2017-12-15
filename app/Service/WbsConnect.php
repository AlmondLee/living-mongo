<?php
namespace App\Service;

class WbsConnect
{
    /**
     * $__collection__   集合名
     * $__action__  要执行操作的函数名
     * $__arguments__  参数
     * $__PRODUCTION__  正式环境还是测试环境
     * $__wbsmgt__  是否是系统集合
     */
    public function connect($__collection__, $__action__, $__arguments__, $__PRODUCTION__, $__wbsmgt__)
    {
        if (!$__collection__ || !$__action__ || !$__arguments__) {
            throw new \Exception('无效参数');
        }

        //如果为添加操作，并且为需要同步的集合，正式和测试添加同样的id
//        if ($__wbsmgt__ && in_array($__action__, ['insert'])) {
//            $db = new \App\Service\Mongodb($__collection__, !$__PRODUCTION__);
//            $insertResult = call_user_func_array(array($db, $__action__), $__arguments__);
//            $__arguments__[0]['_id'] = myMongoId($insertResult['_id']);
//        }

        //编辑，删除
//        if ($__wbsmgt__ && in_array($__action__, ['update', 'remove'])) {
//            $db = new \App\Service\Mongodb($__collection__, !$__PRODUCTION__);
//            call_user_func_array(array($db, $__action__), $__arguments__);
//        }

        //添加默认结构的时候，虽然不是需要同步的集合,也需要在正式和测试同时添加
        if ($__action__ == 'addDefaultData') {
//            $db = new \App\Service\Mongodb($__collection__, !$__PRODUCTION__);
//            call_user_func_array(array($db, 'updateMany'), $__arguments__);
            $db = new \App\Service\Mongodb($__collection__, $__PRODUCTION__);
            return call_user_func_array(array($db, 'updateMany'), $__arguments__);
        }

        $db = new \App\Service\Mongodb($__collection__, $__PRODUCTION__);
        return call_user_func_array(array($db, $__action__), $__arguments__);
    }
}

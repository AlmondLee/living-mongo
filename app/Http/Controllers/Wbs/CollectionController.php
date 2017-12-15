<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CollectionController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * 读取项目中的集合
     *
     * @author kuppo
     * @version 2013.11.07 kuppo
     */
    public function index()
    {
        $page = request('page', 1);
        $num = request('num', 10);

        $query = array();
        $project_id = request('project_id', '');

        if (!$project_id) {
            return error('project_id不能为空');
        }
        $query['project_id'] = $project_id;
        $db = new \App\Http\Models\Collection();
        $res = $db->getList($query, [], $page, $num);
        return result('ok', $res);
    }

    /**
     * 添加或编辑集合
     *
     */
    public function save()
    {
        $name = request('name', null);
        $remark = request('remark', '');
        $project_id = request('project_id', null);
        $collection_id = request('_id', null);
        if (!$name || !$project_id) {
            return error('参数错误');
        }


        $project = array();
        $project['name'] = $name;
        $project['remark'] = $remark;
        $db = new \App\Http\Models\Collection();
        if ($collection_id) {
            $res = $db->updateByID($collection_id, $project);
        } else {
            $project['project_id'] = $project_id;
            $res = $db->addRecord($project);
        }

        return result('添加信息成功');
    }

    /**
     * 删除新的项目
     *
     * @author kuppo
     * @name 删除新的项目
     * @version 2013.11.14 kuppo
     * @return JsonModel
     */
    public function remove()
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
        $db->delete($collection_id);
        return result('删除信息成功');
    }


    /**
     * demo2正式
     */
    public function demo2pro()
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

        try {
            //drop 正式环境的表
            $db = new \App\Http\Models\Document($collection_id, true);
            $dropres = $db->drop([]);
            if ($dropres) {
                //从demo拿数据
                $Document = new \App\Http\Models\Document($collection_id, false);
                $allData = $Document->findAllOrg([]);
                //写到正式
                $Document = new \App\Http\Models\Document($collection_id, true);
                $Document->insertMany($allData);
            }

        } catch (\Exception $e) {
            dd($e);
            return error($e->getMessage().$e->getLine());
        }

        return result('demo数据覆盖正式成功');
    }

    /**
     * 正式2demo
     */
    public function pro2demo()
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

        try {
            //drop demo环境的表
            $db = new \App\Http\Models\Document($collection_id, false);
            $dropres = $db->drop([]);
            if ($dropres) {
                //从正式拿数据
                $Document = new \App\Http\Models\Document($collection_id, true);
                $allData = $Document->findAllOrg([]);
                //写到demo
                $Document = new \App\Http\Models\Document($collection_id, false);
                $Document->insertMany($allData);
            }
        } catch (\Exception $e) {
            return error($e->getMessage());
        }

        return result('正式数据覆盖demo成功');
    }

}

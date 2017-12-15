<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * 获取所有
     */
    public function getAll()
    {
//        $userinfo = session()->get('kupposhadowUserinfo');
//        $modelAuth = new \App\Http\Models\Auth();
//        $auth = $modelAuth->getOneRecord(['user_id' => $userinfo['user_id']]);
        $query = [];
//        foreach ($auth['project'] as &$val) {
//            $val = myMongoId($val);
//        }
//        $query['_id'] = ['$in'=>$auth['project']];
        $modelPrize = new \App\Http\Models\Project();
        $result = $modelPrize->getAllRecord($query);

        return result('OK', $result);
    }

    /**
     * 新增或编辑项目
     *
     */
    public function save()
    {
        $name = request('name', '');
        $project_id = request('_id', '');

        $default_project = ["wbs", "skynet"];
        if (in_array($project_id, $default_project)) {
            return error('默认项目不可编辑，请联系管理员！');
        }

        if (!$name) {
            return error('项目名称不能为空');
        }

        if ($this->checkProjectNameExist($name)) {
            return error('项目名称已经存在');
        }

        $project = array();
        $project['name'] = $name;
        $db = new \App\Http\Models\Project();
        if ($project_id) {
            $res = $db->updateByID($project_id, $project);
        } else {
            $res = $db->addRecord($project);
//            $modelAuth = new \App\Http\Models\Auth();
//            $Userinfo = session()->get('kupposhadowUserinfo');
//            $query = ['user_id' => $Userinfo['user_id']];
//            $option = [
//                '$push' => ['project' => $res]
//            ];
//            $modelAuth->updateByOption($query, $option);
        }

        return result('添加信息成功');
    }


    /**
     * 删除新的项目
     *
     * @author kuppo
     * @name 删除新的项目
     * @version 2013.11.14 kuppo
     */
    public function delete()
    {
        $id = request('id', null);


        if (!$id) {
            return error('请选择你要删除的项');
        }
        $db = new \App\Http\Models\Project();
        $db->delete($id);
        return result('删除信息成功');
    }

    /**
     * 检测一个项目是否存在，根据名称和编号
     *
     * @param string $info
     * @return boolean
     */
    private function checkProjectNameExist($info)
    {
        $db = new \App\Http\Models\Project();
        $info = $db->getOneRecord(array(
            'name' => $info
        ));

        if ($info == null) {
            return false;
        }
        return true;
    }
}

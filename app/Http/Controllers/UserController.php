<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

/**  暂时的登录，仅供自己用  用户管理待日后用OAuth用户管理中心
 * Class UserController
 * @package App\Http\Controllers\Wbs
 */
class UserController extends Controller
{
    /**
     * 登录
     */
    public function login()
    {
        $username = request('user_name', '');
        $password = request('password', '');

        if (env('USERNAME') && env('PASSWORD')) {
            if ($username != env('USERNAME') || $password != env('PASSWORD')) {
                return error('用户名或密码错误！');
            }
        }


        $authinfo = [
            'user_id' => 'admin',
            'administrator' => 'yes',
            'project' => []
        ];
        $userinfo['auth'] = $authinfo;

        session(['kupposhadowUserinfo' => $userinfo]);
        $time = time() + 3600 * 24 * 365;
        setcookie('kupposhadowUserinfo', json_encode($userinfo), $time, "/");

        return result('OK');
    }

    /**
     * 登出
     */
    public function logout()
    {
        session()->forget('kupposhadowUserinfo');
        $time = time() - 3600;
        setcookie('kupposhadowUserinfo', '', $time, "/");

        return result('OK');
    }

}

<?php

namespace App\Http\Middleware;

use Closure;

class Auth
{

    public function handle($request, Closure $next, $guard = null)
    {
        //判断是否登录
        $userinfo = session()->get('kupposhadowUserinfo');
        if($userinfo) {
            return $next($request);
        } else {
            echo error('请重新登陆',401);
            exit;
        }
    }
}

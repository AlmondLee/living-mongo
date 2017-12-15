<?php

namespace App\Http\Middleware;

use Closure;

class AuthAdmin
{

    public function handle($request, Closure $next, $guard = null)
    {
        //判断是否登录
        $userinfo = session()->get('kupposhadowUserinfo');
        if($userinfo['auth']['administrator'] != 'yes'){
            echo error('没有权限');
            exit;
        } else {
            return $next($request);
        }

    }
}

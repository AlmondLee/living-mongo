<?php

Route::get('/', function () {
    return redirect('/wbs/index.html');
});

$routes = [
    '/test' => 'TestController@index',
    '/phpinfo' => 'TestController@phpinfo',
    '/login' => 'UserController@login',
    '/logout' => 'UserController@logout',
    '/file/upload-file' => 'Wbs\FileController@uploadFile',
    '/file/{id}' => 'Wbs\FileController@getPicture',
];
foreach ($routes as $key => $val) {
    Route::any($key, $val);
}

if (isset($_SERVER['REQUEST_URI'])) {
    $a = explode('?', $_SERVER['REQUEST_URI']);
    $route = reset($a);
    if (!array_key_exists($route, isset($routes) ? $routes : []) && $route != '/') {
        Route::any($route, urlToRoute($route));
    }
}





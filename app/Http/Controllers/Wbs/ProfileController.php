<?php

namespace App\Http\Controllers\Wbs;

use App\Http\Controllers\Controller;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('authAdmin');
    }

    public function index()
    {
        $page = request('page', 1);
        $num = request('num', 20);

            $mongodb_address = env('MONGODB_HOST');


        $database = (new \MongoDB\Client($mongodb_address))->WBS;
        $collection = 'system.profile';
        $collection = $database->$collection;

        $options = [];
        $options['sort'] = ['ts' => -1];
        $options['skip'] = (int)($page - 1) * $num;
        $options['limit'] = (int)$num;

        $cursor = $collection->find([], $options)->toArray();
        $total = $collection->count();

        $rst = array(
            'datas' => $cursor,
            'total' => $total
        );
        return result('ok', convertToPureArray($rst));
    }

}

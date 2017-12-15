<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class StatisticsController extends Controller
{
    public function __construct()
    {
        $this->middleware('authAdmin');
    }

    public function index()
    {
            $mongodb_address = env('MONGODB_HOST');

        $server = (new \MongoDB\Client($mongodb_address));
        $command = new \MongoDB\Driver\Command(array("listDatabases" => 1));
        $databases = $server->getManager()->executeCommand("admin", $command)->toArray();
        $databases[0]->collectionInfo = [];
        foreach ($databases[0]->databases as &$database) {
            $db = $server->{$database->name};
            $command = ["listCollections" => 1];
            $listCollections = $db->command($command)->toArray();
            foreach ($listCollections as $collection) {
                $command = ["collStats" => $collection->name];
                $collectionInfo = $db->command($command)->toArray();
                array_push($databases[0]->collectionInfo, $collectionInfo);
            }
            $database->listCollections = $listCollections;
        }
        return result('ok', $databases);
    }
}

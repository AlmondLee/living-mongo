<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use League\Flysystem\Exception;

class FileController extends Controller
{

    public function uploadFile()
    {
        $db = new \App\Http\Models\File();

        $uploadinfo = $db->uploadFile('file');
        $result = [
            'src' => $uploadinfo['url'],
            'file_id' => $uploadinfo['_id'],
        ];
        if ($uploadinfo['_id']) {
            return result('OK', $result);
        }
        return error('上传图片失败');
    }

    public function getPicture($id)
    {
        $pos = strrpos($id, '.');
        if ($pos !== false) {
            $id = substr($id, 0, $pos);
        }

        try {
            $modelFile = new \App\Http\Models\File();
            setHeaderExpires();
            $this->etag($id);
            $modelFile->output($id);
        } catch (\Exception $e) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }

    }

    private function etag($id)
    {
        header('ETag:"' . md5($id . serialize(request()->all())) . '"');
        $gmt_mtime = gmdate("D, d M Y H:i:s", strtotime('2017-09-25 00:00:00')) . " GMT";
        header('Last-Modified: ' . $gmt_mtime);
    }


}

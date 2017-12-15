<?php
namespace App\Http\Models;

/**
 * wbs本身的文件上传和下载没有走api,因为下载时候用到fread，通过url保持文件流麻烦
 */
class File
{
    public $dbName = 'WBS';

    public function __construct()
    {
        $this->db = new \App\Service\Mongodb(null,  PRODUCTION);
    }

    public function __call($name, $arguments)
    {
        return call_user_func_array(array($this->db, $name), $arguments);
    }

    public function output($fileId)
    {
        $fileId = myMongoId($fileId);

        $bucket = $this->getBucket();

        $stream = $bucket->openDownloadStream($fileId);
        $metadata = $bucket->getFileDocumentForStream($stream);

        header('Content-Type: ' . $metadata->metadata->type . ';');
        header('Content-Disposition:filename="' . $metadata->filename . '"');
        while (!feof($stream)) {
            echo fread($stream, 8192);
        }
        exit;
    }
}
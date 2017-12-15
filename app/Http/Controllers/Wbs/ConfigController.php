<?php

namespace App\Http\Controllers\Wbs;

use App\Http\Controllers\Controller;

class ConfigController extends Controller
{

    public function index()
    {

        $str = <<<AAA
angular.module('ued')
    .value('config', {
        name: 'default',
        schema_type: {
            "single-line-text": "单行文本",
            "multi-line-text": "多行文本",
            "digital": "整型数字",
            "float-digital": "浮点型数字",
            "non-input": "是非",
            "array": "数组",
            "embedded-document": "内嵌文档",
            "file": "文件",
            "rich-text": "富文本",
            "date": "日期"
        },
        columnDefs_ID: {
            "name": "_id",
            "zh_name": "系统id",
            "schema_type": "single-line-text",
            "displayName": "系统id",
        },
        columnDefs_CREATE_TIME: {
            "name": "__CREATE_TIME__",
            "zh_name": "创建时间",
            "schema_type": "single-line-text",
            "displayName": "创建时间",
        },
        search_schema_number: ["digital", "float-digital"],
        search_schema_input: ["single-line-text", "multi-line-text", "array", "embedded-document", "file", "rich-text"],
    })
AAA;
        return $str;
    }
}

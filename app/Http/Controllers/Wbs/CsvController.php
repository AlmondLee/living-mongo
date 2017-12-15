<?php

namespace App\Http\Controllers\Wbs;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class CsvController extends Controller
{
    /** @var  \App\Http\Models\Document */
    private $modelDocument;


    public function __construct()
    {
        $this->middleware('auth');

        $collection_id = request('collection_id', '');
        $this->collection_id = $collection_id;
        if (!$collection_id) {
            return error('collection_id不能为空');
        }

        $this->modelDocument = new \App\Http\Models\Document($collection_id);
    }

    /**
     * 导入csv
     */
    public function import()
    {
        $modelSchema = new \App\Http\Models\Schema();
        $classifyFiled = $modelSchema->classifyFiled($this->collection_id);
//        $res = $this->modelDocument->getList($query, ['_id' => -1], $page, $num);
    }

    /**
     * 导出csv
     */
    public function export()
    {
        $query = [];
//        $query = request('query', []);
//        $query = $this->modelDocument->formatQuery($query);

        $modelSchema = new \App\Http\Models\Schema();
        $classifyFiled = $modelSchema->classifyFiled($this->collection_id);
        $exportFileds = array_merge(
            $classifyFiled['date_fields'],
            $classifyFiled['single_line_text_fields'],
            $classifyFiled['digital_fields'],
            $classifyFiled['non_input_fields']
        );
        $count = $this->modelDocument->getCount($query);
        if ($count > 1000) {
            return error('文档大于1000，请联系管理员');
        }

        $allDatas = $this->modelDocument->getAllRecord($query);
        $temp_datas = [];
        foreach ($allDatas as $data) {
            $arr = [];
            foreach ($data as $key => $val) {
                if (in_array($key, $exportFileds)) {
                    if (in_array($key, $classifyFiled['date_fields'])) {
                        $arr[$key] = $val;
                    } elseif (in_array($key, $classifyFiled['single_line_text_fields'])) {
                        $arr[$key] = $val;
                    } elseif (in_array($key, $classifyFiled['digital_fields'])) {
                        $arr[$key] = (string)$val;
                    } elseif (in_array($key, $classifyFiled['non_input_fields'])) {
                        $arr[$key] = $val ? '是' : '否';
                    }
                }
            }
            ksort($arr);
            array_push($temp_datas, $arr);
        }

        if (empty($temp_datas)) {
            $fileds = $exportFileds;
        } else {
            $fileds = array_keys(reset($temp_datas));
        }

        array_unshift($temp_datas, $fileds);

        $res = $this->arrayToStr('', $temp_datas);

        $Collection = new \App\Http\Models\Collection();
        $collectioninfo = $Collection->getOneById($this->collection_id);
        $name = isset($collectioninfo['name']) ? $collectioninfo['name'] : 'csv';
        $this->export_csv($name . '-' . date('Y-m-d_H_i_s') . '.csv', $res);
    }


    /**将数组拼接成字符串
     * @param $init_str
     * @param $data
     * @return string
     */
    public function arrayToStr($init_str, $data)
    {
        $res_str = $init_str;
        foreach ($data as $location) {
            foreach ($location as $val) {
                if(is_array($val)){
                    
                }else{
                    $res_str .= $val;
                }
                $res_str .= ",";
            }
            //去掉每行最后的,
            $res_str = rtrim($res_str, ",");
            $res_str .= "\n";
        }
        return $res_str;
    }

    /**
     * 导出CSV
     * @param $filename
     * @param $data
     * @author Killua Chen
     */
    function export_csv($filename, $data)
    {
        header("Content-type:text/csv");
        header("Content-Disposition:attachment;filename=" . $filename);
        header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
        header('Expires:0');
        header('Pragma:public');
        echo $data;
    }
}

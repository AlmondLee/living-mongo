<?php

/**
 * 浮点型转整型
 * Created by kuppo.
 */
function floatToInt($float)
{
    return intval(strval(round($float)));
}

function myMongoData($str = null, $key = null, $format = 'Y-m-d H:i:s')
{
    if ($key) {
        if (!isset($str[$key])) {
            return date($format, 0);
        }
        //如果是UTCDateTime类型返回字符串
        if (!($str instanceof \MongoDB\BSON\UTCDateTime)) {
            return date($format, 0);
        }
        return date($format, $str->sec);
    }

    //如果是时间戳或者是字符串，返回UTCDateTime
    return new \MongoDB\BSON\UTCDateTime(milliseconds($str));
}

function saveCache($key, $value, $expire_time = 30 * 60)
{
    return \Illuminate\Support\Facades\Redis::command('SET', [$key, $value, 'EX', $expire_time]);
}

function getCache($key)
{
    return \Illuminate\Support\Facades\Redis::command('get', [$key]);
}

function destroyCache($key)
{
    return \Illuminate\Support\Facades\Redis::command('del', [$key]);
}

/**
 * 判断项目是正式环境还是测试环境
 */

define('PRODUCTION', true);

/**
 *  curl封装
 *
 * 传文件
 *      $parameter = [
 *          "aaa"=>'aaaa',
 *          "picture"=>"@".$_FILES['picture']['tmp_name'],
 *      ];
 *
 *  2016年12月21日    kuppo
 */
function request_url($url, $isPost = false, array $parameter = [], $isJson = false)
{
    $ch = curl_init();
    if (!$isPost) {
        $parameter = http_build_query($parameter);
        if (strpos($url, '?')) {
            $url .= '&';
        } else {
            $url .= '?';
        }
        $url .= $parameter;
    }
    curl_setopt($ch, CURLOPT_URL, $url);         //设置请求url
    curl_setopt($ch, CURLOPT_FAILONERROR, false);   //当 HTTP 状态码大于等于 400，TRUE 将将显示错误详情。 默认情况下将返回页面，忽略 HTTP 代码。
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  //返回原生的（Raw）输出
    //https 请求
    if (strlen($url) > 5 && strtolower(substr($url, 0, 5)) == 'https') {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);     //禁止cURL验证对等证书
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    }
    //判断是否为POST请求
    if ($isPost) {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($isJson) {
            $parameter = json_encode($parameter);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                    'Content-Type: application/json; charset=utf-8',
                    'Content-Length: ' . strlen($parameter))
            );
        }
    }
    curl_setopt($ch, CURLOPT_POSTFIELDS, $parameter);

    $reponse = curl_exec($ch);

    //错误处理
    if (curl_errno($ch)) {
        $reponse = [
            'httpStatusCode' => -1,
            'reponse' => curl_error($ch),
            'time' => -1
        ];
    } else {
        $httpStatusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $time = curl_getinfo($ch, CURLINFO_TOTAL_TIME);

        $reponse = [
            'httpStatusCode' => $httpStatusCode,
            'reponse' => is_null(json_decode($reponse, true)) ? $reponse : json_decode($reponse, true),
            'time' => $time
        ];
    }
    curl_close($ch);
    return $reponse;
}

function get_file_id($path)
{
    if (strpos($path, 'http') !== false) {
        $arr = explode('/', $path);
        if (isset($arr[4])) {
            $path = $arr[4];
        }
    }
    return $path;
}


//验证是否包含特殊字符
function has_special_characters($str)
{
    if (preg_match('/^[a-z]{1}[a-z0-9_\.]*$/i', $str)) {
        return false;
    } else {
        return true;
    }
}

//获得当前时间戳的毫秒数
function milliseconds($str = null)
{
    if (is_numeric($str)) {
        return round($str * 1000);
    }

    if ($str) {
        if (strtotime($str) || strtotime($str) === 0) {
            return round(strtotime($str) * 1000);
        } else {
            return false;
        }
    } else {
        return round(microtime(true) * 1000);
    }
}

//毫秒变秒
function seconds($milliseconds)
{
    return (int)$milliseconds / 1000;
}

function sort_array($array, $on, $order = 'asc')
{
    $new_array = array();
    $sortable_array = array();
    if (count($array) > 0) {
        foreach ($array as $k => $v) {
            if (is_array($v)) {
                if (!in_array($on, array_keys($v))) {
                    //当数组中没有指定键时,给null让这个数组排在最后
                    $sortable_array[$k] = null;
                } else {
                    foreach ($v as $k2 => $v2) {
                        if ($k2 == $on) {
                            $sortable_array[$k] = $v2;
                        }
                    }
                }
            } else {
                $sortable_array[$k] = $v;
            }
        }
        switch ($order) {
            case 'asc':
                asort($sortable_array);
                break;
            case 'desc':
                arsort($sortable_array);
                break;
        }
        foreach ($sortable_array as $k => $v) {
            $new_array[$k] = $array[$k];
        }
    }
    return $new_array;
}

function model($table_name)
{
    return app('\\App\\Models\\' . $table_name);
}

function service($table_name)
{
    return app('\\App\\Service\\' . $table_name);
}


function division($a, $b, $c = 2)
{
    if ($b == 0) {
        return 0;
    }
    if ($a == 0) {
        return 0;
    }
    return round($a / $b, $c);
}

function percent($a, $b, $c = 4)
{
    $num = division($a, $b, $c);
    return $num;
}

//获取当前星期的星期一和星期日的日期
function weekDay($time = 'now')
{
    if ($time == 'now') {
        $date = new \DateTime();
    } else if ($time == 'start') {
        $date = new \DateTime(date('Y-m-d 00:00:00'));
    } else if ($time == 'end') {
        $date = new \DateTime(date('Y-m-d 23:59:59'));
    }
    return [
        'Monday' => $date->modify('this week')->format('U'),
        'Tuesday' => $date->modify('this week +1 days')->format('U'),
        'Wednesday' => $date->modify('this week +2 days')->format('U'),
        'Thursday' => $date->modify('this week +3 days')->format('U'),
        'Friday' => $date->modify('this week +4 days')->format('U'),
        'Saturday' => $date->modify('this week +5 days')->format('U'),
        'Sunday' => $date->modify('this week +6 days')->format('U'),
    ];
}

function initUrl($url)
{
    if (strstr($url, 'data:') === false) {
        return asset($url);
    } else {
        return $url;
    }
}

function debug($data)
{
    if (env('DEBUG')) {
        model('debug')->create([
            'info' => $data,
            'created_at' => date('Y-m-d H:i:s'),
        ]);
    }
}

function throwMsg($msg)
{
    $json = [
        'success' => false,
        'error_code' => '-1',
        'error_msg' => $msg,
        'errorCode' => '-1',
        'errorMsg' => $msg
    ];

    throw new \Illuminate\Http\Exception\HttpResponseException(
        new \Illuminate\Http\JsonResponse($json, 200)
    );
}

function result($msg = 'success', $result = '')
{
    $jsonpcallback = trim(request('jsonpcallback'));
    return jsonpcallback($jsonpcallback, true, $msg, $result);
}

function error($msg = '网络链接失败，请重试', $code = -1)
{

    $jsonpcallback = trim(request('jsonpcallback'));
    return jsonpcallback($jsonpcallback, false, $msg, $code);
}

function urlToRoute($url)
{
    $pieces = explode('/', $url);

    //action
    $action = array_pop($pieces);
    $arr = explode('-', $action);
    $action = array_shift($arr);
    foreach ($arr as $val) {
        $action .= ucfirst($val);
    }

    //controller
    $controller = ucfirst(array_pop($pieces)) . "Controller";

    //path
    array_shift($pieces);
    foreach ($pieces as &$val) {
        $val = ucfirst($val);
    }
    $path = implode("\\", $pieces);

    //route
    $route = $path . "\\" . $controller . "@" . $action;
    return $route;
}

/**
 * 标准化数据返回结果json或jsonp返回信息
 *
 * @param string $jsonpcallback
 * @param boolean $stat
 * @param string $msg
 * @param string $result
 * @return mixed
 */
function jsonpcallback($jsonpcallback = "", $stat = true, $msg = "OK", $result = "")
{
    if ($stat) {
        if (!empty($jsonpcallback)) {
            return $jsonpcallback . '(' . json_encode(array(
                'success' => $stat,
                'message' => $msg,
                'result' => $result
            ), JSON_UNESCAPED_UNICODE) . ')';
        } else {
            return json_encode(array(
                'success' => $stat,
                'message' => $msg,
                'result' => $result
            ), JSON_UNESCAPED_UNICODE);
        }
    } else {
        if (!empty($jsonpcallback)) {
            return $jsonpcallback . '(' . json_encode(array(
                'success' => false,
                'error_code' => $result,
                'error_msg' => $msg,
                'errorCode' => $result,
                'errorMsg' => $msg
            ), JSON_UNESCAPED_UNICODE) . ')';
        } else {
            return json_encode(array(
                'success' => false,
                'error_code' => $result,
                'error_msg' => $msg,
                'errorCode' => $result,
                'errorMsg' => $msg
            ), JSON_UNESCAPED_UNICODE);
        }
    }
}

/**
 * 检测是否为有效的电子邮件地址
 *
 * @param string $email
 * @param int $getmxrr
 *            0表示关闭mx检查 1表示开启mx检查 window下开启需要php5.3+
 * @return bool true/false
 *
 */
function isValidEmail($email, $getmxrr = 0)
{
    if ((strpos($email, '..') !== false) or (!preg_match('/^(.+)@([^@]+)$/', $email, $matches))) {
        return false;
    }
    $_localPart = $matches[1];
    $_hostname = $matches[2];
    if ((strlen($_localPart) > 64) || (strlen($_hostname) > 255)) {
        return false;
    }
    $atext = 'a-zA-Z0-9\x21\x23\x24\x25\x26\x27\x2a\x2b\x2d\x2f\x3d\x3f\x5e\x5f\x60\x7b\x7c\x7d\x7e';
    if (!preg_match('/^[' . $atext . ']+(\x2e+[' . $atext . ']+)*$/', $_localPart)) {
        return false;
    }
    if ($getmxrr == 1) {
        $mxHosts = array();
        $result = getmxrr($_hostname, $mxHosts);
        if (!$result) {
            return false;
        }
    }
    return true;
}

/**
 * 检测是否为有效的手机号码
 *
 * @param string $mobile
 * @return bool true/false
 */
function isValidMobile($mobile)
{
    if (preg_match("/^1[3,4,5,7,8]{1}[0-9]{9}$/", $mobile))
        return true;
    return false;
}

/**
 * 将数组数据导出为csv文件
 *
 * @param array $datas
 * @param string $name
 * @param string $output
 */
function arrayToCVS($datas, $name = null, $output = null)
{
    resetTimeMemLimit();
    if (empty($name)) {
        $name = 'export_' . date("Y_m_d_H_i_s");
    }

    $result = array_merge(array(
        $datas['title']
    ), $datas['result']);

    if (empty($output)) {
        $tmpname = tempnam(sys_get_temp_dir(), 'export_csv_');
        $fp = fopen($tmpname, 'w');
        fwrite($fp, "\xEF\xBB\xBF");
        foreach ($result as $row) {
            fputcsv($fp, $row, ",", '"');
        }
        fclose($fp);

        header('Content-type: text/csv;');
        header('Content-Disposition: attachment; filename="' . $name . '.csv"');
        header("Content-Length:" . filesize($tmpname));
        echo file_get_contents($tmpname);
        unlink($tmpname);
        exit();
    } else {
        $fp = fopen($output, 'w');
        fwrite($fp, "\xEF\xBB\xBF");
        foreach ($result as $row) {
            fputcsv($fp, $row, ",", '"');
        }
        fclose($fp);
        return true;
    }
}

/**
 * 将数组数据导出为table文件用于直接输出excel表格
 *
 * @param array $datas
 * @param string $name
 * @param string $output
 */
function arrayToTable($datas, $name = null, $output = null)
{
    resetTimeMemLimit();
    if (empty($name)) {
        $name = 'export_' . date("Y_m_d_H_i_s");
    }

    $result = array_merge(array(
        $datas['title']
    ), $datas['result']);

    if (empty($output)) {
        header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
        header('Content-Disposition: attachment;filename="' . $name . '.xls"');
        header('Cache-Control: max-age=0');
        echo "<table>";
        foreach ($result as $row) {
            echo '<tr><td>' . join("</td><td>", $row) . '</td></tr>';
            ob_flush();
        }
        echo "</table>";
        exit();
    } else {
        $fp = fopen($output, 'w');
        fwrite($fp, "<table>");
        foreach ($result as $row) {
            $line = '<tr><td>' . join("</td><td>", $row) . '</td></tr>';
            fwrite($fp, $line);
        }
        fwrite($fp, "</table>");
        fclose($fp);
        return true;
    }
}

/**
 * 计算cell所在的位置
 */
function excelTitle($i)
{
    $str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $divisor = floor($i / 26);
    $remainder = $i % 26;
    if ($divisor > 0) {
        return $str[intval($divisor - 1)] . $str[intval($remainder)];
    } else {
        return $str[$remainder];
    }
}

/**
 * 导出excel表格
 *
 * @param $datas 二维数据
 * @param $name excel表格的名称，不包含.xlsx
 *            填充表格的数据
 * @example $datas['title'] = array('col1','col2','col3','col4');
 *          $datas['result'] = array(array('v11','v12','v13','v14')
 *          array('v21','v22','v23','v24'));
 * @return 直接浏览器输出excel表格 注意这个函数前不能有任何形式的输出
 *
 */
function arrayToExcel($datas, $name = '', $output = 'php://output')
{
    resetTimeMemLimit();
    if (empty($name)) {
        $name = 'export_' . date("Y_m_d_H_i_s");
    }

    // 便于处理大的大型excel表格，存储在磁盘缓存中
    $cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_to_discISAM;
    PHPExcel_Settings::setCacheStorageMethod($cacheMethod);
    $objPHPExcel = new PHPExcel();
    $objPHPExcel->getProperties()->setCreator('icc');
    $objPHPExcel->getProperties()->setLastModifiedBy('icc');
    $objPHPExcel->getProperties()->setTitle($name);
    $objPHPExcel->getProperties()->setSubject($name);
    $objPHPExcel->getProperties()->setDescription($name);
    $objPHPExcel->setActiveSheetIndex(0);
    $total = count($datas['title']);
    for ($i = 0; $i < $total; $i++) {
        $objPHPExcel->getActiveSheet()
            ->getColumnDimension(excelTitle($i))
            ->setAutoSize(true);
        $objPHPExcel->getActiveSheet()->SetCellValue(excelTitle($i) . '1', $datas['title'][$i]);
    }
    $i = 2;
    foreach ($datas['result'] as $data) {
        $j = 0;
        foreach ($data as $cell) {
            // 判断是否为图片，如果是图片，那么绘制图片
            if (is_array($cell) && isset($cell['type']) && $cell['type'] == 'image') {
                try {

                    $coordinate = excelTitle($j) . $i;
                    $cellName = isset($cell['name']) ? $cell['name'] : '';
                    $cellDesc = isset($cell['desc']) ? $cell['desc'] : '';
                    $cellType = isset($cell['type']) ? $cell['type'] : '';
                    $cellUrl = isset($cell['url']) ? $cell['url'] : '';
                    $cellHeight = isset($cell['height']) ? intval($cell['height']) : 0;

                    if (filter_var($cellUrl, FILTER_VALIDATE_URL) == true) {
                        if ($cellType == 'image') {
                            if ($cellHeight == 0)
                                $cellHeight = 20;
                            $image = imagecreatefromstring(file_get_contents($cellUrl));
                            $objDrawing = new PHPExcel_Worksheet_MemoryDrawing();
                            $objDrawing->setName($cellName);
                            $objDrawing->setDescription($cellDesc);
                            $objDrawing->setImageResource($image);
                            $objDrawing->setRenderingFunction(PHPExcel_Worksheet_MemoryDrawing::RENDERING_JPEG);
                            $objDrawing->setMimeType(PHPExcel_Worksheet_MemoryDrawing::MIMETYPE_DEFAULT);
                            $objDrawing->setHeight($cellHeight);
                            $objDrawing->setCoordinates($coordinate); // 填充到某个单元格
                            $objDrawing->setWorksheet($objPHPExcel->getActiveSheet());
                            $objPHPExcel->getActiveSheet()
                                ->getRowDimension($i)
                                ->setRowHeight($cellHeight);
                        } else {
                            $objPHPExcel->getActiveSheet()->setCellValueExplicit($coordinate, $cellName, PHPExcel_Cell_DataType::TYPE_STRING);
                        }
                        // 添加链接
                        $objPHPExcel->getActiveSheet()
                            ->getCell($coordinate)
                            ->getHyperlink()
                            ->setUrl($cellUrl);
                        $objPHPExcel->getActiveSheet()
                            ->getCell($coordinate)
                            ->getHyperlink()
                            ->setTooltip($cellName . ':' . $cellDesc);
                    } else {
                        $objPHPExcel->getActiveSheet()->setCellValueExplicit(excelTitle($j) . $i, $cellUrl, PHPExcel_Cell_DataType::TYPE_STRING);
                    }
                } catch (Exception $e) {
                    $objPHPExcel->getActiveSheet()->setCellValueExplicit(excelTitle($j) . $i, json_encode($cell), PHPExcel_Cell_DataType::TYPE_STRING);
                }
            } else
                if (is_array($cell)) {
                    $objPHPExcel->getActiveSheet()->setCellValueExplicit(excelTitle($j) . $i, json_encode($cell), PHPExcel_Cell_DataType::TYPE_STRING);
                } else {
                    $objPHPExcel->getActiveSheet()->setCellValueExplicit(excelTitle($j) . $i, $cell, PHPExcel_Cell_DataType::TYPE_STRING);
                }
            $j++;
        }
        $i++;
    }
    $objPHPExcel->getActiveSheet()->setTitle('Sheet1');
    $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    if ($output === 'php://output') {
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment;filename="' . $name . '.xlsx"');
        header('Cache-Control: max-age=0');
        $objWriter->save($output);
        exit();
    }
    $objWriter->save($output);
    return true;
}

/**
 * 提取邮件的用户名
 *
 * @param string $email
 * @return mixed string|bool
 */
function getEmailName($email)
{
    if (isValidEmail($email, 0)) {
        $tmp = explode('@', $email);
        return ucfirst($tmp[0]);
    }
    return false;
}

/**
 * 发送邮件
 *
 * @param mixed $to
 *            (array|string)
 * @param string $subject
 * @param string $content
 */
function sendEmail($to, $subject, $content)
{
    $message = new Message();
    $message->addTo($to)
        ->setEncoding('utf-8')
        ->addFrom('system.monitor@icatholic.net.cn')
        ->setSubject($subject)
        ->setBody($content);

    $transport = new SmtpTransport();
    $options = new SmtpOptions(array(
        'name' => 'system.monitor',
        'host' => 'smtp.icatholic.net.cn',
        'port' => 25,
        'connection_class' => 'login',
        'connection_config' => array(
            'username' => 'system.monitor@icatholic.net.cn',
            'password' => 'abc123'
        )
    ));
    $transport->setOptions($options);
    $transport->send($message);
    return true;
}

/**
 * 获取整形的IP地址
 *
 * @return int
 */
function getIp()
{
    if (getenv('HTTP_X_REAL_IP') != '')
        return getenv('HTTP_X_REAL_IP');
    return $_SERVER['REMOTE_ADDR'];
}

/**
 * 针对需要长时间执行的代码，放宽执行时间和内存的限制
 *
 * @param int $time
 * @param string $memory
 */
function resetTimeMemLimit($time = 3600, $memory = '2048M')
{
    ignore_user_abort(true);
    set_time_limit($time);
    ini_set('memory_limit', $memory);
}

/**
 * 调用SOAP服务
 *
 * @param string $wsdl
 */
function callSoap($wsdl, $options)
{
    try {
        ini_set('default_socket_timeout', '3600'); // 保持与SOAP服务器的连接状态
        $default = array(
            'soap_version' => SOAP_1_2,
            'exceptions' => true,
            'trace' => true,
            'connection_timeout' => 120,
            'cache_wsdl' => WSDL_CACHE_DISK
        );
        $options = array_merge($default, $options);

        $client = new SoapClient($wsdl, $options);
        return $client;
    } catch (Exception $e) {
        fb(exceptionMsg($e), \FirePHP::LOG);
        return false;
    }
}

/**
 * 转化mongo db的输出结果为纯数组
 *
 * @param array $arr
 */
function convertToPureArray(&$arr)
{
    if ($arr instanceof \MongoDB\Model\BSONDocument) {
        $arr = $arr->getArrayCopy();
    }
    if (!is_array($arr) || empty($arr))
        return array();

    foreach ($arr as $key => $value) {
        if ($value instanceof \MongoDB\Model\BSONDocument) {
            $value = $value->getArrayCopy();
        }
        if (is_array($value)) {
            $arr[$key] = convertToPureArray($value);
        } else {
            if ($value instanceof \MongoDB\BSON\ObjectID) {
                $value = $value->__toString();
            } elseif ($value instanceof \MongoDB\BSON\UTCDateTime) {
                $value = date('Y-m-d H:i:s', seconds($value->__tostring()));
            } elseif ($value instanceof \MongoDB\Model\BSONArray) {
                $value = $value->bsonSerialize();
            }
            $arr[$key] = $value;
        }
    }

    return $arr;
}

/**
 * 设定浏览器头的缓存时间，默认是一年
 *
 * @param int $expireTime
 */
function setHeaderExpires($expireTime = 31536000)
{
    $expireTime = (int)$expireTime;
    if ($expireTime == 0)
        $expireTime = 31536000;
    $ts = gmdate("D, d M Y H:i:s", time() + $expireTime) . " GMT";
    header("Expires: $ts");
    header("Pragma: cache");
    header("Cache-Control: max-age=$expireTime");
    return true;
}

/**
 * 检测一个字符串否为Json字符串
 *
 * @param string $string
 * @return true/false
 */
function isJson($string)
{
    // 过滤掉纯数字类型的符合json格式的字符串，如果单纯为数字，请使用其他数据类型
    if (strpos($string, "{") === false && strpos($string, "[") === false) {
        return false;
    }
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}

/**
 * 范围cache key字符串
 *
 * @return string
 */
function cacheKey()
{
    $args = func_get_args();
    return abs(crc32(serialize($args)));
}

/**
 * 中奖概率 百分比 0.0001-100之间的浮点数
 *
 * @param double $percent
 */
function getProbability($percent)
{
    if (rand(0, pow(10, 6)) <= $percent * pow(10, 4)) {
        return true;
    }
    return false;
}

/**
 * 断点续传,仅适合当线程断点续传
 *
 * @param string $file
 *            文件名
 */
function rangeDownload($file)
{
    if (!is_file($file)) {
        return false;
    }

    $fp = fopen($file, 'rb');

    $size = filesize($file);
    $length = $size;
    $start = 0;
    $end = $size - 1;
    header("Accept-Ranges: 0-$length");
    if (isset($_SERVER['HTTP_RANGE'])) {
        $c_start = $start;
        $c_end = $end;
        list (, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
        if (strpos($range, ',') !== false) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit();
        }

        if ($range[0] == '-') {
            $c_start = $size - substr($range, 1);
        } else {
            $range = explode('-', $range);
            $c_start = $range[0];
            $c_end = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size;
        }
        $c_end = ($c_end > $end) ? $end : $c_end;
        if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {
            header('HTTP/1.1 416 Requested Range Not Satisfiable');
            header("Content-Range: bytes $start-$end/$size");
            exit();
        }
        $start = $c_start;
        $end = $c_end;
        $length = $end - $start + 1;
        fseek($fp, $start);
        header('HTTP/1.1 206 Partial Content');
    }
    header("Content-Range: bytes $start-$end/$size");
    header("Content-Length: $length");

    $buffer = 1024 * 8;
    while (!feof($fp) && ($p = ftell($fp)) <= $end) {
        if ($p + $buffer > $end) {
            $buffer = $end - $p + 1;
        }
        set_time_limit(0);
        echo fread($fp, $buffer);
        flush();
    }

    fclose($fp);
}

/**
 * 获取异常信息的细节
 *
 * @param Exception $e
 */
function exceptionMsg($e)
{
    if (is_subclass_of($e, 'Exception') || $e instanceof Exception) {
        return '<h1>Exception info:</h1>File:' . $e->getFile() . '<br />Line:' . $e->getLine() . '<br />Message:' . $e->getMessage() . '<br />Trace:' . $e->getTraceAsString();
    }
    return false;
}


/**
 * 对于fastcgi模式加快返回速度
 */
if (!function_exists("fastcgi_finish_request")) {

    function fastcgi_finish_request()
    {
        return true;
    }
}


/**
 * 获取脚本的运行时间信息
 *
 * @return array
 */
function getScriptExecuteInfo()
{
    $rst = array();
    $rst['cpuTimeSec'] = 0.000000; // CPU计算时间
    $rst['scriptTimeSec'] = 0.000000; // 脚本运行时间
    $rst['memoryPeakMb'] = (double)sprintf("%.6f", memory_get_peak_usage() / 1024 / 1024); // 内存使用峰值

    $scriptTime = 0.000000;
    $cpuTime = 0.000000;

    if (isset($_SERVER["REQUEST_TIME_FLOAT"]))
        $scriptTime = microtime(true) - $_SERVER["REQUEST_TIME_FLOAT"];

    // 计算CPU的使用时间
    if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
        $systemInfo = getrusage();
        $cpuTime = ($systemInfo["ru_utime.tv_sec"] + $systemInfo["ru_utime.tv_usec"] / 1e6) - PHP_CPU_RUSAGE;

        $rst['cpuTimeSec'] = (double)sprintf("%.6f", $cpuTime);
        $rst['scriptTimeSec'] = (double)sprintf("%.6f", $scriptTime);
    }

    return $rst;
}


/**
 * 进行mongoid和tostring之间的转换
 * 增加函数mongoid用于mongoid和字符串形式之间的自动转换
 *
 * @param mixed $var
 * @return string MongoId
 */
function myMongoId($var = null)
{
    if (is_array($var)) {
        $newArray = array();
        foreach ($var as $row) {
            if ($row instanceof \MongoDB\BSON\ObjectID) {
                $newArray[] = $row->__toString();
            } else {
                try {
                    $newArray[] = new \MongoDB\BSON\ObjectID($row);
                } catch (Exception $e) {
                    continue;
                }
            }
        }
        return $newArray;
    } else {
        if ($var instanceof \MongoDB\BSON\ObjectID) {
            return $var->__toString();
        } else {
            $var = !empty($var) && strlen($var) == 24 ? $var : null;
            try {
                return new \MongoDB\BSON\ObjectID($var);
            } catch (Exception $e) {
                fb(exceptionMsg($e), 'LOG');
                return new \MongoDB\BSON\ObjectID();
            }
        }
    }
}


/**
 * 构建集合名称
 *
 * @param mixed $_id
 * @return string
 */
function iCollectionName($_id)
{
    if ($_id instanceof MongoId)
        $_id = $_id->__toString();
    if (empty($_id))
        throw new \Exception('集合_id不能为空');

    return 'idatabase_collection_' . $_id;
}

/**
 * 效仿数组函数的写法，实现复制数组。目的是为了解除内部变量的引用关系
 *
 * @param array $arr
 * @return array
 */
function array_copy($arr)
{
    $newArray = array();
    foreach ($arr as $key => $value) {
        if (is_array($value))
            $newArray[$key] = array_copy($value);
        else
            if (is_object($value))
                $newArray[$key] = clone $value;
            else
                $newArray[$key] = $value;
    }
    return $newArray;
}

/**
 * 递归方法unset数组里面的元素
 *
 * @param array $array
 * @param array|string $fields
 * @param boolean $remove
 *            true表示删除数组$array中的$fields属性 false表示保留数组$array中的$fields属性
 */
function array_unset_recursive(&$array, $fields, $remove = true)
{
    if (!is_array($fields)) {
        $fields = array(
            $fields
        );
    }
    foreach ($array as $key => &$value) {
        if ($remove) {
            if (in_array($key, $fields, true)) {
                unset($array[$key]);
            } else {
                if (is_array($value)) {
                    array_unset_recursive($value, $fields, $remove);
                }
            }
        } else {
            if (!in_array($key, $fields, true)) {
                unset($array[$key]);
            } else {
                if (is_array($value)) {
                    array_unset_recursive($value, $fields, $remove);
                }
            }
        }
    }
}

/**
 * 将json中的$id还原为正常的MongoId类型
 *
 * @param array $array
 */
function array_json_id(&$array)
{
    foreach ($array as $key => &$value) {
        if ($key === '_id') {
            if (isset($value['$id'])) {
                $value = new \MongoId($value['$id']);
            }
        } else {
            if (is_array($value)) {
                array_json_id($value);
            }
        }
    }
}

/**
 * 将新版的mongid
 *
 * @param array $array
 */
function objectid_compatible_old_drivers(&$array)
{
    foreach ($array as $key => &$value) {
        if ($key === '_id') {
            if ($value instanceof \MongoId) {
                $value = array(
                    '$id' => $value->__toString()
                );
            }
        } else {
            if (is_array($value)) {
                objectid_compatible_old_drivers($value);
            }
        }
    }
}

/**
 * 删除整个目录
 *
 * @param string $dir
 * @return boolean
 */
function delDir($dir)
{
    $files = array_diff(scandir($dir), array(
        '.',
        '..'
    ));
    foreach ($files as $file) {
        (is_dir("$dir/$file")) ? delDir("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}

/**
 * 记录错误信息
 *
 * @param string $msg
 * @return boolean
 */
function logError($msg)
{
    if (!is_string($msg)) {
        $msg = json_encode($msg);
    }

    $msg = join("\t", array(
        date("Y-m-d H:i:s"),
        isset($_SERVER["SERVER_ADDR"]) ? $_SERVER["SERVER_ADDR"] : 'cli',
        $msg,
        PHP_EOL
    ));
    $fp = fopen(dirname(__DIR__) . '/logs/' . date("Y-m-d") . 'log', 'a');
    fwrite($fp, $msg);
    fclose($fp);
    return true;
}

/**
 * 将文件转化为zip
 *
 * @param string $filename
 * @param string $content
 * @return string boolean
 */
function fileToZipStream($filename, $content)
{
    $tmp = tempnam(sys_get_temp_dir(), 'zip_');
    $zip = new ZipArchive();
    $res = $zip->open($tmp, ZipArchive::CREATE);
    if ($res === true) {
        $zip->addFromString($filename, $content);
        $zip->close();
        $rst = file_get_contents($tmp);
        unlink($tmp);
        return $rst;
    } else {
        return false;
    }
}

/**
 * 检测字符串是否为UTF-8
 *
 * @param string $string
 * @return number
 */
function detectUTF8($string)
{
    return preg_match('%(?:
        [\xC2-\xDF][\x80-\xBF]
        |\xE0[\xA0-\xBF][\x80-\xBF]
        |[\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}
        |\xED[\x80-\x9F][\x80-\xBF]    
        |\xF0[\x90-\xBF][\x80-\xBF]{2}
        |[\xF1-\xF3][\x80-\xBF]{3}
        |\xF4[\x80-\x8F][\x80-\xBF]{2}
        )+%xs', $string);
}

/**
 * 增加新的map reduce统计工具，增加了对于mongodb的唯一数据进行处理
 *
 * @param string $out
 * @param MongoCollection $dataModel
 * @param array $statisticInfo
 * @param unknown $query
 * @param string $method
 * @param string $scope
 * @param unknown $sort
 * @param string $limit
 * @return Ambigous <boolean, multitype:number unknown Ambigous <string, mixed> , \My\Common\MongoCollection, multitype:number unknown string >|\My\Common\MongoCollection|Ambigous <boolean, \My\Common\MongoCollection, multitype:number unknown string , multitype:number unknown Ambigous <string, mixed> >
 */
function mapReduce($out = null, MongoCollection $dataModel, $statisticInfo, $query, $method = 'replace', $scope = null, $sort = array('$natural' => 1), $limit = null)
{
    try {
        $map = "function(){
	        var xAxisType = '{$statisticInfo['xAxisType']}';
			var xAxisField = this.{$statisticInfo['xAxisField']};
			var yAxisField = this.{$statisticInfo['yAxisField']};
			var xAxisTitle = '{$statisticInfo['xAxisTitle']}';
			var yAxisType = '{$statisticInfo['yAxisType']}';
			var yAxisFieldValue = yAxisField;

			var key = '';
			var rst = {
					total : isNumber(yAxisField) ? yAxisField : 0,
					count : yAxisField!==null ? 1 : 0,
					max : isNumber(yAxisField) ? yAxisField : Number.NEGATIVE_INFINITY,
					min : isNumber(yAxisField) ? yAxisField : Number.POSITIVE_INFINITY,
					val : [yAxisField]
            };
            
            if(yAxisType=='unique'||yAxisType=='distinct') {
                var keyOthers = {};
                keyOthers[xAxisType] = '__OTHERS__';
                keyOthers['val'] = '__OTHERS__';
            } else {
                keyOthers = '__OTHERS__';
            }
            
            if(xAxisField==null ||yAxisField==null) {
                key = keyOthers;
                return emit(key,rst);
            }
            
            if(xAxisType=='hour' || xAxisType=='day' || xAxisType=='month' || xAxisType=='year') {
                if(xAxisField!==null) {
                    try {
                        var time = new Date(xAxisField);
                        var timeSec = time.getTime();
                        var year = time.getFullYear();
                        var m = time.getMonth() + 1;
                        var month = m<10 ? '0'+m : m;
                        var d = time.getDate();
                        var day = d<10 ? '0'+d : d;
                        var h = time.getHours();
                        var hour = h<10 ? '0'+h : h;
                    } catch (e) {
                        key = keyOthers;
                        return emit(key,rst);
                    }
                } else {
                    key = keyOthers;
                    return emit(key,rst);
                }
            } else {
                if(!isNumber(yAxisField)) {
                    yAxisField = 0;
                }
            }

            if(xAxisField instanceof Array || xAxisField instanceof Object) {
                if(xAxisField instanceof NumberLong) {
                    xAxisField = NumberInt(xAxisField);
                } else {
                    xAxisField = xAxisField.toString();
                }
            }

            switch(xAxisType) {
                case 'total':
                    key = xAxisTitle;
                    break;
                case 'range':
                    var	options = [
                        0,
                        1, 2, 5,
                        10, 20, 50,
                        100, 200, 500,
                        1000, 2000, 5000,
                        10000, 20000, 50000,
                        100000, 200000, 500000,
                        1000000, 2000000, 5000000,
                        10000000, 20000000, 50000000,
                        100000000, 200000000, 500000000,
                        1000000000, Number.POSITIVE_INFINITY
                    ];
                    
                    for(var index = 0; options[index] < field; index++) {
                        key = options[index]+'-'+options[index+1];
                    }
                    break;
                case 'day':
                    key = year+'/'+month+'/'+day;
                    break;
                case 'month':
                    key = year+'/'+month;
                    break;
                case 'year':
                    key = year;
                    break;
                case 'hour':
                    key = hour;
                    break;
                default :
                    key = xAxisField;
                    break;
            }
            
            if(yAxisType=='unique'||yAxisType=='distinct') {
                try {
                    var newKey = {};
                    newKey[xAxisType] = key;
                    newKey['val'] = yAxisFieldValue;
                    return emit(newKey,rst);
                } catch (e) {}
            }

            return emit(key,rst);
}";

        $reduce = "function(key,values){
                var rst = {
                    total : 0,
                    count : 0,
                    max : Number.NEGATIVE_INFINITY,
                    min : Number.POSITIVE_INFINITY,
                    val : []
                };

                var yAxisType = '{$statisticInfo['yAxisType']}';
                var length = values.length;
                
                if(yAxisType=='unique'||yAxisType=='distinct') {
                    var rst = {
                        count : 0
                    };
                    
                    var count = 0;
                    values.forEach(function(v) {
                        rst['count'] += v['count'];
                    });
                    return rst;
                }

                for(var idx = 0; idx < length ; idx++) {
                    if(yAxisType=='count') {
                        rst.count += values[idx].count;
                    } else if(yAxisType=='sum') {
                        rst.total += values[idx].total;
                    } else if(yAxisType=='max') {
                        if(rst.max==null)
                            rst.max = values[idx].max;
                        else if(rst.max <= values[idx].max) {
                            rst.max = values[idx].max;
                        }
                    } else if(yAxisType=='min') {
                        if(rst.min==null) {
                            rst.min = values[idx].min;
                        }
                        else if(rst.min >= values[idx].min) {
                            rst.min = values[idx].min;
                        }
                    } else if(yAxisType=='avg') {
                        rst.total += values[idx].total;
                        rst.count += values[idx].count;
                    } else if(yAxisType=='median') {
                        values[idx].val.forEach(function(v,i){
                            if(typeof(v)=='number') {
                                rst.val.push(v);
                            }
                        });
                    } else if(yAxisType=='variance') {
                        rst.total += values[idx].total;
                        rst.count += values[idx].count;
                        values[idx].val.forEach(function(v,i){
                            rst.val.push(v);
                        });
                    } else if(yAxisType=='standard') {
                        rst.total += values[idx].total;
                        rst.count += values[idx].count;
                        values[idx].val.forEach(function(v,i){
                            rst.val.push(v);
                        });
                    }
                }
                return rst;
}";

        $finalize = "function(key,reducedValue){
            var rst = 0;
            var uniqueData = [];
            var uniqueNumber = 0;
            var yAxisType = '{$statisticInfo['yAxisType']}';
            if(yAxisType=='count') {
                rst = reducedValue.count;
            }
            else if(yAxisType=='sum') {
                rst = reducedValue.total;
            }
            else if(yAxisType=='max') {
                rst = reducedValue.max;
            }
            else if(yAxisType=='min') {
        		rst = reducedValue.min;
            }
            else if(yAxisType=='unique' || yAxisType=='distinct') {
        		return reducedValue.count;
            }
    		else if(yAxisType=='avg') {
    		  rst = reducedValue.total / reducedValue.count;
    		  rst = Math.round(rst*10000)/10000;
            }
    		else if(yAxisType=='median') {
    		  reducedValue.val.sort(function(a,b){return a>b?1:-1});
    		  var length = reducedValue.val.length;
    		  rst = reducedValue.val[parseInt(Math.floor(length/2))];
            }
            else if(yAxisType=='variance') {
                var avg = reducedValue.total / reducedValue.count;
                var squared_Diff = 0;
                var length = reducedValue.val.length;
                for(var i=0;i<length;i++) {
                    var deviation = reducedValue.val[i] - avg;
                    squared_Diff += deviation * deviation;
                }
                rst = squared_Diff/length;
                rst = Math.round(rst*10000)/10000;
            }
            else if(yAxisType=='standard') {
                var avg = reducedValue.total / reducedValue.count;
                var squared_Diff = 0;
                var length = reducedValue.val.length;
                for(var i=0;i<length;i++) {
                    var deviation = reducedValue.val[i] - avg;
                    squared_Diff += deviation * deviation;
                }
                rst = Math.sqrt(squared_Diff/length);
                rst = Math.round(rst*10000)/10000;
            }
            return rst;
}";

        $mapUnique = "function(){
            var rst = {
                count : 1
            };
            var xAxisType = '{$statisticInfo['xAxisType']}';
            if(this['_id'][xAxisType]==null || this['_id'][xAxisType]==undefined) {
                emit('__OTHERS__', rst);
            } else {
                emit(this['_id'][xAxisType], rst);
            }
}";

        $reduceUnique = "function(key,values){
            var rst = {
                count : 0
            };
            values.forEach(function(v) {
                rst['count'] += v['count'];
            });
            return rst;
        }";

        if ($statisticInfo['yAxisType'] == 'unique' || $statisticInfo['yAxisType'] == 'distinct') {
            $dataModel->setReadPreference(\MongoClient::RP_SECONDARY);
            echo "unique or distinct start \n";
            var_dump($out, $map, $reduce, $query, $finalize, $method, $scope, $sort, $limit);
            echo "unique or distinct end \n";
            $firstMrResult = $dataModel->mapReduce($out, $map, $reduce, $query, $finalize, $method, $scope, $sort, $limit);
            echo "firstMrResult start \n";
            var_dump($firstMrResult);
            echo "firstMrResult end \n";
            if ($firstMrResult instanceof MongoCollection) {
                $firstMrResult->setNoAppendQuery(true);
                if ($out != null) {
                    $out .= '_unique';
                }
                echo "unique out start\n";
                echo $out;
                echo "unique out end\n";
                return $firstMrResult->mapReduce($out, $mapUnique, $reduceUnique, array(
                    '_id' => array(
                        '$exists' => true
                    )
                ), $finalize, $method, $scope, $sort, $limit);
            } else {
                return $firstMrResult;
            }
        } else {
            echo "no unique or distinct start \n";
            var_dump($out, $map, $reduce, $query, $finalize, $method, $scope, $sort, $limit);
            echo "no unique or distinct end \n";
            $dataModel->setReadPreference(\MongoClient::RP_SECONDARY);
            return $dataModel->mapReduce($out, $map, $reduce, $query, $finalize, $method, $scope, $sort, $limit);
        }
    } catch (\Exception $e) {
        echo "mapreduce1 Exception start\n";
        echo exceptionMsg($e);
        echo "mapreduce1 Exception end\n";
        return false;
    }
}

/**
 * 解压压缩包中的指定类型的文件到临时目录文件中
 *
 * @param string $zipfile
 * @param array $type
 */
function unzip($zipfile, $types = array())
{
    $rst = array();
    $zip = new ZipArchive();
    if ($zip->open($zipfile) === true) {
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entry = $zip->getNameIndex($i);
            if (!empty($types)) {
                foreach ($types as $type) {
                    if (!preg_match('#\.(' . $type . ')$#i', $entry)) {
                        continue 2;
                    }
                }
            }
            $tmpname = tempnam(sys_get_temp_dir(), 'unzip_');
            copy('zip://' . $zipfile . '#' . $entry, $tmpname);
            $rst[] = $tmpname;
        }
        $zip->close();
        return $rst;
    } else {
        throw new Exception("ZIP archive failed");
        return false;
    }
}

/**
 * Check if the file is encrypted
 *
 * Notice: if file doesn't exists or cannot be opened, function
 * also return false.
 *
 * @param string $pathToArchive
 * @return boolean return true if file is encrypted
 */
function isEncryptedZip($pathToArchive)
{
    $fp = @fopen($pathToArchive, 'r');
    $encrypted = false;
    if ($fp && fseek($fp, 6) == 0) {
        $string = fread($fp, 2);
        if (false !== $string) {
            $data = unpack("vgeneral", $string);
            $encrypted = $data['general'] & 0x01 ? true : false;
        }
        fclose($fp);
    }
    return $encrypted;
}

/**
 * 检测指定内容是否为zip压缩文件
 *
 * @param string $content
 * @return boolean
 */
function isZip($content)
{
    $finfo = new \finfo(FILEINFO_MIME);
    $mime = $finfo->buffer($content);
    if (strpos($mime, 'zip') !== false) {
        return true;
    }
    return false;
}

/**
 * 将指定内容写入到临时文件
 *
 * @param mixed $content
 */
function toTemp($content)
{
    $fileName = tempnam(sys_get_temp_dir(), "icc_temp_");
    file_put_contents($fileName, $content);
    return $fileName;
}

/**
 * 通过popen运行指定的命令
 *
 * @param string $cmd
 * @param boolean $output
 * @return string
 */
function runCmd($cmd, $output = false)
{
    $result = '';
    $fp = popen($cmd, "r");
    while (!feof($fp)) {
        $result .= fgets($fp, 1024);
    }
    pclose($fp);
    if ($output) {
        echo "\n";
        echo "====================";
        echo date("Y-m-d H:i:s");
        echo "====================";
        echo "\n";
        echo "================cmd=======================\n";
        echo $cmd . "\n";
        echo "================cmd result================\n";
        echo $result . "\n";
        echo "================cmd end===================\n";
    }
    return $result;
}


/**
 * 判断一张图片是否为gif
 *
 * @param 二进制图片内容 $filename
 */
function isAnimatedGif($image)
{
    return strpos($image, chr(0x21) . chr(0xff) . chr(0x0b) . 'NETSCAPE2.0') === FALSE ? false : true;
}

<?php
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST')
{
    header('HTTP/1.1 403 Forbidden');
    header('Content-type: text/plain; charset=utf-8');
    echo "Forbidden\n";
    exit;
}

require '../_inc/config.inc';
require '../_inc/functions.inc';
require '../_inc/FileInterface.inc';
require '../_inc/FileSystemInterface.inc';

$return = array();
$return['result'] = 'fail';
$return['errors'] = array();

if ( ! isset($_REQUEST['filename']) || empty($_REQUEST['filename']))
{
    $return['missing'] = array('filename'=>'File Name');
}
elseif (mb_strpos($_REQUEST['filename'], '/') !== false)
{
    $return['errors'][] = 'Invalid file name';
}
else
{
    $file_to_create = '../'.FMS_USER_FOLDER.'/'.trim($_REQUEST['filename']);

    if (is_file($file_to_create)) // file already exists
    {
         $return['result'] = 'success';
    }
    else
    {

    }
}

if (defined('FMS_AJAX') && FMS_AJAX === true)
{
    header("HTTP/1.1 200 OK");
    header('Content-type: text/plain; charset=utf-8');
    echo json_encode($return);
    exit;
}

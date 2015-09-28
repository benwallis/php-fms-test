<?php
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');

//+----------------------------------------------------------------------------
//| PHP Version
//+----------------------------------------------------------------------------
if ( ! defined('PHP_VERSION_ID')) // PHP_VERSION_ID is available from PHP 5.2.7
{
    $version = explode('.', PHP_VERSION);
    define('PHP_VERSION_ID', ($version[0] * 10000 + $version[1] * 100 + $version[2]));
}

if (PHP_VERSION_ID < 50207 && isset($version))
{
    define('PHP_MAJOR_VERSION',   $version[0]);
    define('PHP_MINOR_VERSION',   $version[1]);
    define('PHP_RELEASE_VERSION', $version[2]);
}

if (isset($version)) unset($version);

//+----------------------------------------------------------------------------
//| Request Protocol
//+----------------------------------------------------------------------------
(isset($_SERVER['HTTPS']) && ! empty($_SERVER['HTTPS'])) ? define('FMS_PROTOCOL', 'https') : define('FMS_PROTOCOL', 'http') ;


define('FMS_HOST', $_SERVER['HTTP_HOST']);
define('FMS_WEBROOT', FMS_PROTOCOL.'://'.FMS_HOST.'/');
define('FMS_DOCROOT', $_SERVER['DOCUMENT_ROOT']);
define('FMS_USER_FOLDER', 'userfiles');

//+----------------------------------------------------------------------------
//| Ajax Request?
//+----------------------------------------------------------------------------
if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')
{
    define('FMS_AJAX', true);
}
else
{
    define('FMS_AJAX', false);
}

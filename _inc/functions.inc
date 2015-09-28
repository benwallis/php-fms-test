<?php

/**
 *
 * Call and return controller script
 *
 * @param string $controller_path_basename
 * @params array $params Data passed to page
 * @return string HTML content
 */
function getContent($controller_path_basename='', $params=array())
{
    $basename = (mb_strpos($controller_path_basename, '/') !== false) ? mb_substr(mb_strrchr($controller_path_basename, '/'), 1) : $controller_path_basename ;

    if (function_exists($basename)) // The controller function might already be defined from a previous call (during this request)
    {
        return call_user_func_array($basename, $params);
    }
    else if (is_file("_php/{$controller_path_basename}.inc")) // check for controller file + function
    {
        require "_php/{$controller_path_basename}.inc";

        if (function_exists($basename))
        {
            return call_user_func_array($basename, $params);
        }
        else // error
        {
            return "Function <strong>{$basename}()</strong> does not exist";
        }
    }
    else
    {
        if (is_file("_templates/{$controller_path_basename}.ihtml")) // check for static template
        {
            return file_get_contents("_templates/{$controller_path_basename}.ihtml");
        }
        else // error
        {
            return "<strong>File does not exist</strong> as Controller (_php/{$controller_path_basename}.inc), or Template (_templates/{$controller_path_basename}.ihtml)";
        }
    }

    return ''; // fail silently
}


/**
* Get the current operating system
*
* @return string
*/
function getOS()
{
    if (mb_strpos(PHP_OS, 'DAR') !== false) return 'OSX';

    if (mb_strpos(PHP_OS, 'WIN') !== false) return 'WIN';

    if (mb_strpos(PHP_OS, 'LINUX') !== false) return 'LINUX';

    return 'Unknown';
}


function get_file_mime_type($path)
{
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $path);
    return $mime;
}


function filesize_format($size, $sizes = array('Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'))
{
    // number_format(, 2, '.', ",");

    return (round($size/pow(1024, ($i = floor(log($size, 1024)))), 2) . ' ' . $sizes[$i]);
}

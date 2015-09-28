<?php
require '_inc/config.inc';
require '_inc/functions.inc';
require '_inc/Template.inc';
require '_inc/FileInterface.inc';
require '_inc/FileSystemInterface.inc';

// no caching (when testing)
/*
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s", time()-3600) . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
header("X-Frame-Options: DENY");
*/

$html = getContent('pages/home');

if (is_string($html)) echo $html;

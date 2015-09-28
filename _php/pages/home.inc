<?php
function home($page=array())
{
    /*
    if (isset($_SESSION['user']))
    {
        header('Location: '.MGL_WEBROOT.'list-home', null, 302);
        exit;
    }
    */

    $fileSystem = new \FileSystem;

    $filesJSON = json_encode($fileSystem->filesArray);

    $t = new Template('_templates');

    $t->set_file(array(
                        'main' => 'main.ihtml',
                        'home' => 'pages/home.ihtml'
                      ));

    $t->set_var(array(
                       'CREATE_FILE_PANEL' => getContent('blocks/create_file_panel'),
                       'RENAME_FILE_PANEL' => getContent('blocks/rename_file_panel'),
                       'FILES_TABLE'       => getContent('blocks/files_table'),
                       'SCRIPT_JSON'       => "<script>\n$('#filestable').data('items', {$filesJSON});\n</script>\n"
                       ));

    $t->parse('CONTENT', __FUNCTION__); // parse and store result in CONTENT (which is in 'main')
    $t->parse('OUTPUT', 'main'); // parse 'main' and store result in OUTPUT
    $t->p('OUTPUT'); // display OUTPUT
}

var PHP_FMS =
{
    init:function()
    {
        // Create New File button
        $('#createfilebtn').on('click', function(){
            $(this).hide();
            $('#tablepanel').hide();
            $('#userfilename').val('');
            $('#createfilepanel').show();
            });

        // Create New File save button
        $('#createfilesavebtn').on('click', function(){
            PHP_FMS.create_file();
            });

        $('#createfilecancelbtn').on('click', function()
        {
            $('#createfilebtn').show();
            $('#tablepanel').show();
            $('#userfilename').val('');
            $('#createfilepanel').hide();
            });

        // Rename File save button
        $('#renamefilesavebtn').on('click', function(){
            PHP_FMS.rename_file();
            });

        $('#renamefilecancelbtn').on('click', function()
        {
            $('#createfilebtn').show();
            $('#tablepanel').show();
            $('#paneltitle').text('Rename File');
            $('#renamefilepanel').hide();
            });

        // Delete button (in modal)
        $('#modaldeletebtn').on('click', function(ev){
            ev.preventDefault();
            $(this).attr('disabled', 'disabled');
            $('#deleteModal').modal('hide');
            PHP_FMS.delete_file();
            });

        // Table sorting
        $('#filestable').on('click', 'th.sort', function(){
            PHP_FMS.sort_table($(this));
            });

        // Files table
        var t = $("#filestable");

        var items = t.data('items');

        ( ! items || items === null || items.length == 0) ? $('#tablepanel').hide() : $('#tablepanel').show();

        t.data('table', 'file');
        t.data('page_type', 'File');
        t.data('items', items);
        t.data("currentpage", 1);
        t.data("perpage", 50);
        t.data("sortorder", "Ascending");
        t.data("sortfield", "sortorder");
        t.data("sortname", "Sort Order");
        t.data("ordering", false);
        t.data("filter_obj", null); // temp storage for filtered items
        t.data("renderRowFunc", function(obj)
        {
            return '<tr>'+"\n"+
                   ' <td>'+ obj.name +'</td>'+"\n"+
                   ' <td>'+ obj.formatted_size +'</td>'+"\n"+
                   ' <td>'+
                   '  <button data-filename="'+ obj.name +'" onclick="PHP_FMS.show_rename(\''+ obj.name +'\')" class="btn btn-warning" title="Rename file: '+ obj.name +'"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Rename</button>'+
                   ' &nbsp; '+
                   '  <button data-filename="'+ obj.name +'" onclick="PHP_FMS.confirm_delete(\''+ obj.name +'\')" class="btn btn-danger" title="Delete file: '+ obj.name +'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete</button>'+
                   ' </td>'+"\n"+
                   '</tr>'+"\n";
        });

        PHP_FMS.render_table('filestable');
    },


    render_table:function(table_id)
    {
        var t = $('#'+ table_id)[0];

        $('#'+ table_id +' tbody tr').remove(); // remove all rows

        var items = $(t).data('items');

        if (items) var data_obj = $(t).data('items');

        if (data_obj && data_obj.length > 0) // any rows to display ?
        {
            var perpage = $(t).data('perpage');

            var currentpage = $(t).data('currentpage');

            var start_index = (currentpage == 1) ? 0 : ((currentpage-1) * perpage) ;

            var end_index = (start_index + perpage);

            if (end_index > data_obj.length) end_index = data_obj.length;

            // Render
            for (var i = start_index; i < end_index; i++)
            {
                var renderRowFunc = $(t).data("renderRowFunc");

                $('#'+ table_id +' tbody').append(renderRowFunc(data_obj[i]));
            }

            $('#tablepanel').show();
        }
        else
        {
            $('#tablepanel').hide();
        }
    },


    sort_table:function(element, direction)
    {
        var table_id = element.parents('table').attr('id');
        var key = element[0].dataset.key;
        var type = element[0].dataset.type;

        var table = $('#'+table_id);

        var new_sortorder = false;

        if (direction)
        {
            switch(direction)
            {
                case '+':
                case 'Ascending':
                    new_sortorder = 'Ascending';
                    break;

                case '-':
                case 'Descending':
                    new_sortorder = 'Descending';
                    break;
            }
        }

        if ( ! new_sortorder)
        {
            var current_sortorder = table.data('sortorder'); // get current sort order for this table column

            switch(current_sortorder) // flip the sort order for this table column
            {
                case 'Ascending':
                    new_sortorder = 'Descending';
                    break;

                case 'Descending':
                    new_sortorder = 'Ascending';
                    break;

                default:
                    new_sortorder = 'Ascending';
            }
        }

        table.data('sortorder', new_sortorder); // store the new sort order for this table column

        var items = table.data('items'); // Get the table data

        switch(type)
        {
            case 'number':
                if (new_sortorder == "Descending")
                {
                    var sortfunc = function(a, b) { return parseInt(b[key]) - parseInt(a[key]); };
                }
                else
                {
                    var sortfunc = function(a, b) { return (parseInt(a[key]) - parseInt(b[key])); };
                }
                break;

            case 'string': // will work for SQL dates
                if (new_sortorder == "Descending")
                {
                    var sortfunc = function(a, b) { return (a[key].toLowerCase() < b[key].toLowerCase()) ? 1 : -1 ; };
                }
                else
                {
                    var sortfunc = function(a, b) { return (a[key].toLowerCase() < b[key].toLowerCase()) ? -1 : 1 ; };
                }
                break;

            case 'float':
                if (new_sortorder == "Descending")
                {
                    var sortfunc = function(a, b) { return parseFloat(b[key]) - parseFloat(a[key]); };
                }
                else
                {
                    var sortfunc = function(a, b) { return (parseFloat(a[key]) - parseFloat(b[key])); };
                }
                break;
        }

        if (sortfunc)
        {
            items.sort(sortfunc);
            table.data('items', items); // store the sorted data
            table.attr("title", "Sorted by " + element.text() + " " + new_sortorder);
            PHP_FMS.render_table(table_id);
        }
    },


    show_rename:function(filename)
    {
        $('#createfilebtn').hide();
        $('#tablepanel').hide();
        $('#paneltitle').text('Rename File: '+ filename);
        $('#renamefilepanel').show();
        PHP_FMS.rename_file();
    },


    confirm_delete:function(filename)
    {
        $('#deleteModal').find('.modal-body li').text(filename);
        $('#modaldeletebtn').removeAttr('disabled');
        $('#deleteModal').modal('show');
    },


    delete_file:function()
    {
        var filename = $('#deleteModal').find('.modal-body li').text();

        ajaxreq = $.ajax(
        {
            url:"/scripts/delete_file.php",
            type:"POST",
            data: {'filename': filename},
            timeout:30000,
            cache:false,
            dataType:"json",
            success:function(data)
            {
                if (data.result == "fail")
                {
                    PHP_FMS.display_errors(data);
                }
                else if (data.result == "success")
                {
                    var items = $('#filestable').data('items');

                    var index = PHP_FMS.find_item("name", filename, items);

                    items.splice(index, 1);

                    $('#filestable').data('items', items);

                    PHP_FMS.render_table('filestable');
                }
            },

            error:function(r,s,e)
            {
                if (s === 'timeout')
                {
                    PHP_FMS.alert_msg("Timeout", 'Sorry but there was no response from the server. Please try again.', 'danger');
                }
                else if (s !== 'abort')
                {
                    PHP_FMS.alert_msg('Error', 'Sorry but an error occurred! Please refresh the page and try again.', 'danger');
                }
            }
        });
    },


    create_file:function()
    {
        var userfilename = $('#userfilename').val();

        if (userfilename === "" || userfilename === null)
        {
            // invalid
            // PHP_FMS.alert_msg('Error', 'Please enter a file name.', 'danger');
        }
        else
        {
            ajaxreq = $.ajax(
            {
                type:"POST",
                url:'/scripts/create_file.php',
                data: {'userfilename': userfilename},
                timeout:60000,
                cache:false,
                dataType:'json',
                success:function(data)
                {
                    if ( ! data.result || data.result == 'fail')
                    {
                        PHP_FMS.display_errors(data);
                    }
                    else
                    {
                        var items = $('#filestable').data('items');

                        var index = PHP_FMS.find_item("name", data.new_file.name, items);

                        if (index !== false)
                        {
                            for (var prop in data.new_file)
                            {
                                items[index][prop] = data.new_file[prop]; // overwrite existing
                            }
                        }
                        else
                        {
                            items.push(data.new_file); // add new item
                        }

                        $('#filestable').data('items', items);

                        if (data.feedback) PHP_FMS.alert_msg('Created', data.feedback, 'success');
                    }
                },

                error:function(r,s,e)
                {
                    if (s === 'timeout')
                    {
                        PHP_FMS.alert_msg("Timeout", 'Sorry but there was no response from the server. Please try again.', 'danger');
                    }
                    else if (s !== 'abort')
                    {
                        PHP_FMS.alert_msg("Error", 'Sorry but an unknown error occurred! Please try again later.', 'danger');
                    }
                }
            });
        }
    },


    rename_file:function()
    {

    },

    display_errors:function(data, callback)
    {
        var feedbackmsg = '';

        // Report missing fields
        if (typeof data.missing != "undefined")
        {
            var missing_fields = [];
            var missing_names = [];

            for (var prop in data.missing) // prop is the field name, value is the field description (label)
            {
                var field = $('#'+prop)[0];

                var label = $('label[for='+prop+']')[0];

                if (field && ! $(field).hasClass('invalid')) $(field).addClass('invalid');
                if (label && ! $(label).hasClass('invalid')) $(label).addClass('invalid');

                missing_fields.push(prop);
                missing_names.push(data.missing[prop]);
            }

            var plural = (missing_fields.length == 1) ? ' is' : 's are' ;

            var missing = (missing_names.length > 1) ? PHP_FMS.implode('</li><li>', missing_names) : missing_names[0] ;

            feedbackmsg += 'The following required field' + plural + ' missing:' + '<ul><li>' + missing + '</li></ul>';
        }

        // Report errors
        if (typeof data.errors != "undefined" && data.errors.length > 0)
        {
            var plural = (data.errors.length > 1) ? 's' : '' ;

            var error = (data.errors.length > 1) ? PHP_FMS.implode('</li><li>', data.errors) : data.errors[0] ;

            feedbackmsg += 'The following error' + plural + ' occurred:' + '<br /><ul><li>' + error + '</li></ul><br />';
        }

        if (feedbackmsg == '') feedbackmsg = 'Sorry but an unknown error occurred. ';

        feedbackmsg += 'Please check and try again.';

        if ( ! callback || typeof callback !== 'function') callback = null;

        PHP_FMS.alert_msg('Error', feedbackmsg, 'danger', callback);
    },


    alert_msg:function(title, msg, alert_class, closeFunc)
    {
        $('#alertmsg').remove();

        $('#filestable').before('<div id="alertmsg" class="alert alert-'+ alert_class +' alert-dismissible" role="alert">'+
                                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                                msg +
                                '</div>');
    },


    find_item:function(needle_attr, needle_val, haystack)
    {
        if (typeof haystack != 'object') return false;

        var index = '';

        for (var index in haystack) if (haystack[index][needle_attr] == needle_val) return index;

        return false;
    },


    implode:function(glue, pieces) // http://kevin.vanzonneveld.net
    {
        var i = '', retVal='', tGlue='';

        if (arguments.length === 1)
        {
            pieces = glue;
            glue = '';
        }

        if (typeof(pieces) === 'object')
        {
            if (pieces instanceof Array)
            {
                return pieces.join(glue);
            }
            else
            {
                for (i in pieces)
                {
                    retVal += tGlue + pieces[i];
                    tGlue = glue;
                }

                return retVal;
            }
        }
        else
        {
            return pieces;
        }
    }
}

$(document).ready(function()
{
    PHP_FMS.init();
});

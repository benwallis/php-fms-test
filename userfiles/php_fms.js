var ajaxreq;

var PHP_FMS =
{
    init:function()
    {

        $('#savenewfile').on('click', function(ev)
        {
            $(this).attr('disabled', 'disabled');
            ev.preventDefault();
            PHP_FMS.save_new_file();
        });

        $('#savenewfile').on('click', function(ev)
        {
            $(this).attr('disabled', 'disabled');
            ev.preventDefault();
            PHP_FMS.save_new_file();
        });

        // Show remaining chars for form fields with max. lengths
        $('input,textarea').focus(function()
                            {
                                if ($(this).hasClass("invalid")) $(this).removeClass("invalid");

                                if ($(this).prev().hasClass("invalid")) $(this).prev().removeClass("invalid");

                                var span = $(this).prev().children('span.len')[0]; // get previous label
                                if (span)
                                {
                                    $(span).css('visibility', 'visible');
                                    $(span).text(span.dataset.maxlength - $(this).val().length + ' chars. remaining');
                                }
                            })
                            .blur(function()
                            {
                                var span = $(this).prev().children('span.len')[0];
                                if (span) $(span).css('visibility', 'hidden');
                            })
                            .keyup(function()
                            {
                                var span = $(this).prev().children('span.len')[0]; // get previous label
                                if (span)
                                {
                                    var max = span.dataset.maxlength;
                                    $(span).text(max - $(this).val().length + ' chars. remaining');
                                }
                            });

        var t = $("#filestable");

        var items = t.data('items');

        ( ! items || items === null || items.length == 0) ? t.hide() : t.show();

        t.data('table', 'page');
        t.data('page_type', 'Article');

        t.data('items', items);
        t.data("currentpage", 1);

        /*
        var perpage = parseInt(DTV_ADMIN.get_cookie('articletable', 'perpage'));

        switch(perpage) // prevent cookie injection
        {
            case 5:
            case 10:
            case 20:
            case 30:
            case 50:
            case 100:
                break;

            default:
                perpage = 10;
        }
        $('#perpage').val(perpage);
        */

        t.data("perpage", 50);
        t.data("sortorder", "Ascending");
        t.data("sortfield", "sortorder");
        t.data("sortname", "Sort Order");
        t.data("ordering", false);
        t.data("filter_obj", null); // temp storage for filtered items
        t.data("renderRowFunc", function(obj)
        {
            if (console) console.debug(obj);

            // var status_btn = (obj.status == 'Active') ? 'okbtn' : 'greybtn' ;

            var created = (obj.created === null) ? '-' : obj.created ;

            var modified = (obj.modified === null) ? '-' : obj.modified ;

            return '<tr id="row'+ obj.id +'">'+"\n"+
                   ' <td><p class="left">'+ obj.name +'</p></td>'+"\n"+
                   ' <td><p class="left">'+ obj.formatted_size +'</p></td>'+"\n"+
                   ' <td class="left">'+
                   '  <button onclick="PHP_FMS.start_edit('+ obj.id +')" class="btn btn-warning" title="Edit file: '+ obj.name +'"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span> Edit</button>'+
                   ' &nbsp; '+
                   '  <button onclick="PHP_FMS.confirm_delete('+ obj.id +', \''+ obj.name +'\')" class="btn btn-danger" title="Delete file: '+ obj.name +'"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span> Delete</button>'+
                   ' </td>'+"\n"+
                   '</tr>'+"\n";
        });

        PHP_FMS.render_table('filestable');
    },



    render_table:function(table_id)
    {
        console.log('render_table()');

        // if (console) console.debug('render_table');

        var t = $('#'+ table_id)[0];

        $('#'+ table_id +' tbody tr').remove(); // remove all rows

        $('#pagingbottom').remove();

        $('div.paging').empty();

        var items = $(t).data('items');

        if (items)
        {
            var data_obj = ($(t).data('filter_obj') && $(t).data('filter_obj') !== null) ? $(t).data('filter_obj') : $(t).data('items');

            // var filtered = (data_obj.length < items.length) ? ' containing ' : '' ;

            (data_obj.length <= 1) ? $('#editsortorderbtn').hide() : $('#editsortorderbtn').show() ;

            (data_obj.length < 10) ? $('#perpage').parent().hide() : $('#perpage').parent().show() ;
        }

        if (data_obj && data_obj.length > 0) // any rows to display ?
        {
            /*
            $('#perpage > option').each(function(index, el)
            {
                ($(this).val() > (data_obj.length * 2)) ? $(this).hide() : $(this).show() ;
            });
            */

            var perpage = $(t).data('perpage');

            var currentpage = $(t).data('currentpage');

            var total_pages = Math.ceil(data_obj.length / perpage);

            var start_index = (currentpage == 1) ? 0 : ((currentpage-1) * perpage) ;

            var end_index = (start_index + perpage);

            if (end_index > data_obj.length) end_index = data_obj.length;

            // var first_item = (start_index >= end_index) ? end_index : (start_index + 1) ;

            // var plural = (dataobj.length == 1 ) ? '' : 's' ;

            // $('#tabletitle').html("Displaying "+ firstPageItem +"-"+ endIndex +" of "+ dataobj.length +' offer'+ plural + filtered +":");

            /*
            if (total_pages > 1) // Pagination
            {
                // $('#'+ table_id).before('<div id="pagingtop" class="paging" style="width:'+ $('#'+ table_id).width() +'px"></div>');

                // "Next" button
                if (currentpage < total_pages) $('#pagingtop').append('<button class="pagebtn blackbtn nextbtn" title="Next Page">»</button>');

                // Page list links
                $('#pagingtop').append('<ol></ol>');

                for (var p = 1; p <= total_pages; p++)
                {
                    if (p == currentpage)
                    {
                        $('#pagingtop ol').append('<li class="currentpage" title="Page '+ p +'">'+ p +'</li>');
                    }
                    else
                    {
                        $('#pagingtop ol').append('<li><a href="#" class="pagebtn blackbtn" title="Go to Page '+ p +'">'+ p +'</a></li>');
                    }
                }

                // "Previous" button
                if (currentpage > 1) $('#pagingtop').append('<button class="pagebtn blackbtn prevbtn" title="Previous Page">«</button>');

                $('#pagingtop').clone(true).insertAfter('#'+ table_id).attr("id", 'pagingbottom');
            }
            */

            // Render
            for (var i = start_index; i < end_index; i++)
            {
                var renderRowFunc = $(t).data("renderRowFunc");

                $('#'+ table_id +' tbody').append(renderRowFunc(data_obj[i]));
            }

            $('#'+ table_id +' tr:even td').addClass("alt"); // alternating table row colours

            $(t).show();
        }
        else
        {
            $(t).hide();

            //$('#perpage').parent().hide()
        }
    },



    save_new_file:function()
    {
        console.log('PHP_FMS.save_new_file()');
        console.log($('#userfilename').val());

        var userfilename = $('#userfilename').val();

        if (userfilename === "" || userfilename === null)
        {
            // invalid
            console.log('fucker! :p');
        }
        else
        {
            // progressdialog.dialog('open');

            ajaxreq = $.ajax(
            {
                type:"POST",
                url:'/scripts/save_new_file.php',
                data: $('#userfilename').val(),
                timeout:60000,
                cache:false,
                dataType:'json',
                success:function(data)
                {
                    progressdialog.dialog('close');

                    if ( ! data.result || data.result == 'fail')
                    {
                        DTV_ADMIN.display_errors(data);
                    }
                    else
                    {
                        var t = $('#'+ table_id);

                        var items = t.data('items');

                        var index = DTV_ADMIN.find_item("id", data.new_item.id, items);

                        if (index !== false)
                        {
                            for (var prop in data.new_item)
                            {
                                items[index][prop] = data.new_item[prop]; // overwrite existing
                            }
                        }
                        else
                        {
                            items.push(data.new_item); // add new item
                        }

                        t.data('items', items);

                        DTV_ADMIN.stop_edit_page(table_id);

                        //if (window.scroll) window.scroll(0, 0);

                        if (data.feedback) DTV_ADMIN.alert_msg('Saved', '<p>'+ data.feedback +'</p>', 'success');

                        if (callback && typeof callback === 'function') callback(data);
                    }
                },

                error:function(r,s,e)
                {
                    progressdialog.dialog('close');

                    if (s === 'timeout')
                    {
                        //DTV_ADMIN.alert_msg("Timeout", '<p>Sorry but there was no response from the server.</p><p>Please try again.</p>', 'error');
                        alert("Timeout");
                    }
                    else if (s !== 'abort')
                    {
                        //DTV_ADMIN.alert_msg("Error", '<p>Sorry but an unknown error occurred!</p><p>Please try again later.</p>', 'error');
                        alert("Error");
                    }
                }
            });
        }
    }
}

$(document).ready(function()
{
    PHP_FMS.init();
});

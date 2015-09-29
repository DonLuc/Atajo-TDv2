_moduleViewerLarge = {

    model: null,
    itemsModel : "Nothing to Display",
    currStep: 'record',
    items:[],
    moduleItems:[],
    parent:'',
    parentId:0,
    backtrack : [],
    backtrackId : [],
    currData : {},
    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

         _model.getAll("moduleItems",function(d){

            _moduleViewerLarge.moduleItems=d;
            _moduleViewerLarge.itemsModel=d[0].html;
            

            _model.getAll("Modules", function (moduleData) 
            {
              _log.d(_moduleListLarge.entityId);
              _log.d(JSON.stringify(moduleData));
              if (moduleData.length > 0) {
                try
                {
                  _moduleViewerLarge.model = moduleData;
                  _moduleViewerLarge.moduleItems[0].moduleRecords = _moduleViewerLarge.model[0].data.moduleRecords;

                }catch(err)
                {
                  _log.d(JSON.stringify(moduleData));
                  alert(err);
                }
                  
              } else {
                  alert('No Module Data');
                  _moduleViewerLarge.model = [];
              }

              layout.attach('#moduleViewerLargeFront'); 
            });
            
          });

         

    },

    onMessage : function(data) {

        _moduleViewerLarge.id = data.id;

        $('#divRecords').show();
        $('#divItems').hide();
        $('#htmlLine').hide();
            

            showList = [];
            for(var i in _moduleViewerLarge.model[0].moduleRecords)
            {
                var moduleRecord = _moduleViewerLarge.model[0].moduleRecords[i] ;
                if(moduleRecord.moduleId == _moduleViewerLarge.id)
                {
                    var record = {};
                    record.background = _moduleViewerLarge.getColor(i);
                    record.name = moduleRecord.name;
                    record.index = i;
                    record.headerDone = false;
                    showList.push(record);
                }
            }

            
            e = document.getElementById('moduleViewerLargeFront__FACE');
            scope = angular.element(e).scope();
            scope.$apply(function() 
            {  
                scope.page = 'records';
                scope.showList = showList;
            }); 
            // if(_.isFlipped)
              // _cardEngine.flip("moduleViewerLarge","moduleViewerLargeFront");

           
    



        

    },
    Ctrl : function($scope) {
        $scope.itemsHTML = _moduleViewerLarge.itemsModel;
        $scope.page = 'records';
        $scope.showList = [];
        $scope.tiles = _home.tiles;
        $scope.isTablet = isTablet;
        $scope.Math = window.Math;
        if(isTablet)
        {
            setTimeout(function () {
                _home.scroll = new iScroll($('#scroll2')[0], {
                        scrollX: false, 
                        scrollY: true,
                        scrollbars: false,
                        hScrollbar:false,
                        vScrollbar:false,
                        hideScrollbar: true,
                    });

                $('#htmlLine').html(_moduleViewerLarge.moduleItems[0].htmlLine);
                $('#divRecords').hide();
                $('#divItems').hide();
                $('#htmlLine').hide();
                _moduleViewerLarge.filterFunction();
            }, 500);
        };
        
        $scope.Modules = _moduleViewerLarge.model[0];
        $scope.moduleItem = _moduleViewerLarge.moduleItems[0];

        // $scope.categories = _moduleViewerLarge.moduleItems[0].categories;

        _moduleViewerLarge.items = [];
        for(var i in _moduleViewerLarge.moduleItems)
        {
          for(var j in _moduleViewerLarge.moduleItems[i].items)
          {
            _moduleViewerLarge.items.push(_moduleViewerLarge.moduleItems[i].items[j]);
          }
        }
        $scope.items = _moduleViewerLarge.items;


        $scope.getWidth = function(page)
        {   
            if(page == 'records')
            {
              if(isTablet)
              {
                  width = ((_._cH) * 0.5) * Math.ceil($scope.moduleItem.moduleRecords.length / 2);
                  return width + 'px';    
              }else
              {
                  return '100%';
              }
            }else if(page == 'categories')
            {
              if(isTablet)
              {
                  width = ((_._cH) * 0.5) * Math.ceil($scope.showCat.length / 2);
                  return width + 'px';    
              }else
              {
                  return '100%';
              }
            }
            
        };

        // $scope.getHeight = function(page)
        // {   

        //       if(isTablet)
        //       {
        //           return ((_._cH) * 0.49) + 'px';
        //       }else
        //       {
        //           return '1:1';
        //       }
            
        // };

        $scope.moduleClick = function(item)
        {
          
            _moduleViewerLarge.currStep = 'header';
            _moduleViewerLarge.showStep();
            _moduleListLarge.updateBreadcrumb({moduleId:_moduleViewerLarge.id , recordId : item.index ,entityId:_moduleListLarge.entityId});

              //layout.sendMessage("categoryLargeList", { recordId : item.index ,entityId:_moduleListLarge.entityId});

              // xml = "<b>"+ "Header Fields" +"</b>";  

              // if(item.headerDone)
              //  {
              //   // layout.sendMessage("categoryLargeList", { index : item.index });
              //   layout.sendMessage("categoryLargeList", { recordId : item.index ,entityId:_moduleListLarge.entityId});
              //  }else
              //  {
              //   _modal.show(
              //       'warning',
              //       'title',
              //        xml,
              //        true,
              //       function()
              //       {
              //          item.headerDone = true;
              //          _modal.hide();
              //          // layout.sendMessage("categoryLargeList", { index : item.index });
              //          layout.sendMessage("categoryLargeList", { recordId : item.index ,entityId:_moduleListLarge.entityId});
              //       },
              //       function() {
              //          _modal.hide();

              //       }
              //     );

              //  }

            // debugger;

            // var moduleRecord = _moduleViewerLarge.model.moduleRecords[item.index];
            // var categories = [];
            // for(var i in moduleRecord.lines)
            // {
            //   line = moduleRecord.lines[i];
            //   for(var j in _moduleViewerLarge.model.tcCategories)
            //   {
            //     var category = _moduleViewerLarge.model.tcCategories[j];
            //     if(category.id == line.categoryId)
            //     {
            //       var paths = category.path.split(':');
            //       var currCat = null;
            //       for(var k in paths)
            //       {
            //         var path = paths[k]
            //         var found = false;
            //         for(var l in categories)
            //         {
            //           if(categories[l].name == path)
            //           {
            //             found = true;

            //             if( k+1 == paths.length)
            //             {
            //               categories[l].hasItems = true;
            //             }

            //             currCat = categories[l];
            //             break;
            //           }
            //         }
            //         if(found == false)
            //         {
            //           for(var l in _moduleViewerLarge.model.tcCategories)
            //           {
            //             var categoryAdd = _moduleViewerLarge.model.tcCategories[l];
            //             if(categoryAdd.name == path)
            //             {
            //               if(currCat == null)
            //               {
            //                 categoryAdd.parent = 0;
            //                 categoryAdd.hasSubCat = false;
            //               }else
            //               {
            //                 categoryAdd.parent = currCat.id;
            //                 currCat.hasSubCat = true;
            //               }
            //               if( k+1 == paths.length)
            //               {
            //                 categoryAdd.hasItems = true;
            //               }else
            //               {
            //                 categoryAdd.hasItems = false;
            //               }

            //               currCat = categoryAdd;
            //               categories.push(categoryAdd);

            //               break;
            //             }
            //           }
            //         }
            //       }
            //       break;
            //     }
            //   }
            // }
            // $scope.categories = categories;
            // $scope.parent = 0;
            // $scope.showCat = [];
            // for(var i in categories)
            // {
            //   var cat = categories[i];
            //   if(cat.parent == $scope.parent)
            //   {
            //     cat.background = _moduleViewerLarge.getColor($scope.showCat.length);
            //     $scope.showCat.push(cat);
            //   }
            // }
            // $scope.page = 'categories';
        };

        // $scope.catClick = function(item)
        // {
        //   if(item.hasSubCat)
        //   {
        //     $scope.parent = item.id;
        //     showCat = [];
        //     if(item.hasItems)
        //     {
        //       var cat = {
        //         name :'Show ' + item.name + ' items',
        //         hasSubCat:false,
        //         id:item.id
        //       }
        //       showCat.push(cat);
        //     }
        //     for(var i in $scope.categories)
        //     {
        //       var cat = $scope.categories[i];
        //       if(cat.parent == $scope.parent)
        //       {
        //         cat.background = _moduleViewerLarge.getColor(showCat.length);
        //         showCat.push(cat);
        //       }
        //     }
        //     $scope.showCat = showCat;
        //   }else
        //   {
        //     _cardEngine.flip("moduleViewerLarge","exampleHelp");
        //   }
          
        // };

    }
    ,
    recordClick:function(item)
    {
      
      var recordIndex = $(item).attr("recordIndex");
      _moduleViewerLarge.currStep ='header';
      _moduleViewerLarge.showStep();

      _moduleViewerLarge.currData = {
        record:_moduleViewerLarge.moduleItems[0].moduleRecords[recordIndex].name,
        categories:[],
        items:[],
        item:''
      }

// _moduleListLarge.updateBreadcrumb({moduleId:_moduleViewerLarge.id , recordId : item.index ,entityId:_moduleListLarge.entityId});
      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

    }
    ,
    filterFunction: function()
    {
      // debugger;
      $("#category_header").html("Category : " + _moduleViewerLarge.parent);
      $( ".cat_elem" ).each(function() {
        // _log.d('filterFunction ' + _category.parent + ' - ' + $(this).attr("parent_cat"));
        if(_moduleViewerLarge.parent == $(this).attr("parent_cat") )
        {
          // alert('hier2');
          $(this).show();
        }else
        {
          // alert('hier3');
          $(this).hide();
        }
      });

      _moduleViewerLarge.filterItems();
    },
    filterItems: function()
    {
      // debugger;
      $( ".item_elem" ).each(function() {
         _log.d('filterItems ' + _moduleViewerLarge.parentId + ' - ' + $(this).attr("cat_id"));
        if(_moduleViewerLarge.parentId == $(this).attr("cat_id") )
        {
          // alert('hier2');
          $(this).show();
        }else
        {
          // alert('hier3');
          $(this).hide();
        }
      });
    },
       upLevel: function()
    {
      if(_moduleViewerLarge.backtrack.length < 2 )
      {
        _moduleViewerLarge.backtrack = [];
        _moduleViewerLarge.backtrackId = [];
        _moduleViewerLarge.parent = '';
        _moduleViewerLarge.parentId = 0;
      }else
      {
        _moduleViewerLarge.backtrack.splice(_moduleViewerLarge.backtrack.length-1, 1);
        _moduleViewerLarge.backtrackId.splice(_moduleViewerLarge.backtrack.length-1, 1);
        _moduleViewerLarge.parent = _moduleViewerLarge.backtrack[_moduleViewerLarge.backtrack.length - 1];
        _moduleViewerLarge.parentId = _moduleViewerLarge.backtrackId[_moduleViewerLarge.backtrackId.length - 1];
      }
      _moduleViewerLarge.currData.categories = _moduleViewerLarge.backtrack;

      _moduleViewerLarge.currData.items = [];
      for(var i in _moduleViewerLarge.moduleItems[0].categories)
      {
        if(_moduleViewerLarge.moduleItems[0].categories[i].id == _moduleViewerLarge.backtrackId[_moduleViewerLarge.backtrackId.length -1])
        {
            _moduleViewerLarge.currData.items = _moduleViewerLarge.moduleItems[0].categories[i].items;
            break;
        }
      }


      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

      _moduleViewerLarge.filterFunction();
    },

    catClick: function(data)
    {

      _moduleViewerLarge.parentId = $(data).attr("cat_id");
      _moduleViewerLarge.parent = $(data).attr("name");
      _moduleViewerLarge.backtrack.push(_moduleViewerLarge.parent);
      _moduleViewerLarge.backtrackId.push(_moduleViewerLarge.parentId);
      // alert(_category.parent);
      _moduleViewerLarge.filterFunction();

      _moduleViewerLarge.currData.categories = _moduleViewerLarge.backtrack;
      _moduleViewerLarge.currData.items = [];
      for(var i in _moduleViewerLarge.moduleItems[0].categories)
      {
        if(_moduleViewerLarge.moduleItems[0].categories[i].id == _moduleViewerLarge.backtrackId[_moduleViewerLarge.backtrackId.length -1])
        {
            _moduleViewerLarge.currData.items = _moduleViewerLarge.moduleItems[0].categories[i].items;
            break;
        }
      }
      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

    },

    itemClick: function(data)
    {
      var itemId = $(data).attr("_id");
      var catId = parseInt($(data).attr("cat_id"));
      var itemName = $(data).attr("name");
      
      // $('#htmlLine').html(_category.model.htmlLine);
      _moduleViewerLarge.currStep = 'item';
      _moduleViewerLarge.showStep();
      _moduleViewerLarge.currData.item = itemName;
      // currData.items = [];
      // for(var i in _moduleViewerLarge.moduleItems[0].categories)
      // {
      //   if(_moduleViewerLarge.moduleItems[0].categories[i].id == catId)
      //   {
      //       currData.items = _moduleViewerLarge.moduleItems[0].categories[i].items;
      //       break;
      //   }
      // }
      
      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);
    },

    showStep: function()
    {
      // currStep
      if(_moduleViewerLarge.currStep == 'record')
      {
        $('#divRecords').show();
        $('#divItems').hide();
        $('#htmlLine').hide();

        $("#cat_header").hide();
        $("#cat_items").hide();
        $("#cat_footer").hide();

        $("#listPrev").hide();
        $("#listNext").hide();

      }else
      if(_moduleViewerLarge.currStep == 'item')
      {
        $('#divRecords').hide();
        $('#divItems').hide();
        $('#htmlLine').show();

        $("#cat_header").hide();
        $("#cat_items").hide();
        $("#cat_footer").hide();

        $("#listPrev").show();
        $("#listNext").hide();

      }else if(_moduleViewerLarge.currStep == 'header')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#cat_header").show();
        $("#cat_items").hide();
        $("#cat_footer").hide();

        $("#listPrev").show();
        $("#listNext").show();

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#cat_header").hide();
        $("#cat_items").show();
        $("#cat_footer").hide();

        $("#listPrev").show();
        $("#listNext").hide();

      }else if(_moduleViewerLarge.currStep == 'footer')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#cat_header").hide();
        $("#cat_items").hide();
        $("#cat_footer").show();

        $("#listPrev").show();
        $("#listNext").hide();

      }else if(_moduleViewerLarge.currStep == 'moduleRecord')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#cat_header").hide();
        $("#cat_items").hide();
        $("#cat_footer").hide();

        $("#listPrev").hide();
        $("#listNext").hide();
      }
    }
    ,
    nextStep: function()
    {
      if(_moduleViewerLarge.currStep == 'header')
      {
        _moduleViewerLarge.currStep = 'items'
      }else if(_moduleViewerLarge.currStep == 'items')
      {
        _moduleViewerLarge.currStep = 'footer'
      }
      _moduleViewerLarge.showStep();
    }
    ,
    prevStep: function()
    {
      if(_moduleViewerLarge.currStep == 'item')
      {
        _moduleViewerLarge.currStep = 'items'
        _moduleViewerLarge.currData.item = '';
        _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

      }else
      if(_moduleViewerLarge.currStep == 'footer')
      {
        _moduleViewerLarge.currStep = 'items'
      }else if(_moduleViewerLarge.currStep == 'items')
      {
        _moduleViewerLarge.currStep = 'header'
      }else if(_moduleViewerLarge.currStep == 'header')
      {
        _moduleViewerLarge.currStep = 'record';
        _moduleViewerLarge.currData = {
          entity:_moduleListLarge.entityId,
          module:_moduleViewerLarge.id,
          record:'',
          categories:[],
          items:[],
          item:''
        }
        _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

      }
      _moduleViewerLarge.showStep();
    },
    gotoRecords:function()
    {
        _moduleViewerLarge.currStep = 'record';
        _moduleViewerLarge.showStep();
        _moduleViewerLarge.currData = {
          entity:_moduleListLarge.entityId,
          module:_moduleViewerLarge.id,
          record:'',
          categories:[],
          items:[],
          item:''
        }
        _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);
        parent = '';
        parentId = 0;
        backtrack = [];
        backtrackId = [];

    }
    ,
    getColor:function(i){
      switch(i % 11) {
          case 0: return "white";        break;
          case 1: return "white";           break;
          case 2: return "white";         break;
          case 3: return "white";      break;
          case 4: return "white";          break;
          case 5: return "yellow";        break;
          case 6: return "pink";          break;
          case 7: return "darkBlue";      break;
          case 8: return "purple";        break;
          case 9: return "deepBlue";      break;
          case 10: return "lightPurple";  break;
        }
    }
    ,
    buildGridModel:function(tileTmpl){
      var it, results = [ ];
      for (var j=0; j<21; j++) {
        it = angular.extend({},tileTmpl);
        it.icon  = it.icon + (j+1);
        it.title = it.title + (j+1);
        it.span  = { row : 1, col : 1 };
        switch(j+1) {
          case 1:
            it.background = "white";
            // it.span.row = it.span.col = 1;
            break;
          case 2: it.background = "white";         break;
          case 3: it.background = "white";      break;
          case 4:
            it.background = "white";
            // it.span.col = 1;
            break;
          case 5:
            it.background = "white";
            // it.span.row = it.span.col = 1;
            break;
          case 6: it.background = "pink";          break;
          case 7: it.background = "darkBlue";      break;
          case 8: it.background = "purple";        break;
          case 9: it.background = "deepBlue";      break;
          case 10: it.background = "lightPurple";  break;
          case 11: it.background = "yellow";       break;
          case 12: it.background = "green";         break;
          case 13: it.background = "darkBlue";      break;
          case 14:
            it.background = "blue";
            // it.span.col = 1;
            break;
          case 15:
            it.background = "yellow";
            // it.span.row = it.span.col = 1;
            break;
          case 16: it.background = "pink";          break;
          case 17: it.background = "darkBlue";      break;
          case 18: it.background = "purple";        break;
          case 19: it.background = "deepBlue";      break;
          case 20: it.background = "lightPurple";  break;
          case 21: it.background = "yellow";       break;
        }
        results.push(it);
      }
      return results;
    }
};;;
_moduleViewerLarge = {

    model: null,
    currStep: 'record',
    items:[],
    moduleItems:[],
    parent:'',
    parentId:0,
    backtrack : [],
    backtrackId : [],
    currData : {},
    currModel:null,
    modelHeader:[],
    htmlLineTarget:null,
    htmlHeaderTarget:null,
    htmlFooterTarget:null,
    moduleRecords:[],
    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

        _moduleViewerLarge.currModel = {
          moduleRecords:[],
          modelLine:[],
          categories:[],
        };

         _model.getAll("moduleItems",function(d){

            _moduleViewerLarge.moduleItems=d;
            _moduleViewerLarge.currModel = _moduleViewerLarge.moduleItems[1];
            
            _.htmlHeaderTarget = $('#moduleHeader');
            _.htmlLineTarget = $('#htmlLine');
            _.htmlFooterTarget = $('#moduleFooter');

            _model.getAll("moduleRecords", function (moduleRecords) 
            {
              _moduleViewerLarge.moduleRecords = moduleRecords;
              layout.attach('#moduleViewerLargeFront');
            });

            // _model.getAll("Modules", function (moduleData) 
            // {

            //     if (moduleData.length > 0) {
            //     try
            //     {
            //       _moduleViewerLarge.model = moduleData;  
            //       _moduleViewerLarge.currModel.moduleRecords = _moduleViewerLarge.model[0].data.moduleRecords;                

            //     }catch(err)
            //     {
            //       _log.d(JSON.stringify(moduleData));
            //       alert(err);
            //     }
                  
            //   } else {
            //       alert('No Module Data');
            //       _moduleViewerLarge.model = [];
            //   }
            //   layout.attach('#moduleViewerLargeFront');
            // });
            
          });
    },

    onMessage : function(data) {

        debugger;
        for(var i in _moduleViewerLarge.moduleItems)
        {
          if(_moduleViewerLarge.moduleItems[i].moduleId == data.id)
          {
            _moduleViewerLarge.currModel = _moduleViewerLarge.moduleItems[i];
            _moduleViewerLarge.currModel.moduleRecords = [];
            
            for(var j in _moduleViewerLarge.moduleRecords)
            {
              var record = _moduleViewerLarge.moduleRecords[j];
              if(record.moduleId == data.id)
              {
                _moduleViewerLarge.currModel.moduleRecords.push(record);
              }
            }
            
            _moduleViewerLarge.htmlLineTarget.html(_moduleViewerLarge.moduleItems[i].htmlLine);
            _moduleViewerLarge.htmlHeaderTarget.html(_moduleViewerLarge.moduleItems[i].htmlHeader);
            _moduleViewerLarge.htmlFooterTarget.html(_moduleViewerLarge.moduleItems[i].htmlFooter);

            if(_moduleViewerLarge.currModel.modelFooter.length == 0)
              _moduleViewerLarge.currModel.hasFooter = false;
            else
              _moduleViewerLarge.currModel.hasFooter = true;

            if(_moduleViewerLarge.currModel.modelHeader.length == 0)
              _moduleViewerLarge.currModel.hasHeader = false;
            else
              _moduleViewerLarge.currModel.hasHeader = true;

            if(_moduleViewerLarge.currModel.modelLine.length == 0)
              _moduleViewerLarge.currModel.hasLine = false;
            else
              _moduleViewerLarge.currModel.hasLine = true;

            break;
          }
        };

        _moduleViewerLarge.id = data.id;

      try{
          $('#divRecords').show();
          $('#divItems').hide();
          $('#htmlLine').hide();
        }catch(err)
        {
          alert('1 ' + err);
        }

        // layout.attach('#moduleViewerLargeFront');

        angular.element(_moduleViewerLarge.htmlHeaderTarget).injector().invoke(function($compile) {
          var scope = angular.element(_moduleViewerLarge.htmlHeaderTarget).scope();
          $compile(_moduleViewerLarge.htmlHeaderTarget)(scope);
        });
        angular.element(_moduleViewerLarge.htmlLineTarget).injector().invoke(function($compile) {
          var scope = angular.element(_moduleViewerLarge.htmlLineTarget).scope();
          $compile(_moduleViewerLarge.htmlLineTarget)(scope);
        });
        angular.element(_moduleViewerLarge.htmlFooterTarget).injector().invoke(function($compile) {
          var scope = angular.element(_moduleViewerLarge.htmlFooterTarget).scope();
          $compile(_moduleViewerLarge.htmlFooterTarget)(scope);
        });

    },
    Ctrl : function($scope) {

        $scope.page = 'records';
        $scope.Math = window.Math;

        _moduleViewerLarge.backtrack = [];
        _moduleViewerLarge.backtrackId = [];
        _moduleViewerLarge.parent = '';
        _moduleViewerLarge.parentId = 0;


        if(isTablet)
        {
            setTimeout(function () {
                // _home.scroll = new iScroll($('#scroll2')[0], {
                //         scrollX: false, 
                //         scrollY: true,
                //         scrollbars: false,
                //         hScrollbar:false,
                //         vScrollbar:false,
                //         hideScrollbar: true,
                //     });

                try
                {
                  $('#divRecords').hide();
                  $('#divItems').hide();
                  $('#htmlLine').hide();  
                }catch(err)
                {
                  _log.e(err);
                }
                
                _moduleViewerLarge.filterFunction();
            }, 500);
        };

        $scope.moduleItem = _moduleViewerLarge.currModel;

        if(_moduleViewerLarge.currModel.modelLine.length > 0)  
        {
          _moduleViewerLarge.records = _moduleViewerLarge.currModel.modelLine[0]; 
          _moduleViewerLarge.modelHeader = _moduleViewerLarge.currModel.modelHeader;  
          $scope.lineItems = _moduleViewerLarge.records;
          $scope.headerItems = _moduleViewerLarge.modelHeader;
        }
          
        _moduleViewerLarge.items = [];

        $scope.getWidth = function(page)
        {   
            return ((_._cH) * 0.5)  + 'px';
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

    }
    ,
    recordClick:function(item)
    {
      
      var recordIndex = $(item).attr("recordIndex");

      if(_moduleViewerLarge.currModel.hasHeader)
      {
        _moduleViewerLarge.currStep = 'header';
      }else if(_moduleViewerLarge.currModel.hasLine)
      {
        _moduleViewerLarge.currStep ='items';
      }else if(_moduleViewerLarge.currModel.hasFooter)
      {
        _moduleViewerLarge.currStep ='footer';
      }else
      {
        alert('No Data for record.');
      }
        
      _moduleViewerLarge.showStep();


      _moduleViewerLarge.currData = {
        record:_moduleViewerLarge.currModel.moduleRecords[recordIndex].name,
        categories:[],
        items:[],
        item:''
      }
      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

    }
    ,
    filterFunction: function()
    {
      // debugger;
      $("#category_header h3").html("Category : " + _moduleViewerLarge.parent);
      $( ".cat_elem" ).each(function() {
        // _log.d('filterFunction ' + _category.parent + ' - ' + $(this).attr("parent_cat"));
        if(_moduleViewerLarge.parent == $(this).attr("parent_cat") )
        {
          $(this).show();
        }else
        {
          $(this).hide();
        }
      });

      _moduleViewerLarge.filterItems();
    }
    ,
    filterItems: function()
    {
      $( ".item_elem" ).hide();
      $( ".cat_" +  _moduleViewerLarge.parentId).show();
    }
    ,
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
      for(var i in _moduleViewerLarge.currModel.items)
      {
        if(_moduleViewerLarge.currModel.items[i].catId == _moduleViewerLarge.parentId)
        {
            _moduleViewerLarge.currData.items.push(_moduleViewerLarge.currModel.items[i]);
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
      for(var i in _moduleViewerLarge.currModel.items)
      {
        if(_moduleViewerLarge.currModel.items[i].catId == _moduleViewerLarge.parentId)
        {
            _moduleViewerLarge.currData.items.push(_moduleViewerLarge.currModel.items[i]);
        }
      }
      _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

    },

    itemClick: function(data)
    {
      var itemName = $(data).attr("name");
      var index = $(data).attr("index");

      _moduleViewerLarge.currStep = 'item';
      _moduleViewerLarge.showStep();
      
      _moduleViewerLarge.currData.item = itemName;

      e = document.getElementById('moduleViewerLargeFront__FACE');
      scope = angular.element(e).scope();
      scope.$apply(function() 
      { 
        _moduleViewerLarge.records = _moduleViewerLarge.currModel.modelLine[index];
        scope.lineItems = _moduleViewerLarge.records;
      }); 
      
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

        $("#moduleHeader").hide();
        $("#moduleLine").hide();
        $("#moduleFooter").hide();

        $("#cbl").hide();
        $("#cbr").show();
        $("#cbr").html('New');

      }else
      if(_moduleViewerLarge.currStep == 'item')
      {
        $('#divRecords').hide();
        $('#divItems').hide();
        $('#htmlLine').show();

        $("#moduleHeader").hide();
        $("#moduleLine").hide();
        $("#moduleFooter").hide();

        $("#cbl").show();
        $("#cbl").html('Back');
        $("#cbr").hide();

      }else if(_moduleViewerLarge.currStep == 'header')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#moduleHeader").show();
        $("#moduleLine").hide();
        $("#moduleFooter").hide();

        $("#cbl").show();
        $("#cbl").html('Prev');
        $("#cbr").show();
        $("#cbr").html('Next');

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#moduleHeader").hide();
        $("#moduleLine").show();
        $("#moduleFooter").hide();

        $("#cbl").show();
        $("#cbl").html('Prev');
        $("#cbr").show();
        $("#cbr").html('Next');

      }else if(_moduleViewerLarge.currStep == 'footer')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#moduleHeader").hide();
        $("#moduleLine").hide();
        $("#moduleFooter").show();

        $("#cbl").show();
        $("#cbl").html('Prev');
        $("#cbr").show();
        $("#cbr").html('Upload');

      }else if(_moduleViewerLarge.currStep == 'moduleRecord')
      {
        $('#divRecords').hide();
        $('#divItems').show();
        $('#htmlLine').hide();

        $("#moduleHeader").hide();
        $("#moduleLine").hide();
        $("#moduleFooter").hide();

        $("#cbl").hide();
        $("#cbr").hide();
      }

      e = document.getElementById('moduleViewerLargeFront__FACE');
      scope = angular.element(e).scope();
      scope.$apply(function() 
      { 
        scope.page = _moduleViewerLarge.currStep;
      }); 


    }
    ,
    upload: function()
    {
        var data = _moduleContainer.generateUploadObject(_moduleViewerLarge.currModel,_moduleListLarge.entityId,_entityList.model[0].userId);

          jobData = { action:'uploadRecord', data: data};

          JOB = {
            jobName: 'Job Name',
            jobDesc: 'Job Description',
            data: jobData,
          };
          jobid = jobQueue.add(JOB);
    }
    ,
    cbrClick: function()
    {
      if(_moduleViewerLarge.currStep == 'header')
      {
        if(_moduleViewerLarge.currModel.hasLine)
          _moduleViewerLarge.currStep = 'items'
        else if(_moduleViewerLarge.currModel.hasFooter)
          _moduleViewerLarge.currStep = 'footer'
        else
          _moduleViewerLarge.upload();

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        if(_moduleViewerLarge.currModel.hasFooter)
        {
          _moduleViewerLarge.currStep = 'footer'
        }else
        {
          
          _moduleViewerLarge.upload();
        }
        // else
          // alert('TODO: Nothing More');
      }else if(_moduleViewerLarge.currStep == 'record')
      {
          alert('TODO: Create New Record');
      }
      _moduleViewerLarge.showStep();
    }
    ,
    cblClick: function()
    {
      if(_moduleViewerLarge.currStep == 'item')
      {

        _moduleViewerLarge.currStep = 'items'
        _moduleViewerLarge.currData.item = '';
        _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);

      }else
      if(_moduleViewerLarge.currStep == 'footer')
      {

        if(_moduleViewerLarge.currModel.hasLine)
          _moduleViewerLarge.currStep = 'items'
        else if(_moduleViewerLarge.currModel.hasHeader)
          _moduleViewerLarge.currStep = 'header'
        else
          _moduleViewerLarge.currStep = 'record'

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        if(_moduleViewerLarge.currModel.hasHeader)
          _moduleViewerLarge.currStep = 'header'
        else
          _moduleViewerLarge.currStep = 'record'

      }else if(_moduleViewerLarge.currStep == 'header')
      {
        _moduleViewerLarge.currStep = 'record';
      }
      if(_moduleViewerLarge.currStep == 'record')
      {
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
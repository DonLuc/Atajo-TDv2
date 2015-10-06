_moduleViewerLarge = {

    model: null,
    currStep: 'none',
    items:[],
    moduleItems:[],
    parent:'',
    parentId:0,
    backtrack : [],
    backtrackId : [],
    currData : {},
    currModel:null,
    currRecord:null,
    modelHeader:[],
    htmlLineTarget:null,
    htmlHeaderTarget:null,
    htmlFooterTarget:null,
    moduleRecords:[],
    newModuleRecords:[],
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

              // for(var i in _moduleViewerLarge.moduleItems)
              // {
              //     var module = _moduleViewerLarge.moduleItems[i];
              //     module.moduleRecords = [];
              //     for(var j in _moduleViewerLarge.moduleRecords)
              //     {
              //       var record = _moduleViewerLarge.moduleRecords[j];
              //       if(record.moduleId == module.moduleId)
              //       {
              //         module.moduleRecords.push(record);
              //       }
              //     }
              // }
              for(var i in _moduleViewerLarge.moduleRecords)
              {
                var record = _moduleViewerLarge.moduleRecords[i];

                if(record.modelFooter.length == 0)
                  record.hasFooter = false;
                else
                  record.hasFooter = true;

                if(record.modelHeader.length == 0)
                  record.hasHeader = false;
                else
                  record.hasHeader = true;

                if(record.modelLine.length == 0)
                  record.hasLine = false;
                else
                  record.hasLine = true;
              }

              for(var i in _moduleViewerLarge.moduleItems)
              {
                var record = _moduleViewerLarge.moduleItems[i];

                if(record.modelFooter.length == 0)
                  record.hasFooter = false;
                else
                  record.hasFooter = true;

                if(record.modelHeader.length == 0)
                  record.hasHeader = false;
                else
                  record.hasHeader = true;

                if(record.modelLine.length == 0)
                  record.hasLine = false;
                else
                  record.hasLine = true;
              }


              layout.attach('#moduleViewerLargeFront');
              $("#cbl").hide();
              $("#cbr").hide();
              
            });

          });
    },

    onMessage : function(data) {

        if(data != null)
        {
          for(var i in _moduleViewerLarge.moduleItems)
          {
            if(_moduleViewerLarge.moduleItems[i].moduleId == data.id)
            {
              _moduleViewerLarge.currModel = _moduleViewerLarge.moduleItems[i];
              break;
            }
          };

          _moduleViewerLarge.id = data.id;

          $('#divRecords').show();
          $('#divItems').hide();
          $('#htmlLine').hide();

          _moduleViewerLarge.gotoRecords();
        }else
        {
          _moduleViewerLarge.currStep = 'none';
          _moduleViewerLarge.showStep();
        }
        

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

                  $('#divRecords').hide();
                  $('#divItems').hide();
                  $('#htmlLine').hide();  
                
                _moduleViewerLarge.filterFunction();
            }, 500);
        };

        $scope.moduleRecords = _moduleViewerLarge.moduleRecords;
    }
    ,
    recordClick:function(item)
    {
      
      var recordIndex = $(item).attr("recordIndex");
      _moduleViewerLarge.currRecord = _moduleViewerLarge.moduleRecords[recordIndex];
      _moduleViewerLarge.viewRecord();

    }
    ,
    newRecordClick:function(item)
    {
      
      var recordIndex = $(item).attr("recordIndex");
      _moduleViewerLarge.currRecord = _moduleViewerLarge.newModuleRecords[recordIndex];
      _moduleViewerLarge.viewRecord();

    }
    ,
    viewRecord: function()
    {
        if(_moduleViewerLarge.currRecord.hasHeader)
        {
          _moduleViewerLarge.currStep = 'header';
        }else if(_moduleViewerLarge.currRecord.hasLine)
        {
          _moduleViewerLarge.currStep ='items';
        }else if(_moduleViewerLarge.currRecord.hasFooter)
        {
          _moduleViewerLarge.currStep ='footer';
        }else
        {
          alert('No Data for record.');
        }

        _moduleViewerLarge.backtrack = [];
        _moduleViewerLarge.backtrackId = [];

        _moduleViewerLarge.currData = {
          record:_moduleViewerLarge.currRecord.moduleRecord.name,
          categories:[],
          items:[],
          item:''
        }

        e = document.getElementById('moduleViewerLargeFront__FACE');
        scope = angular.element(e).scope();
        scope.$apply(function() 
        { 
          scope.currRecord =  _moduleViewerLarge.currRecord;
          _moduleViewerLarge.parent = '';
          _moduleViewerLarge.parentId = 0;
          setTimeout(function () {
                  _moduleViewerLarge.filterFunction();
                  _moduleViewerLarge.showStep();
              }, 100);
        }); 

        _moduleViewerLarge.htmlLineTarget.html(_moduleViewerLarge.currRecord.htmlLine);
        _moduleViewerLarge.htmlHeaderTarget.html(_moduleViewerLarge.currRecord.htmlHeader);
        _moduleViewerLarge.htmlFooterTarget.html(_moduleViewerLarge.currRecord.htmlFooter);

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

        _moduleListLarge.updateBreadcrumb(_moduleViewerLarge.currData);
    }
    ,
    filterFunction: function()
    {
      // debugger;
      $("#category_header h3").html("Category : " + _moduleViewerLarge.parent);
      $( ".cat_elem" ).each(function() {
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
        _moduleViewerLarge.backtrackId.splice(_moduleViewerLarge.backtrackId.length-1, 1);
        _moduleViewerLarge.parent = _moduleViewerLarge.backtrack[_moduleViewerLarge.backtrack.length - 1];
        _moduleViewerLarge.parentId = _moduleViewerLarge.backtrackId[_moduleViewerLarge.backtrackId.length - 1];
      }
      _moduleViewerLarge.currData.categories = _moduleViewerLarge.backtrack;

      _moduleViewerLarge.currData.items = [];

      for(var i in _moduleViewerLarge.currRecord.items)
      {
        if(_moduleViewerLarge.currRecord.items[i].categoryId == _moduleViewerLarge.parentId)
        {
            _moduleViewerLarge.currData.items.push(_moduleViewerLarge.currRecord.items[i]);
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
      _moduleViewerLarge.filterFunction();

      _moduleViewerLarge.currData.categories = _moduleViewerLarge.backtrack;
      _moduleViewerLarge.currData.items = [];

      for(var i in _moduleViewerLarge.currRecord.items)
      {
        if(_moduleViewerLarge.currRecord.items[i].categoryId == _moduleViewerLarge.parentId)
        {
            _moduleViewerLarge.currData.items.push(_moduleViewerLarge.currRecord.items[i]);
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
        _moduleViewerLarge.records = _moduleViewerLarge.currRecord.modelLine[index];
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
        $("#cbr").html('&#xf055; New');

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
        if(_moduleViewerLarge.currRecord.hasLine)
        {
          $("#cbr").html('Next');
        }else if(_moduleViewerLarge.currRecord.hasFooter)
        {
          $("#cbr").html('Next');
        }else
        {
          $("#cbr").html('Upload');
        }

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
        if(_moduleViewerLarge.currRecord.hasFooter)
        {
          $("#cbr").html('Next');
        }else
        {
          $("#cbr").html('Upload');
        }
        

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
      }else if(_moduleViewerLarge.currStep == 'none')
      {
        $('#divRecords').hide();
        $('#divItems').hide();
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
        var data = _moduleContainer.generateUploadObject(_moduleViewerLarge.currRecord,_moduleListLarge.entityId,_entityList.model[0].userId);

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
      if(_moduleViewerLarge.currRecord == 'header')
      {
        if(_moduleViewerLarge.currRecord.hasLine)
          _moduleViewerLarge.currStep = 'items'
        else if(_moduleViewerLarge.currRecord.hasFooter)
          _moduleViewerLarge.currStep = 'footer'
        else
          _moduleViewerLarge.upload();

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        if(_moduleViewerLarge.currRecord.hasFooter)
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
        //New Record

        var newRecord = JSON.parse(JSON.stringify(_moduleViewerLarge.currModel));
        for(var i in newRecord.items)
        {
          var item = newRecord.items[i];
          item.categoryId = item.catId;
          item.itemName = item.name;
        }
        
        newRecord.moduleRecord = {};
        newRecord.moduleRecord.name = _moduleViewerLarge.currModel.recordNameSingular + ' ' + (_moduleViewerLarge.newModuleRecords.length + 1);
        _moduleViewerLarge.newModuleRecords.push(newRecord);
        _moduleViewerLarge.currRecord = newRecord;
        _moduleViewerLarge.viewRecord();

         e = document.getElementById('moduleViewerLargeFront__FACE');
        scope = angular.element(e).scope();
        scope.$apply(function() 
        { 
          scope.newModuleRecords =  _moduleViewerLarge.newModuleRecords;
        }); 


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

        if(_moduleViewerLarge.currRecord.hasLine)
          _moduleViewerLarge.currStep = 'items'
        else if(_moduleViewerLarge.currRecord.hasHeader)
          _moduleViewerLarge.currStep = 'header';
        else
        {
           _moduleViewerLarge.currStep = 'record';
           $( ".record_elem").hide();
           $( ".record_" + _moduleViewerLarge.currModel.moduleId).show();
         }

      }else if(_moduleViewerLarge.currStep == 'items')
      {
        if(_moduleViewerLarge.currRecord.hasHeader)
          _moduleViewerLarge.currStep = 'header'
        else
        {
          _moduleViewerLarge.currStep = 'record';
          $( ".record_elem").hide();
          $( ".record_" + _moduleViewerLarge.currModel.moduleId).show();
        }

      }else if(_moduleViewerLarge.currStep == 'header')
      {
        _moduleViewerLarge.currStep = 'record';
        $( ".record_elem").hide();
        $( ".record_" + _moduleViewerLarge.currModel.moduleId).show();
      }
      if(_moduleViewerLarge.currStep == 'none')
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

        $( ".record_elem").hide();
        $( ".record_" + _moduleViewerLarge.currModel.moduleId).show();

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
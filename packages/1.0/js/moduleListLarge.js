_moduleListLarge = {

    model: null,
    entityId : null,
    moduleId:null,
    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;


    },

    gotoModules: function()
    {
        _cardEngine.flip("moduleListLarge","moduleListLargeFront");
        layout.sendMessage("moduleViewerLarge", null);
    }
    ,
    onMessage : function(data) {

        _moduleListLarge.entityId = data.entityId;
        _model.get("Modules", { "entityId" : _moduleListLarge.entityId }, function (moduleData) {
            if (moduleData) {
                _moduleListLarge.model = moduleData[0].data.modules;
            } else {
                _moduleListLarge.model = [];
            }
               _model.getAll("callCycles", function (entities) {
                  if (entities) {
                      _moduleListLarge.callCycles = entities;
                  } else {
                      _moduleListLarge.callCycles = [];
                  }
                  layout.attach('#moduleListLargeFront');
                  layout.attach('#breadcrumbs');
              });
        });


    },
    breadcrumbsCtrl: function($scope){
        $scope.entity = _moduleListLarge.entityId;
        for(var i in _moduleListLarge.callCycles)
        {
            if(_moduleListLarge.callCycles[i].entityId == _moduleListLarge.entityId)
            {
                $scope.entity = _moduleListLarge.callCycles[i].entityName;
                break;
            }
        }

        $scope.module = _moduleListLarge.moduleId;
        for(var i in _moduleListLarge.model)
        {
            if(_moduleListLarge.model[i].id ==  _moduleListLarge.moduleId)
            {
                $scope.module = _moduleListLarge.model[i].name;
                break;
            }
        }

        $scope.record = '';
        $scope.categories = [];
        $scope.item = '';
    }
    ,
    moduleCtrl: function($scope) {
        $scope.modules    = _moduleListLarge.model;
    },
    loadModuleView : function(data) {

        _moduleListLarge.moduleId = $(data).attr("module_id");
        _cardEngine.flip("moduleListLarge","breadcrumbs");
        layout.sendMessage("moduleViewerLarge", { id : $(data).attr("module_id") });
    }
    ,
    updateBreadcrumb:function(data)
    {
        e = document.getElementById('breadcrumbs__FACE');
        scope = angular.element(e).scope();
        scope.$apply(function() 
        {  
            scope.record = data.record;
            scope.categories = data.categories;


            scope.items = data.items;
            for(var i in scope.items)
            {
                if(scope.items[i].itemName == data.item)
                {
                    scope.items[i].selected = true;
                }else
                {
                    scope.items[i].selected = false;
                }
            }
            
        }); 
    }
};;;
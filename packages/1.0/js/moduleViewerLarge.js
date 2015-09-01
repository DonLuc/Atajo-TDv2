_moduleViewerLarge = {

    model: null,
    itemsModel : "Nothing to Display",

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;

    },

    onMessage : function(data) {
        _moduleViewerLarge.id = data.module_id;
        layout.attach('#moduleViewerLargeFront');
    },
    Ctrl : function($scope) {
        $scope.itemsHTML = _moduleViewerLarge.itemsModel;
    }
};;;
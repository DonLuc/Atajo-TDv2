_entityList = {

    model: null,

    onExit : function() { var _ = this;

    },

    onLoaded: function () { var _ = this;
        _model.getAll("callCycles", function (entities) {
            if (entities) {
                _entityList.model = entities;
            } else {
                _entityList.model = [];
            }
            layout.attach('#entityFront');
        });

        setTimeout(function() {
            var cnt = 0;

            $('#entityFront__FACE').find('.tabSetTab').each(function() {
                if( cnt == 0) {

                    _log.d("TRIGGERING "+$(this).html());

                    _cardEngine.switchTab(this, 'entityList', 'entityFront__FACE', false);
                    layout.attach("#entityFront");

                }
                cnt++;

            });
        }, 200);
    },

    onMessage : function() {

    },

    entityCtrl: function($scope) {
        $scope.entities    = _entityList.model;
    },
    loadModule : function (data) {
        if (isTablet) {
            layout.sendMessage("moduleListLarge", { entityId : $(data).attr("entityId") });
        } else {
            layout.sendMessage("moduleListSmall", { entityId : $(data).attr("entityId") });
        }
    }
};;;
_accounts = {

    model: null,


    onExit : function() { var _ = this;




    },


    onLoaded: function () { var _ = this;


        /*
        _model.getAll("accounts", function(results) {

            _log.d("getAll on accounts: " + JSON.stringify(results));

        })
        */


        //"ShippingState":"WC"


        //_model.get("accounts", { "CustomerId__c" : "151960"}, function(results) {
        _model.get("accounts", {"ShippingState":"WC", "CustomerId__c" : "159040"}, function(results) {

            _log.d("Results length: " + results.length);
            _log.d("get query on accounts: " + JSON.stringify(results));

        })


        _model.getKey("accounts", "0011100000H8QwSAAV", function(result) {

            _log.d("getKey on accounts: " + JSON.stringify(result));

            result.Name = "tootsie";

            _log.d("We are going to try and save some data");

            _model.set("accounts", result, function(obj) {

                _log.d("save with name: " + obj.Name);

            });

        });



        /*
        _model.del("accounts", "0011100000H8QwSAAV", function() {

            _log.d("delete on accounts");

        });
        */

    },


    onMessage : function() {



    }

};;;

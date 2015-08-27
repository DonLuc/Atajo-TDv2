_sfHandler = {

    query : function(model, query, cb) {


        _sf.query(query,

            function(response) {

                _log.d(model + "items: " + response.totalSize);
                obj.RESPONSE = response.records;
                cb(obj);

            },

            function(jqXHR, textStatus, errorThrown) {

                _log.e("Error getting: " + model);
                _log.d("textStatus: " + textStatus);
                _log.d("errorThrown: " + errorThrown);
                obj.RESPONSE = false;
                cb(obj);

            }


        );

    },


    openSalesforce : function() {

      var currentCredentials = JSON.parse(window.localStorage.getItem('credentials'));
      var sessionId = currentCredentials.sessionId;

      //https://eu2.salesforce.com/secur/frontdoor.jsp
      var instanceUrl = encodeURI(currentCredentials.instanceUrl);

      var url = instanceUrl + '/secur/frontdoor.jsp?sid=' + sessionId;

      var url_args = "location=yes,clearcache=yes,clearsessioncache=yes";
      var target = "_blank";
      _log.d('openSalesforce with ' + url + " args : " + url_args);
      if (client.connectionState === 0) {
        var xml = "Your device must be online to open Salesforce.com";
        $(elm).html(_customer.customerDetailsPlaceholder);
        _modal.show("warning", "NOT ONLINE", xml, false, function() {
          _modal.hide();
        });
      } else {
        _loginStrategies.SALESFORCE.refreshToken(function(data) {
          var token = data.access_token;
          var ref = window.open(url, target, url_args);
          ref.addEventListener("exit", function() {

          });
          /*ref.addEventListener("loaderror", function() {
            var xml = "There was an error fetching the page from Salesforce";
            ref.close();
            _modal.show("warning", "ERROR LOADING SALESFORCE", xml, false, function() {
              _modal.hide();
              ref.close();
            });
          }); */
        }, function(data) {

          _log.d("ERROR REFRESHING TOKEN : " + data);
          var xml = "There was an error fetching refreshing your access token";
          ref.close();
          _modal.show("warning", "ERROR LOADING SALESFORCE", xml, false, function() {
            _modal.hide();
            ref.close();
          });

        });

      }


    },




}
;;

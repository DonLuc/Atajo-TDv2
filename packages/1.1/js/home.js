_home = {

    model: null,
    calOptions : {},


    onExit : function() {

    },


    onLoaded: function () {


        layout.attach("#homeFront", false);
        $("#footerContainer").off("touchstart");
        $("#footerContainer").on("touchstart", false);
        /*
        _calendar.getOptions(function(options) {

            _home.calOptions = options;

            layout.attach("#homeFront", false);

        });
        */

    },


    Ctrl : function($scope) {




    },


    onMessage : function() {

    },


    test : function() {

      var modal = atajo.modal;
/*
      var init =  {
                     icon 	: 'fa-warning',  	// icon which will appear top left  - default : fa-warning
                     title 	: 'example',     	// title which will appear top right - default : notice

                     canCancel : 'true', 		// show cancel button - default: false
                     onOk      	: function(data) { _log.d("GOT SIG "+data); },	// callback function when OK button tapped
                     onCancel   : function() { alert('cancel'); },

                     content : 'Signature Of : Joe Blogs'

                  };

      modal.signature(init);
*/

var init =  {
               icon 	: 'fa-warning',  	// icon which will appear top left  - default : fa-warning
               title 	: 'example',     	// title which will appear top right - default : notice

               canCancel : 'true', 		// show cancel button - default: false
               onOk      	: function() { alert('ok'); },	// callback function when OK button tapped
               onCancel   : function() { alert('cancel'); },

               content : 'homeFront'

            };

modal.bind(init);


    }

};
;;

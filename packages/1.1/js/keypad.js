_keypad = {


    visible : false,
    currX   : 100,
    currY   : 100,

    currInputElm : null,
    nextInputElm : null,

    currDX : 0,
    currDY : 0,

    canMove : false,

    currFace: "",

    total : 0,

    delayedproccessing: null,
    inputs: null,

    show : function(e) {

        _keypad.hide();

        if(typeof e.target == 'undefined')
        {
            _elm = e;
        }
        else
        {
            _elm = $(e.target);
        }


        //return if disabled.
        //if(_elm.attr('inactive') == 'true') {  return; }



        //set the input as current...
        //_elm.closest('tr').find('td').each(function() { $(this).css({ background: 'rgba(255,60,60,0.6)'});  })

        _elm.css({background: 'rgba(255,60,60,0.6)'});

        //show the keypad...
        xml = $('#buffKeypad').html();

        //add to doc.
        $(xml).attr('id', 'currKeypad')
            .css({opacity:1,
                zIndex:1000000,
                position: 'absolute',
                top:_keypad.currY - _keypad.currDY,
                left:_keypad.currX - _keypad.currDX
            })
            .appendTo('body');


        //move button
        $('#currKeypad').on('touchstart', function(e) {

            setTimeout(function() {

                _keypad.canMove = true;

            }, 200);



            var touch = e.originalEvent.touches[0];
            pos = $('#currKeypad').position();
            _keypad.currDX =  ( touch.pageX - pos.left );
            _keypad.currDY =  ( touch.pageY - pos.top );

            //_log.d(pos.left+ '  '+_keypad.currDX + ' : '+pos.top+"  "+_keypad.currDY );

            $('body').on('touchmove', function(e) {  if(!_keypad.canMove) { return; }

                var touch = e.originalEvent.touches[0];
                _keypad.isMoving = true;
                // _log.d('cc -> '+touch.pageX + " - " + touch.pageY);

                $('#currKeypad').css({top:touch.pageY - _keypad.currDY,left:touch.pageX - _keypad.currDX});
                _keypad.currX = touch.pageX - _keypad.currDX;
                _keypad.currY = touch.pageY - _keypad.currDY;


            }).on('touchend', function() {
                _keypad.isMoving = false;
                $('body').off('touchmove').off('touchend');

                _keypad.canMove = false;

                // _keypad.currDX =  0;
                // _keypad.currDY =  0;

                return false;



            })

        });

        if(_elm.attr('isSuggested')) {

            _elm.attr('isSuggested', 'false');
            _elm.trigger('change');
            $('#currKeypad').find('.keypadScreen').val('');

        }




        _keypad.currInputElm = _elm;
        //SHAHID: DO THIS ON REBUILD AS REFERENCES CHANGE!
        //var inputs = $("#contentContainerContent .tabSetContentContainer > div.selected input.activeKey");



        $('#currKeypad').find('td').each(function(){

            td = $(this);

            td.on('touchstart', function(e) { e.preventDefault(); if(_keypad.isMoving) { return; }



                currVal = $(e.target).html();
                kScreen = $('#currKeypad').find('.keypadScreen');
                screenVal =  ( kScreen.val()  == '' ) ? '0' : kScreen.val();

                if(currVal == "CLOSE")
                {
                    _elm.trigger('change');
                    kScreen.val('0');
                    _keypad.hide();
                    if(_elm.hasClass('strategicQuantity')) {
                        _elm.css("background", "poop");
                    }


                }
                else if(currVal == "=") {  total = ( parseInt(screenVal) + ( _elm.val() == '' ? 0 : parseInt(_elm.val()) ) ); _elm.val(total); _elm.attr('value', total); kScreen.val('0'); _elm.trigger('change');   }
                else if(currVal == "CLEAR") {  kScreen.val('0');  }
                else if(currVal == "RESET") {  _elm.val('0'); _elm.attr('value', '0'); _elm.trigger('change'); total = 0;   }
                else if(currVal == "ENTER")
                {

                    //add the figure.
                  //  _log.d("SCREENVAL IS >"+screenVal+"<");
                    //total = ( parseInt(screenVal) + ( _elm.val() == '' ? 0 : parseInt(_elm.val()) ) );
                    if(kScreen.val() === '')
                    {
                        _log.d("NO VALUE. DO NOTHING");
                    }
                    else
                    {

                    total = parseInt(screenVal);
                    if((screenVal !== 0) && (total !== 0))
                    {
                        total = parseInt(screenVal);  // Only update the current... dont add.
                        _elm.val(total);
                        _elm.attr('value', total);
                        kScreen.val('0');
                        _elm.trigger('change');
                    } else if ((screenVal !== 0) && (total === 0)) {
                        total = parseInt(screenVal);  // Only update the current... dont add.
                        _elm.val(total);
                        _elm.attr('value', total);
                        kScreen.val('0');
                        _elm.trigger('change');
                    }

                    }




                    _keypad.currDX =  0;
                    _keypad.currDY =  0;

                    //var inputs = $("input.activeKey");
                    //Had to mod this to work with new tab struct
                    var currentIndex = _keypad.inputs.index(_elm);

                    if(currentIndex < 0) { currentIndex = 0; }
                  //  _log.d("CURRENT INDEX IS : "+currentIndex);

                    var next = null;

                    if ((currentIndex + 1) < _keypad.inputs.length) {
                         next = _keypad.inputs.filter(function (index) {
                            return index == currentIndex + 1;
                        });

                      //  _log.d("NEXT IS --> "+next);
                    } else {
                        if(_keypad.currFace == "#ullagesFront__FACE") {
                             next = _elm;
                        } else {
                             next = _keypad.inputs[0];
                          //  _log.d("NEXT IS -> "+next);

                        }
                    }
                    if (_elm.attr('SKU')) {

                        var a = _elm;
                        _keypad.nextInputElm = next;
                        _.currScrolls[0].scrollToElement($(next)[0], null, null, true);
                        _keypad.show($(_keypad.nextInputElm));
                        a.removeClass('strategicQuantity');
                        a = null;
                    } else {
                        _elm.removeClass('strategicQuantity');

                        _keypad.nextInputElm = next;
                      //  _log.d("SHOWING NEXT : "+currentIndex+ " / "+next);

                        try { _.currScrolls[0].scrollToElement($(next)[0], null, null, true); } catch (e) { _log.d("COULD NOT AUTO SCROLL");  }


                        _keypad.show($(_keypad.nextInputElm));

                    }


                }
                else {

                    if(kScreen.val() == '0') { kScreen.val(currVal); }
                    else
                    {
                        if(kScreen.val().length >= 4) { return; }
                        kScreen.val(kScreen.val() + '' +currVal);

                    }



                }

            });
        });
    },

    hide : function() {
        _keypad.currDX = 0;
        _keypad.currDY = 0;
        if(_keypad.currInputElm != null) {
            // _keypad.currInputElm.closest('tr').find('td').each(function() { $(this).css({background: 'rgba(255,255,255,1)'});  })
            //_keypad.currInputElm.css({ background: 'rgba(0,0,0,0.4)'});
            _keypad.currInputElm.css({background: 'rgba(0,0,0,0.4)'});
        };
        _keypad.currInputElm = null;
        $('#currKeypad').remove();
    },
    buildNumpad : function(_elm) {
        $(_elm).attr('readonly', 'true');
        $(_elm).addClass("activeKey");
        if($(_elm).attr("isSuggested") == 'true') {
            $(_elm).addClass("strategicQuantity");
        }
        $(_elm).on('touchstart', function(e) {
            if(e.target.tagName == "INPUT") {
                e.preventDefault();
                _keypad.show(e);
            }
        });
    },
    currNumpadElm : '',
    killNumpad : function(cb) {
        var elms = $(_keypad.currFace);
        $(elms).find(".keypadEnabled").each(function( index ) {
            $(this).off('touchstart');
        });
        if ($('#currKeypad').length) {
            //$('#currKeypad').transition({opacity:0,duration:200,complete:function() {  $('#currKeypad').remove(); cb(); }})
            $('#currKeypad').remove();
            //_keypad.currNumpadElm.css({background:"rgba(0,0,0,0.2)"}).closest('td').css({background: 'rgba(0,0,0,0)', borderTopRightRadius:0, borderBottomRightRadius:0});
            //if( _keypad.currNumpadElm.val() == '') {  _keypad.currNumpadElm.val('0'); }
            cb();
        } else { cb(); }
    },
    buildFaceKeypad: function(faceid) {
        var elms = $('#'+faceid+"__FACE");
        _keypad.currFace = "#"+faceid+"__FACE";
      //  _log.d("ATTACHING KEYPAD TO #"+faceid+"__FACE");

      //  _log.d("WITH "+$(elms).find(".keypadEnabled").length+" ELEMENTS");

        $(elms).find(".keypadEnabled").each(function( index ) {

        //  _log.d("ATTACHING TRIGGER TO "+index);

            _keypad.buildNumpad(this);
        });
        _keypad.inputs = $(elms).find('input.activeKey');
        var cardMutationSubscriber = $.pubsub('subscribe', 'cardMutation', function (topic, data) {
            //_log.d("Keypad Mutation Possible?  Build " + data.id + " blindly!");
            var me = data.id;
            $.pubsub('unsubscribe', cardMutationSubscriber);
            if(me == "orderFront__FACE") {
                var element = angular.element($('#orderFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            if(me == "inventoryFront__FACE") {
                var element = angular.element($('#inventoryFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            if(me == "ullagesFront__FACE") {
                var element = angular.element($('#ullagesFront__FACE'));
                element.scope().$apply();
                _.currScrolls[0].refresh();
            }
            _keypad.buildFaceKeypad(me.replace("__FACE", ""));

        });
    }
};;;


exports.process= function (form, modelRoot, attachElm) {

        _moduleBuilder.currentForms = form;
        //_moduleBuilder.picCB = picCB;

            console.log("after MODULE " + form.headerFields.length);
            _log.d("PROCESSING : " + form.name);

            var xml = '';
            var model = {};

            for (var e in form.headerFields) {

                elm = form.headerFields[e];
                console.log("after FIELD");
                _log.d("PROCESSING FILED : " + elm.type);

                var label = (typeof elm.label != 'undefined') ? elm.label : '';
                var desc = (typeof elm.desc != 'undefined') ? elm.desc : '';
                var text = (typeof elm.text != 'undefined') ? elm.text : '';
                var name = (typeof elm.name != 'undefined') ? elm.name : '';


                //IS IT VISIBLE?
                var show = (typeof elm.show != 'undefined') ? elm.show : 'true';

                var def = (typeof elm.def != 'undefined') ? elm.def : '';


                xml += '<formElement show="' + show + '" name="' + name + '" title="' + label + '" desc="' + desc + '" text="' + text + '">'

                if (elm.type == 'TEXT') {
                    model[elm.name] = def;
                    xml += '<input type="text" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" filter="' + elm.filter + '" ng-model="' + modelRoot + '.' + elm.id + '"   />';
                }
                else if (elm.type == 'DATE') {

                    /* Doesn't seem to work
                     if (def == '') {
                     var now = new Date();
                     def = now.getFullYear() + "-";
                     def += ((now.getMonth() < 10) ? "0" + now.getMonth() : now.getMonth()) + "-";
                     def += ((now.getDate() < 10) ? "0" + now.getDate() : now.getDate());
                     alert("Setting default: " + def);
                     }
                     */

                    model[elm.name] = def;


                    xml += '<input type="date" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '" />';
                }
                else if (elm.type == 'TIME') {

                    /* Doesn't seem to work
                     if (def == '') {
                     var now = new Date();
                     def = now.getFullYear() + "-";
                     def += ((now.getMonth() < 10) ? "0" + now.getMonth() : now.getMonth()) + "-";
                     def += ((now.getDate() < 10) ? "0" + now.getDate() : now.getDate());
                     alert("Setting default: " + def);
                     }
                     */

                    model[elm.name] = def;


                    xml += '<input type="time" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '" />';
                }
                else if (elm.type == 'NUMBER') {

                    model[elm.name] = def;


                    xml += '<input type="number" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '" />';
                }

                else if (elm.type == 'EMAIL') {

                    model[elm.name] = def;


                    xml += '<input type="email" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '" />';
                }

                else if (elm.type == "DROPDOWN") {

                    // LDP:
                    // When we start getting this from community surveys, mongoose won't allow the use
                    // of the options field, so it has been defined as opts instead.
                    // This is just a little work-around to allow both.
                    if (elm.opts) {
                        elm.options = elm.opts;
                    }
                    //alert("select pop"+JSON.stringify(elm));
                    //   alert(modelRoot+"after adding corrective actions"+JSON.stringify(elm.extra.actions));

                    model[elm.name + '_SELECTED'] = null;//elm.options[elm.options.length - 1];
                    model[elm.name] = elm.options;
                    size = (typeof elm.size != 'undefined') ? elm.size : 1;
                    size = 'size="' + size + '"';

                    xml += '<select ng-change="selectChange(\'' + elm.name + '\')" ' + size + ' valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.name + '_SELECTED"  ng-options="item.value'+ ' for item'+ ' in ' + modelRoot + '['+e+' ].options'+'"></select>';


                   // console.log("after drop down" + xml);

                    //  _log.d("GENERATED SELECT XML IS : " + xml);

                }

                else if (elm.type == "MULTICHOICE") {

                    // LDP:
                    // When we start getting this from community surveys, mongoose won't allow the use
                    // of the options field, so it has been defined as opts instead.
                    // This is just a little work-around to allow both.
                    if (elm.opts) {
                        elm.options = elm.opts;
                    }
                    //alert("select pop"+JSON.stringify(elm));
                    //   alert(modelRoot+"after adding corrective actions"+JSON.stringify(elm.extra.actions));

                    model[elm.name + '_SELECTED'] = null;//elm.options[elm.options.length - 1];
                    model[elm.name] = elm.options;
                    size = (typeof elm.size != 'undefined') ? elm.size : 1;
                    size = 'size="' + size + '"';

                    xml += '<select multiple ng-change="selectChange(\'' + elm.name + '\')" ' + size + ' valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.name + '_SELECTED"  ng-options="item.value'+ ' for item'+ ' in ' + modelRoot + '['+e+' ].options'+'"  ></select>';


                    console.log("after drop down" + xml);

                    //  _log.d("GENERATED SELECT XML IS : " + xml);

                }


                else if (elm.type == 'checkbox') {

                    // LDP:
                    // When we start getting this from community surveys, mongoose won't allow the use
                    // of the options field, so it has been defined as opts instead.
                    // This is just a little work-around to allow both.

                    elm.options = [
                        {name: 'true', label: 'Yes'},
                        {name: 'false', label: 'No'}

                    ];


                    model[elm.name + '_SELECTED'] = null;//elm.options[elm.options.length - 1];
                    model[elm.name] = elm.options;
                    size = (typeof elm.size != 'undefined') ? elm.size : 1;
                    size = 'size="' + size + '"';

                    //xml += '<select ng-change="selectChange(\'' + elm.name + '\')" ' + size + ' valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.name + '_SELECTED"  ng-options="_' + elm.name + '.label for _' + elm.name + ' in ' + modelRoot + '.' + elm.name + '"></select>';

                    //Change this to buttons
                    xml += '<div><table class="surveyBtntable" width="100%"><tr>';
                    for (var o in elm.options) {
                        xml += '<td class="surveyBtnTd"><button ng-class="{button_selected : ' + modelRoot + '.' + elm.name + '_SELECTED == ' + modelRoot + '.' + elm.name + '[' + o + '] }" ng-click="selectOption(\'' + elm.name + '\', ' + o + ')" >' + elm.options[o].label + '</button></td>';
                    }
                    xml += '</tr></table></div>';

                    //    _log.d("GENERATED CHECKBOX XML IS : " + xml);

                }
                /*
                 else if(elm.type == 'radio')
                 {


                 model[elm.name+'_RADIO'] = '';
                 //  xml += '<select ng-change="selectChange(\''+elm.name+'\')" type="date" valid="'+elm.valid+'" ng-model="'+modelRoot+'.'+elm.name+'_SELECTED"  ng-options="_'+elm.name+'.label for _'+elm.name+' in '+modelRoot+'.'+elm.name+'"></select>';

                 for(var i in elm.options)
                 {
                 xml += '<input type="radio" name="poo" id="" value="'+elm.options[i].name+'" id="'+elm.options[i].name+'" /> '+elm.options[i].label+' <br /><br />'
                 }



                 }
                 */
                else if (elm.type == 'range') {
                    model[elm.name] = def;
                    xml += '<input type="range" min="' + elm.min + '" max="' + elm.max + '" step="' + elm.step + '" value="' + elm.min + '"   />';
                }
                else if (elm.type == 'rate') {
                    model[elm.name] = 0;
                    xml += '<table id="' + elm.name + '_RATE" width="100%"><tr>';
                    for (var i = 0; i < elm.max; i++) {
                        xml += '<td  onClick="_formBuilder.changeRange(this)" cnt="' + i + '" class="gui-extra rateDeselected" style="font-size:20pt;"><center>&#xf006;</center></td>';
                    }

                    xml += '</tr></table>';
                    xml += '<input type="text" style="display:none" id="' + elm.name + '_RATEINPUT" ng-model="' + modelRoot + '.' + elm.name + '" />';

                }
                else if (elm.type == 'photo') {
                    model[elm.name] = '';
                    xml += '<center><img src="img/placeholder.png" style="max-width:100%;" onclick="_formBuilder.addPic(this);"/></center>';
                }
                else if (elm.type == 'SIGNATURE') {
                    model[elm.name] = '';
                    xml += '<center>'
                    + '<div onclick="_moduleContainer.signature(\''+elm.text+'\');">'
                    + '<input type="text" style="display:none" ng-model="' + modelRoot + '.' + elm.name + '" ng-change="inputChange(\'' + elm.name + '\')" /> <div class="placeholder"><br /><center>TAP HERE TO SIGN</center><br /></div><img src="" style="max-width:100%; max-height:80px" /><br /></div></center>';
                }


                else if (elm.type == 'SCAN') {
                    model[elm.name] = '';
                    xml += '<center>'
                    + '<div onclick="_moduleContainer.scan();">'
                    + '<input type="text" style="display:none" ng-model="' + modelRoot + '.' + elm.name + '" ng-change="inputChange(\'' + elm.name + '\')" /> <div class="placeholder"><br /><center>TAP HERE TO SCAN</center><br /></div><br /></div></center>';
                }






                else if (elm.type == 'address') {
                    xml += '<< TODO ADDRESS >>';
                }
                xml += '<div></div>';
                xml += '<div class="cardFormElementFooter"><table style="border-bottom: 1px solid #999;padding-top: 3px;"><tr>';

                xml += '<td class="gui-extra" width="20" style="border-bottom-left-radius: 5px;" ng-show="showHistoryButton(\'' + elm.questionKey + '\')" ><x style="padding-top:6px;">&#xf071;</x></td><td ng-click="showHistory(\'' + elm.questionKey + '\')" ng-show="showHistoryButton(\'' + elm.questionKey + '\')"  onclick="" style="text-align:left;" >History</td>';

                //PHOTOS / COMMENTS
                if (elm.type =="IMAGE") {


                    if (elm.type =="IMAGE") {
                        xml += '<td class="gui-extra" width="20" style="border-bottom-left-radius: 5px;"><x style="padding-top:6px;">&#xf030;</x></td><td ng-click="sizeChange()" onclick="_moduleBuilder.showPhotos(this)" style="text-align:left;">PHOTOS</td>';
                    }


                    if (elm.allowComment) {
                        xml += '<td ng-click="sizeChange()" style="text-align:right;" onclick="_moduleBuilder.showComments(this)">COMMENTS</td><td class="gui-extra" width="20" style="padding-top:6px;">&#xf075;</td>';
                    }


                    xml += '</tr></table>';

                    if (elm.type =="IMAGE") {
                        xml += '<div class="photoContainer" style="display:none;">' +
                        ' <table><tr>' +
                        '<td><center><img onclick="_moduleBuilder.addPic(this, \'' + elm.name + '_PHOTO_0\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_0' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                        '<x style="padding-left:6px;" onclick="_moduleBuilder.attachPic(this, \'' + elm.name +
                        '<x style="padding-left:6px;" onclick="_moduleBuilder.removePic(this, \'' + elm.name + '_PHOTO_0\', \'' + attachElm + '\');" >    REMOVE</x></center>' +
                        ' </td>' +
                        '<td><center><img onclick="_moduleBuilder.addPic(this, \'' + elm.name + '_PHOTO_1\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_1' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                        '    <x style="padding-left:6px;" onclick="_moduleBuilder.removePic(this, \'' + elm.name + '_PHOTO_1\', \'' + attachElm + '\');" >    REMOVE</x>   </center></td>' +
                        '<td><center><img onclick="_moduleBuilder.addPic(this, \'' + elm.name + '_PHOTO_2\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_2' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                        '     <x style="padding-left:6px;" onclick="_moduleBuilder.removePic(this, \'' + elm.name + '_PHOTO_2\', \'' + attachElm + '\');" >    REMOVE</x>  </center></td>'
                        + '</<table></tr></table></tr></div>';


                        model[elm.name + '_PHOTO_0'] = {"data": 'img/placeholder.png'};
                        model[elm.name + '_PHOTO_1'] = {"data": 'img/placeholder.png'};
                        model[elm.name + '_PHOTO_2'] = {"data": 'img/placeholder.png'};


                        // _log.d("GENERATED IMG XML IS : " + xml);


                    }
                    if (elm.allowComment) {
                        xml += '<div class="commentContainer" style="display:none;">' +
                        ' <textarea ng-blur="inputChange(\'' + elm.name + '\')" ng-model="' + modelRoot + '.' + elm.name + '_COMMENT"></textarea>' +
                        '</div>';


                        model[elm.name + '_COMMENT'] = '';

                    }


                }

                xml += '</tr></table>' +
                '</div></div>';


                xml += '</formElement>';
                console.log("closed form tag");


            }

            console.log("done with form");
            form.data = xml;
            form.model = model;


        //}

        console.log("returning form");
        return xml;


    }
    _moduleBuilder = {



        getSignature: function (elm) {


        _log.d("GETTING SIG...");


        //ng-change="inputChange(\'' + elm.name + '\')"  ng-model="' + modelRoot + '.' + elm.name + '"
        _modal.signature(function (signatureData) {

            _log.d("GOT SIGNATURE : " + signatureData);

            $(elm).find('.placeholder').remove();
            $(elm).find('img').attr('src', signatureData);

            $(elm).find('input').val(signatureData).trigger('change');
            $(elm).append("<x></x>");

            _modal.hide();


        });

    },


    changeRange: function (elm) {
        cnt = parseInt($(elm).attr('cnt'));
        nam = $(elm).closest('table').attr('id').replace('_RATE', '');
        _log.d("RANGE CHANGED ON " + nam + " TO " + cnt);

        i = 0;
        table = $(elm).closest('table').find('td').each(function () {

            if (i <= cnt) {

                $(this).removeClass('rateDeselected').addClass('rateSelected').html('<center>&#xf005;</center>');
                $('#' + nam + '_RATEINPUT').val(i);

            }
            else {
                $(this).removeClass('rateSelected').addClass('rateDeselected').html('<center>&#xf006;</center>');
            }

            i++;
        });


    },


    isShowingPhotos: false,
    isShowingComments: false,
    showPhotos: function (container) {

        if (_moduleBuilder.isShowingPhotos) {
            return;
        }
        _moduleBuilder.isShowingPhotos = true;
        setTimeout(function () {
            _moduleBuilder.isShowingPhotos = false;
        }, 500);

        $(container).closest('.face').append('<x />');

        container = $(container).closest('.cardFormElementContent').find('.photoContainer');

        //  alert(container.data('isOpen'));

        if (!container.data('isOpen')) {
            _log.d("SHOWING PHOTOS");

            container.show();
            container.data('isOpen', true);

        }
        else {
            _log.d("HIDING PHOTOS");
            container.hide();

            container.data('isOpen', false);
        }


    },


    showCorrectiveAction: function (container, idx, options) {

        console.log("corrective show :" + JSON.stringify(options[idx]));


        $(container).closest('.face').append('<x />');

        container = $(container).closest('.cardFormElementContent').find('.correctiveContainer');

        if (options[idx].name == "no" || options[idx].name == "noPenalty") {
            _log.d("SHOWING CORRECTIVE ACTION");

            container.show();
            container.data('isOpen', true);

        }
        else {
            _log.d("HIDING CORRECTIVE ACTION");
            container.hide();

            container.data('isOpen', false);
        }


    },
    showComments: function (container) {


        if (_moduleBuilder.isShowingComments) {
            return;
        }
        _moduleBuilder.isShowingComments = true;
        setTimeout(function () {
            _moduleBuilder.isShowingComments = false;
        }, 500);


        container = $(container).closest('.cardFormElementContent').find('.commentContainer');

        //  alert(container.data('isOpen'));

        if (!container.data('isOpen')) {
            _log.d("SHOWING COMMENTS");

            container.show();
            container.find('textarea').focus();
            container.data('isOpen', true);

        }
        else {
            _log.d("HIDING COMMENTS");
            container.hide();
            container.find('textarea').blur();

            container.data('isOpen', false);
        }


    },


    addPic: function (elm, model, attachElm) {

        _log.d("ADDING PIC TO : " + model);

        _camera.getPic(function (imageData) {


            _log.d("GOT IMAGE : " + imageData);

            _log.d("searching for " + model);

            for (var i in _moduleBuilder.currentForms) {
                _log.d("Current form index: " + i);

                var form = _moduleBuilder.currentForms[i];

                for (var x in form.model) {

                    _log.d("DOES " + x + " == " + model);
                    if (x == model) {
                        _log.d("IT DOES ! --> " + attachElm);
                        //console.log("image location"+_location.currLat);
                        form.model[x] = {
                            "data": imageData,
                            "latitude": _location.currLat,
                            "longitude": _location.currLon
                        };
                        layout.attach('#' + attachElm);

                        break;
                    }

                }

            }


            //  $(elm).attr('src', imageData);

        }, 384, 216);


        /*  navigator.camera.getPicture(function (imageData) {

         imageData = "data:image/jpeg;base64," + imageData;

         _log.d("GOT IMAGE : " + imageData);

         $(elm).attr('src', imageData);


         },

         function (fail) {

         _log.d('GETPICTURE --> Failed because: ' + fail);

         },
         {
         quality: 75,
         destinationType: Camera.DestinationType.DATA_URL,
         allowEdit: true,
         saveToPhotoAlbum: true,
         targetWidth: 420,
         targetHeight: 420
         }
         );

         */


    },


    removePic: function (elm, model, attachElm) {

        _log.d("REMOVING PIC FROM : " + model);


        _log.d("searching for " + model);

        for (var i in _moduleBuilder.currentForms) {
            _log.d("Current form index: " + i);

            var form = _moduleBuilder.currentForms[i];

            for (var x in form.model) {

                _log.d("DOES " + x + " == " + model);
                if (x == model) {
                    _log.d("IT DOES ! --> " + attachElm);

                    form.model[x] = {"data": 'img/placeholder.png'};

                    layout.attach('#' + attachElm);

                    break;
                }

            }

        }


    },
    attachPic: function (elm, model, attachElm) {

        navigator.camera.getPicture(function (imageURI) {

            alert("We should have a picture here: ");
            for (var i in _moduleBuilder.currentForms) {
                _log.d("Current form index: " + imageURI);

                var form = _moduleBuilder.currentForms[i];
                var imageD = "data:image/jpeg;base64," + imageURI;

                for (var x in form.model) {

                    _log.d("DOES " + x + " == " + model);
                    if (x == model) {
                        _log.d("IT DOES ! --> " + attachElm);
                        //console.log("image location"+_location.currLat);
                        form.model[x] = {
                            "data": imageURI,
                            "latitude": _location.currLat,
                            "longitude": _location.currLon
                        };
                        layout.attach('#' + attachElm);

                        break;
                    }

                }

            }


        }, function (message) {

            alert("Some or other error: " + message);

        }, {
            quality: 80,
            destinationType: navigator.camera.DestinationType.DATA_URL,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
        });

    },

    showHistory: function () {
        _modal.show("warning", "History", "<h2>Hello world</h2>", true, function () {
            //do something when ok is pressed

            _modal.hide();

        })
    }


};
;
;
;;
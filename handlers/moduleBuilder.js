exports.process = function (form, modelRoot, attachElm) {


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

            model[elm.name] = def;


            xml += '<input type="date" ng-blur="inputChange(\'' + elm.name + '\')" valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '" />';
        }
        else if (elm.type == 'TIME') {

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

            if (elm.opts) {
                elm.options = elm.opts;
            }
            model[elm.name + '_SELECTED'] = null;//elm.options[elm.options.length - 1];
            model[elm.name] = elm.options;
            size = (typeof elm.size != 'undefined') ? elm.size : 1;
            size = 'size="' + size + '"';

            xml += '<select ng-change="selectChange(\'' + elm.name + '\')" ' + size + ' valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '_SELECTED"  ng-options="item.value' + ' for item' + ' in ' + modelRoot + '[' + e + '].options' + '"></select>';

        }

        else if (elm.type == "MULTICHOICE") {

            if (elm.opts) {
                elm.options = elm.opts;
            }

            model[elm.name + '_SELECTED'] = null;//elm.options[elm.options.length - 1];
            model[elm.name] = elm.options;
            size = (typeof elm.size != 'undefined') ? elm.size : 1;
            size = 'size="' + size + '"';

            xml += '<select multiple ng-change="selectChange(\'' + elm.name + '\')" ' + size + ' valid="' + elm.valid + '" ng-model="' + modelRoot + '.' + elm.id + '_SELECTED"  ng-options="item.value' + ' for item' + ' in ' + modelRoot + '[' + e + ' ].options' + '"  ></select>';

        }


        else if (elm.type == 'SIGNATURE') {
            model[elm.name] = '';
            xml += '<center>'
            + '<div onclick="_moduleContainer.signature(\'' + elm.text + '\');">'
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

        //images
        if (elm.type == "IMAGE") {


            if (elm.type == "IMAGE") {
                xml += '<td class="gui-extra" width="20" style="border-bottom-left-radius: 5px;"><x style="padding-top:6px;">&#xf030;</x></td><td ng-click="sizeChange()" onclick="_moduleBuilder.showPhotos(this)" style="text-align:left;">PHOTOS</td>';
            }


            xml += '</tr></table>';

            if (elm.type == "IMAGE") {
                xml += '<div class="photoContainer" style="display:none;">' +
                ' <table><tr>' +
                '<td><center><img onclick="_moduleContainer.addPic(this, \'' + elm.name + '_PHOTO_0\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_0' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                '<x style="padding-left:6px;" onclick="_moduleBuilder.attachPic(this, \'' + elm.name +
                '<x style="padding-left:6px;" onclick="_moduleContainer.removePic(this, \'' + elm.name + '_PHOTO_0\', \'' + attachElm + '\');" >    REMOVE</x></center>' +
                ' </td>' +
                '<td><center><img onclick="_moduleContainer.addPic(this, \'' + elm.name + '_PHOTO_1\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_1' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                '    <x style="padding-left:6px;" onclick="_moduleContainer.removePic(this, \'' + elm.name + '_PHOTO_1\', \'' + attachElm + '\');" >    REMOVE</x>   </center></td>' +
                '<td><center><img onclick="_moduleBuilder.addPic(this, \'' + elm.name + '_PHOTO_2\', \'' + attachElm + '\');" ng-src="{{' + modelRoot + '.' + elm.name + '_PHOTO_2' + '.' + 'data' + '}}" width="120" height="120" style="border-radius:5px;" />' +
                '     <x style="padding-left:6px;" onclick="_moduleContainer.removePic(this, \'' + elm.name + '_PHOTO_2\', \'' + attachElm + '\');" >    REMOVE</x>  </center></td>'
                + '</<table></tr></table></tr></div>';


                model[elm.id + '_PHOTO_0'] = {"data": 'img/placeholder.png'};
                model[elm.id + '_PHOTO_1'] = {"data": 'img/placeholder.png'};
                model[elm.id + '_PHOTO_2'] = {"data": 'img/placeholder.png'};

            }


        }

        xml += '</tr></table>' +
        '</div></div>';


        xml += '</formElement>';
        _log.d("closed form tag");


    }

    _log.d("done with form");
    form.data = xml;
    form.model = model;

    _log.d("returning form");
    return xml;


};
;
;
;
;
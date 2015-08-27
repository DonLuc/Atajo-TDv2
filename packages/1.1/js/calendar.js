

_calendar = {

    getOptions : function (cb) {

        var disabledDays = [];
        var firstFreeDay = '';
        var firstFreeDate = false;

        _log.d("CALENDAR.GETOPTIONS");

        var _YEAR  = moment().format('YYYY');
        var _MONTH = moment().format('MM');
        var _DAY   = moment().format('DD');


        _model.getAll('calendar', function(records) {

          useTomorrow = false;

            for(var day in records) {

                var date = records[day].Date__c;

              //  _log.d("CALENDAR DATE - "+date);

                date = date.split('-'); //2014-01-05

                var currYEAR  = date[0];
                var currMONTH = date[1];
                var currDAY   = date[2];

                if(currYEAR < _YEAR || currMONTH < _MONTH )
                {
                  // _log.d("YEAR / MONTH IN THE PAST. CONTINUING");
                   continue;
                }


                if(records[day].Status__c == "FREE") {

                  if(currMONTH.charAt(0) == '0') { currMONTH = currMONTH.substring(1); }
                  if(currDAY.charAt(0)   == '0') { currDAY   = currDAY.substring(1);   }



                     var _date = new Date(date[0], date[1]-1, date[2], 0, 0, 0, 0);

                  //  _log.d("DATE IS FREE -> ADDING TO DISABLED DAYS : "+date);

                    disabledDays.push(_date);

                } else {


                    if(useTomorrow)
                    {
                      //USE THIS DATE
                      if(currMONTH.charAt(0) == '0') { currMONTH = currMONTH.substring(1); }
                      if(currDAY.charAt(0)   == '0') { currDAY   = currDAY.substring(1);   }

                      firstFreeDay = currDAY;
                      firstFreeDate = new Date(currYEAR, currMONTH-1, currDAY, 0, 0, 0, 0);
                      _log.d("CALENDAR FIRST FREE DAY FOUND - "+firstFreeDay+" / "+firstFreeDate);
                      useTomorrow = false;
                      break;
                    }

                  //  _log.d(" if "+date[0]+" >= "+_YEAR+" && "+date[1]+" >= "+_MONTH+" && "+ date[2] + " >= "+_DAY);

                    if(currDAY >= _DAY && currMONTH >= _MONTH && currYEAR >= _YEAR)
                    {
                      // _log.d("USING NEXT AVAILABLE DAY");
                       useTomorrow = true;
                    }






                }

            }

            if(!firstFreeDate) { //DATE NOT FOUND.. TRY NEXT MONTH / YEAR

            //    _log.d("CALENDAR -> FIRST FREE DAY NOT FOUND - DEFAULTING TO TOMORROW");

                var today    = moment();
                var tomorrow = today.add('days', 1);
                var rawDate  = moment(tomorrow).format("YYYY-MM-DD").split('-');

                var _currYEAR  = rawDate[0];
                var _currMONTH = rawDate[1];
                var _currDAY   = rawDate[2];

                 firstFreeDay = _currDAY;
                 firstFreeDate = new Date(_currYEAR, _currMONTH, _currDAY, 0, 0, 0, 0);
                 _log.d("CALENDAR DEFAULT FFREE DAY SET @ "+firstFreeDay+" / "+firstFreeDate);


/*
                for(var day in records) {

                    var date = records[day].Date__c;
                    date = date.split('-'); //2014-01-05


                    if(records[day].Status__c != "FREE")
                    {
                        var now = new Date();
                        var _date = new Date();

                        if (now.getMonth() == 11) {
                            var _date = new Date(now.getFullYear() + 1, 0, 1);
                        } else {
                            var _date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                        }
                        _date = moment(_date).format('L');
                        _date = _date.split('/');


                        if(date[0] == _date[2] && date[1] == _date[0]) {


                            if(firstFreeDay == '') {

                                firstFreeDay = date[2];
                                firstFreeDate = new Date(date[0], date[1], date[2], 0, 0, 0, 0);

                            }

                        }

                    }

                }
*/
            }


            //var defaultDate = new Date();
            //defaultDate.setDate(firstFreeDay);

            firstFreeDate = moment(firstFreeDate).toDate();

            _log.d("First free date: " + firstFreeDate);

            var now = new Date();

            var options = {

                minDate: now,
                reposition: false,
                position: "bottom",
                disabledDays : disabledDays,
                setDefaultDate : true,
                defaultDate : firstFreeDate,

                highlightDayFn : function(date) {


                    for (var d in this.disabledDays) {

                        var check = this.disabledDays[d];

                        if (check.getYear() == date.getYear() && check.getMonth() == date.getMonth() && check.getDate() == date.getDate()) {

                            return true;

                        }

                    }

                    return false;

                }

            };

            cb(options);

        });

    }


}
;;

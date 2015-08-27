//var community = require('../adapters/community/adapter');
var _log = require('../provider/lib/log');

var _config = require('../conf/config.json');

var querystring = require('querystring');
var http = require('http');

var request = require('request');
var cheerio = require('cheerio');

var fs = require('fs');
var path = require('path');



exports.req = function (obj, cb) {


	   var usr = obj.credentials.username;
		 var pwd = obj.credentials.password;

		 var _conf = _config.OAUTH[GLOBAL.RELEASE];
/*

		var qry = {
									'client_id' : _conf.clientId,
									'client_secret' : _conf.clientSecret,
									'password' : pwd,
									'username' : usr,
									'grant_type' : 'password'
							};
*/

 var qry = {
						client_id			: _conf.clientId,
						redirect_uri	: _conf.redirectUri,
						response_type	: 'code',
						grant_type    : 'authorization_code',
						scope			    : 'id full api web refresh_token chatter_api'
				  	};

					var postData = querystring.stringify(qry);
					var uri = _conf.instanceUri + '/services/oauth2/authorize?' + postData;



	  exports.get(uri, function(response, data) {

							_log.e("STEP 1 : AUTHORIZE CALL DONE ("+usr+")");



							var _s = data.indexOf('window.location.href =');
							var _e = data.indexOf(';', _s);

							var str = data.substring(_s,_e);
									str = str.replace('window.location.href =', '');

							eval("var URI = "+str);

							exports.get(URI, function(response, data) {


								   _log.e("STEP 2 : LOGIN FORM LOADED ("+usr+")");

									  //SCRAPE THE FUCKER
								    $ = cheerio.load(data);

										$('#theloginform').find('#username').val(usr);
										$('#theloginform').find('#password').val(pwd);

										var action     = $('#theloginform').find('form').attr('action');
										var formData   = {};


										 $('#theloginform').find('form').find('input').each(function(i, elem) {

												var nam = $(this).attr('name');
												var val = $(this).val();

												formData[nam] = val;


											});

							     	 formData.un = usr;


								exports.post(action, formData, function(response, data) {


								   	_log.e("STEP 3 : LOGIN DATA POSTED ("+usr+")");

										var tough = require('tough-cookie'); // note: not 'cookie', 'cookies' or 'node-cookie'
										var Cookie = tough.Cookie;

										if (response.headers['set-cookie'] instanceof Array)
										  cookies = response.headers['set-cookie'].map(function (c) { return (Cookie.parse(c)); });
										else
										  cookies = [Cookie.parse(response.headers['set-cookie'])];

											var cookieStr = '';



											for(var i in cookies)
											 {
												cookieStr += cookies[i].cookieString()+';';

											 }

											if( cookieStr.indexOf('sid') == -1 )
											{
												_log.e("SID HEADER NOT FOUND. INVALID LOGIN");
												obj.RESPONSE = false;
												cb(obj);
												return;

											}

												var _s = data.indexOf('window.location.href=');
												var _e = data.indexOf('}', _s);

												var str = data.substring(_s,_e);
														str = str.replace('window.location.href=', '');

												eval("var URI = "+str);


																exports.get( 'https://cs18.salesforce.com'+URI, function(response, data) {

																		var _s = data.indexOf('window.location.href =');
																		var _e = data.indexOf(';', _s);


																		var str = data.substring(_s,_e);
																				str = str.replace('window.location.href =', '');

																		//_log.d("STR IS "+str);

																		eval("var URI = "+str);

																	//	_log.d("URI IS "+URI);




																		var url  = require('url');
																		var url_parts = url.parse(URI, true);
																		var query = url_parts.query;



																		var code = query.code;
																		var tokenUri = _conf.instanceUri + '/services/oauth2/token';


																		qry = 'code=' + code + '&grant_type=authorization_code&client_id=' + encodeURIComponent(_conf.clientId) +
																			'&client_secret=' + encodeURIComponent(_conf.clientSecret) +
																			'&redirect_uri=' + encodeURIComponent(_conf.redirectUri);

																//		_log.d('Posting data to '+tokenUri+', to get authorization_code with data :' + qry);


																			exports.post(tokenUri, qry, function(response, data) {


																					_log.e("FINAL RESULT : "+data);

																					var access = JSON.parse(data);

																					/*

																					{
																					  "id": "https:\/\/test.salesforce.com\/id\/00D11000000723nEAA\/005b0000000YOIvAAO",
																					  "issued_at": "1433272803322",
																					  "scope": "id full api web refresh_token chatter_api",
																					  "instance_url": "https:\/\/cs18.salesforce.com",
																					  "token_type": "Bearer",
																					  "refresh_token": "5Aep861vKMLoVl4zz8vW8cXA9RlMwRq_Za7F_YTglN279PRvCoHkHdlqdrBnKocGa3chclk3.o4yIOJ.c3FbkXZ",
																					  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjE5NCJ9.eyJleHAiOjE0MzMyNzI5MjMsInN1YiI6Imh0dHBzOi8vdGVzdC5zYWxlc2ZvcmNlLmNvbS9pZC8wMEQxMTAwMDAwMDcyM25FQUEvMDA1YjAwMDAwMDBZT0l2QUFPIiwiYXRfaGFzaCI6InpWcE5MQlhFYU8zdlBZOXpBTlNHd2ciLCJhdWQiOiIzTVZHOThScVZlc3hSZ1E0OElUcHp1dExsNnZBNkRlMVpCZlBfV2hmX256TGN5MG1UTk9lemhUbjdfVTdPa0I0bk1PTUlOWDZDRlJmTEIzR1RkRnpWIiwiaXNzIjoiaHR0cHM6Ly90ZXN0LnNhbGVzZm9yY2UuY29tIiwiaWF0IjoxNDMzMjcyODAzfQ.BHCPTGU2Ixaank5hjtPSFQnnpliPRA-TAkz3ysGod4mYX90hFOXfKJtxT-aF7ehP3hVPX2DPU8U7VhwuQIev9a-6RZibR2_5jZUw8q7jHlREr0WYDDPkSZLe0FL4_Mi6bkvT3qB-jjwCRM3VtWwDXVomI1ANdnp4GJ629YRXnzd_8Eg6q8bYEMi6YxdQGiOH13K9XVuAfy6Lb1bPRKiOcIvbtZgK6Ma3k2R1QWgRGouSDTyDG7P9ceJq_DuGNsiyJX13z7U4nDaTKmKMWPP7xzpHm-HRiOv52TaHnxq7baMcqq0OFTfX72AlmE_uFx60HMbwysKiks2uB9FYBYGinC4uVsMt8J-RhKoglo4jxR4l-_uK1iyBqHpu2I96e1DN0wVnafpIjHjs_jiQj8n0iXzFa7-5JhllwOxu_7dTCMoZC4M7tcvQk7HaFmDnv6m4jw_heqJorPliSwABnJLH2WSKVzw1qmNtsf99_9_iTF02OChUyOlZgrbPKCpH3DeM8r_V6_zUmRBhEMKMiyTb9FuolDE3GE006X7vnpurzoQnLlR43KQjjGZ6Lvc11Ntc5I36214X2ynOS3keuDcbjVs_UdNfhbycySTJU-9nxjNwp961dndXWnjH3y5Jd7aciRV3j1E0i-RKpPDtkTAlujih1jKPlhcaoXWHAxwTKVs",
																					  "signature": "1qKGKuV9mN8sRCeik4W725RvaQ\/mGzPtlECeBSlV98o=",
																					  "access_token": "00D11000000723n!ARoAQB8Z.RZgUlTTk93fXq0Qf0lUcLMtSDrqmu3UMKsj4hsVCJqLaOpAMlUw1lSAmX4fjpzEO5.3qzayzGHRtyDehMCk2g5z"
																					}

																					*/

																					var userFile = path.join(__dirname, '../', 'cache', access.access_token+'.json');

																					_log.d("WRITING "+userFile+" => WITH : "+data);

																					fs.writeFile(userFile, data, function(err) {

																						if(err)
																						{
																							_log.e("COULD NOT SAVE USER CREDENTIALS : "+err);
																							obj.RESPONSE = false;

																						}
																						else
																						{
																							obj.RESPONSE = access.access_token;
																						}

																						cb(obj);
																						return;


																					});




																			});








											}, { 'Cookie' : cookieStr } );






								});



							});




		});





			// Build the post string from an object

			/*
				{
					"apiVersion"   : "v23.0",
					"clientId"     : "3MVG98RqVesxRgQ48ITpzutLl6vA6De1ZBfP_Whf_nzLcy0mTNOezhTn7_U7OkB4nMOMINX6CFRfLB3GTdFzV",
					"clientSecret" : "6262357505724964025",
					"redirectUri"  : "https://test.salesforce.com/services/oauth2/success",
					"instanceUri"  : "https://test.salesforce.com"
				},
			*/




//Lets configure and request






/*
		community.loginToken(obj.credentials.username, obj.credentials.password, function(token, response) {

				if (token) {

						obj.RESPONSE = token;
						obj.ROLES    = response.details.roles;

						//cb(token, response.details);

				} else {

					obj.RESPONSE = false;
					obj.ROLES    = [];

					//  cb(token);

				}

				cb(obj);

		});
*/
};


exports.get = function(uri, cb, headers) {

	if(typeof headers == 'undefined') { headers = {}; }

	headers['User-Agent'] = 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10';

//	_log.e("REQUEST URI IS  "+uri);
//	_log.e("REQUEST HEADERS ARE "+JSON.stringify(headers));

	request({
			url: uri,
			method: 'GET',
			headers : headers,
		//	followAllRedirects: true,

	}, function(error, response, body){
			if(error) {
					_log.e(error);
			} else {

					cb(response, body);





			}
	});



};



exports.post = function(uri, data, cb) {


//	_log.e('POSTING ');
//	_log.d(JSON.stringify(data));
//	_log.e("TO "+uri);

  var bodyStr = '';
  if(typeof data === 'string')
	{
		bodyStr = data;


	} else {

		bodyStr = require('querystring').stringify(data);

	}


	request.post({
  	uri: uri,
    headers: {
			'User-Agent' : 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
			'content-type': 'application/x-www-form-urlencoded',
			'Content-Length' : bodyStr.length
			},
  	body: bodyStr,
		followAllRedirects: true,

}, function(error, response, body){
	if(error) {
			_log.e(error);
	} else {


			cb(response, body);

	}

});




};



//NPM
var compressor = require('node-minify');
var fs 				 = require('fs');
var path 			 = require('path');
var crypto 		 = require('crypto');


//LIB
var _log = require('./log');



_base = {


	build : function(cb, debug) { if(!debug) { debug = false; }

	  var compress = !debug;



				var baseDir = path.join(__dirname, '../../', 'packages');


				_log.n();
        _log.i("BUILDING BASE ( "+(debug ? "DEBUG IS ON - NOT COMPRESSING" : "COMPRESSED") + " )");


        versions = fs.readdirSync(baseDir);

        resp = {};

        for(var v in versions)
         {

						var vers = versions[v];
         	 if(vers == ".DS_Store") { continue; }

            var baseVersionDir = path.join(baseDir, vers);

            var jsDir   = path.join(baseVersionDir, 'js');
		        var cssDir  = path.join(baseVersionDir, 'css');
		        var htmlDir = path.join(baseVersionDir, 'html');

		     //DO JS
					files = fs.readdirSync(jsDir);

					jsFiles = [];
					for(var i in files)
					{
							file = files[i];

							if (file.indexOf('.js') == -1) { continue; }

							//add ;; to the end of file...
							var fileData = fs.readFileSync(path.join(jsDir, file), "utf8");
							if(fileData.lastIndexOf(';;') < fileData.length - 5 )
							{
									fs.appendFileSync(path.join(jsDir, file), ';;', "utf8");
							}

								  jsFiles.push(path.join(jsDir, file));

					}



				     if(compress)
													{

														new compressor.minify({
           										type    : 'uglifyjs',
															fileIn:  jsFiles,
															fileOut: path.join(__dirname, '../', 'build', '/base-'+vers+'.js'),
															callback: function(err, min){



																	if(err) { _log.e("COULD NOT BUILD JS (NOT UPLOADING TO CORE) : "+err);  }


															}
														});




													}
												else
													{

												new compressor.minify({
																								type: 'no-compress',
																								fileIn: jsFiles,
																								fileOut: path.join(__dirname, '../', 'build', '/base-'+vers+'.js'),
																								callback: function(err, min){
																									// _log.d("JS DONE --> ");  console.log(min);

																									if(err) { _log.d("COULD NOT BUILD JS (NOT UPLOADING TO CORE) : "+err);  }
																									else {

																									//	fs.rename(path.join(__dirname, '../', 'build', '/base-'+vers+'.js.NEW'), path.join(__dirname, '../', 'build', '/base-'+vers+'.js'))

																									}


																								}
																						});

													}





				             		 //DO CSS

				            //get css file list
						 	files = fs.readdirSync(cssDir);


						 	//build small
						 	cssFilesSmall = [];
						 	excludePrefix = 'large';
						 	for(var i in files)
						 	 {
						 	 	 file = files[i];

						 	 	 if (file.indexOf('_' + excludePrefix) != -1 || file == '.DS_Store') { continue; }
								 cssFilesSmall.push(path.join(cssDir, file));

						 	 }

_log.i("				CSS SMALL");

								new compressor.minify({
												    type: 'no-compress', //compress ? 'yui-css' : 'clean-css',
												    fileIn : cssFilesSmall,
												    fileOut: path.join(__dirname, '../', 'build', 'base-'+vers+'.small.css'),
												    callback: function(err, min){
												      //  console.log(min);
												    }
												});


						 //build large
							cssFilesLarge = [];
							excludePrefix = 'small';
							for(var i in files)
							{
									file = files[i];

									if (file.indexOf('_' + excludePrefix) != -1 || file == '.DS_Store') { continue; }
							   	cssFilesLarge.push(path.join(cssDir, file));

							}

_log.i("				CSS LARGE");

							new compressor.minify({
													type: 'no-compress', //compress ? 'yui-css' : 'clean-css',
													fileIn : cssFilesLarge,
													fileOut: path.join(__dirname, '../', 'build', 'base-'+vers+'.large.css'),
													callback: function(err, min){
														//  console.log(min);
													}
											});



					     //get js file list
								files = fs.readdirSync(htmlDir);

								htmlFiles = [];
								html = '';

								fnam = path.join(__dirname, '../', 'build', 'base-'+vers+'.html');

                _log.i("				HTML");

								for(var i in files)
								{
										file = files[i];

										if (file.indexOf('.html') == -1) { continue; }

										html += fs.readFileSync(path.join(htmlDir, file));



								}

						//		html = '<div id="__BASE__" style="z-index:1">'+html+'</div>';


								//write response to single file..
												fs.writeFile(fnam, html, function (err) {
														if (err) {
																console.log("HTML PACK ERROR : " + err);

														}


												});







										         //DO HTML


















         };

				cb();







	},


	hash : function() {


				var baseDir = path.join(__dirname, '../', '../', 'packages');


      //  _log.d("COMPILING BASE HASH")

        versions = fs.readdirSync(baseDir);

        resp = {};

       for(var i in versions)
         {

            vers = versions[i];

            if(vers == ".DS_Store") { continue; }

            //_log.d("HASHING VERSION "+curr);

             check = '';

             //CSS
             files = fs.readdirSync(path.join(baseDir, vers,'js'));

             for(var f in files)
              {
                    file = files[f];
                  //  _log.d('file is : '+file);
                    check += fs.readFileSync(path.join(baseDir, vers, 'js', file));
              }


             //HTML
             files = fs.readdirSync(path.join(baseDir, vers,'css'));

             for(var f in files)
              {
                    file = files[f];
                  //  _log.d('file is : '+file);
                    check += fs.readFileSync(path.join(baseDir, vers, 'css', file));
              }


             //JS
             files = fs.readdirSync(path.join(baseDir, vers,'html'));

             for(var f in files)
              {
                    file = files[f];
                  //  _log.d('file is : '+file);
                    check += fs.readFileSync(path.join(baseDir, vers, 'html', file));
              }


               var hash = crypto.createHash('md5').update(check).digest("hex");

               resp[versions[i]] = hash;

           }






              return resp;



	},



};



exports.build = _base.build;
exports.hash  = _base.hash;

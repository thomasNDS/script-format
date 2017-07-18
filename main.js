var express = require('express')
var request = require('request');
var http = require('http');

var version = "0.1"
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

/** */
app.get('/', function(req, response) {
	  response.send('Hello World! ' + version)
})

/** */
app.get('/lbl/import', function(req, res) {

	var url= "http://ec.europa.eu/transparencyregister/public/consultation/statistics.do?action=getLobbyistsXml&fileType=NEW"
	console.error('IMPORT START'); 

	http.get(options, function(resp){
		
      var str = ""
	  
	  resp.on('data', function(chunk){
		console.error(chunk)
		str += chunk;
	  });// end GET ON

	  //the whole response has been recieved, so we just print it out here
	  resp.on('end', function () {
		console.error('END ! ' + str)
		response.send('END ! ' + str)
	  });
	  
	})// end GET svr

		
}) // end GET client

/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

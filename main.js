var express = require('express')
var request = require('request');

var version = "0.1"
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

/** */
app.get('/', function(req, response) {
	  response.send('Hello World! ' + version)
})

/** */
app.get('/lbl/import', function(req, response) {

	var url= "http://ec.europa.eu/transparencyregister/public/consultation/statistics.do?action=getLobbyistsXml&fileType=NEW"
		
	request(url, function (error, response, body) {
	  console.error('error:', error); // Print the error if one occurred 
	  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
	  console.log('body:', body); // Print the HTML for the Google homepage. 
	  response.send('error:' + error + 'statusCode:' + response && response.statusCode + 'body:'+ body)
	});	
		
})

/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

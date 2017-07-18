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
	req.setTimeout(0) // no timeout
	
	var url= "http://ec.europa.eu/transparencyregister/public/consultation/statistics.do?action=getLobbyistsXml&fileType=NEW"
	console.error('IMPORT START'); 
	
	//request(url, function (error, response, body) {
	  //console.error('error:', error); 
	//  console.log('statusCode:', response && response.statusCode); 
	 // console.log('body:', body); 
	 // res.send('error:' + error + 'statusCode:' + response && response.statusCode + 'body:'+ body)
//	});	
	


var options = {
  host: url,
  port: 80
};

	http.get(url, function(resp){
	  resp.on('data', function(chunk){
		//do something with chunk
		console.error("chunk :")
		  console.error(chunk)
	  });
	}).on("error", function(e){
	  console.error("Got error: " + e.message);
	  res.send("Got error: " + e.message)
	}).on("end", function(){
	  console.error("END: ");
	});	

		
})

/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

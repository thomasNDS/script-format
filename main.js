var express = require('express')
var request = require('request');
var http = require('http');
var fetch = require('node-fetch');

var version = "0.2"
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
	
	var dateCompare = new Date()
  dateCompare.setDate(1);
  dateCompare.setMonth(dateCompare.getMonth()-1);
  
fetch(url)
    .then(function(res) {
        return res.text();
    }).then(function(body) {
        console.log("body.length : " +body.length);
		res.send(body.split('<interestRepresentative>')
					 .slice(1)
					 .map(x => x.replace("</interestRepresentative>", ""))
					 .filter(x => new Date(x.match(/<lastUpdateDate>(.*)<\/lastUpdateDate>/)[1]) > dateCompare))
    });


		
}) // end GET client

/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

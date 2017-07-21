var express = require('express')
var fetch = require('node-fetch')
var parse = require('xml-parser')
var xml2js = require('xml2js')

var version = "0.2"
var app = express()
var parser = new xml2js.Parser();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

/** */
app.get('/', function(req, response) {
	  response.send('Hello World! ' + version)
})

/** */
app.get('/lbl/import/:nbdays', function(req, res) {
	req.setTimeout(0) // no timeout
	
	var url= "http://ec.europa.eu/transparencyregister/public/consultation/statistics.do?action=getLobbyistsXml&fileType=NEW"
	console.log('IMPORT START'); 
	
	var dateCompare = new Date()
	dateCompare.setDate(dateCompare.getDate()- req.params.nbdays);
  
fetch(url).then(function(res) {
			return res.text();
		}).then(function(body) {
			console.log("body.length : " +body.length);
			var filteredRes = body//.split('<interestRepresentative>')
								// .slice(1)
								// .join('')
								// .map(x => x.replace("</interestRepresentative>", ""))
								// .filter(x => new Date(x.match(/<lastUpdateDate>(.*)<\/lastUpdateDate>/)[1]) >= dateCompare)
								// .map(xml => parse('<r>' +xml + '</r>'))
						 
				parser.parseString(filteredRes, function (err, result) {
					console.error(err)
					res.send(result)
				});
						 
				//res.send(filteredRes.map(x=> deleteAttributes(x.root)))		 
			});

		
}) // end GET client

function deleteAttributes(root) {
	if (root) {
		delete root.attributes
		if (root.children && root.name) {
			root.children = root.children.map(x => deleteAttributes(x))
			root.children.map(function(x) { root[x.name] = x; })
			//delete root.children
			//delete root.name
		}
	}
	return root;
}

/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

// git add . & git commit -m " a" & git push

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
			var filteredRes = body.split('<interestRepresentative>')
								  .slice(1)
								  .map(x => x.replace("</interestRepresentative>", ""))
								  .filter(x => new Date(x.match(/<lastUpdateDate>(.*)<\/lastUpdateDate>/)[1]) >= dateCompare)
								  .map(xml => parse('<r>' +xml + '</r>'))
						 

						 
				res.send(filteredRes.map(x=> deleteAttributes(x.root)))		 
			});

		
}) // end GET client

/** */
function deleteAttributes(root) {
	if (root) {
		//delete root.attributes
		if (root.children && root.name) {
			if(root.name !=='interests' && root.name !=='customers') {
				
				root.children = root.children.map(x => deleteAttributes(x))
				root.children.map(function(x) {root[x.name] = x; return x})
				delete root.children
			}
		}
	}
	return root;
}

/** */
 function romanValue(s) {
    if (s == null ||  s == undefined) return 0
        return s.length ? function () {
            var parse = [].concat.apply([], glyphs.map(function (g) {
                return 0 === s.indexOf(g) ? [trans[g], s.substr(g.length)] : [];
            }));
            return parse[0] + romanValue(parse[1]);
        }() : 0;
    }
 
var trans = { M: 1E3, CM: 900, D: 500, CD: 400,  C: 100, XC: 90, L: 50, XL: 40, X: 10,  IX: 9,  V: 5,  IV: 4, I: 1},
        glyphs = Object.keys(trans);
       
/** */  
function formatNumberPhone(x) {
  return x[0].replace(/ /g,'')
  .split(')')
  .map(function(x, i) {
    return (i == 0) ?  x + ')' 
    : x.split('')
    .map(function(y, idx) {
      return (idx % 2 == x.length%2) ? y : y + " "
    })
    .join('')
  }).join('')
  .slice(0, -1);
}


/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

// git add . & git commit -m " a" & git push

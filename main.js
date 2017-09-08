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
app.get('/lbl/brut/:nbdays', function(req, res) {
	req.setTimeout(0) // no timeout
	
	var url= "http://ec.europa.eu/transparencyregister/public/consultation/statistics.do?action=getLobbyistsXml&fileType=NEW"
	console.log('BRUT START'); 
	
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
						 

				console.log('BRUT END');  
				res.send(filteredRes.map(x=> deleteAttributes(x.root)))		 
			});
		
}) // end GET client


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
						 

				console.log('IMPORT END'); 
				res.send(filteredRes.map(x=> buildCoherentElt(deleteAttributes(x.root))))		 
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
  return x.replace(/ /g,'')
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


function buildCoherentElt(elt) {

  var res = {}

  try {
	  res.id = elt.identificationCode?elt.identificationCode.content:""
	  res.name = elt.name.originalName?elt.name.originalName.content:""
	  res.registrationDate = elt.registrationDate?elt.registrationDate.content:""
	  res.category = romanValue(elt.category.mainCategory.content.split("-")[0].replace(" ",""))
	  
	  var cat = ["Trade unions and professional associations", "Non-governmental organisations, platforms and networks and similar", "Companies & groups", "Trade and business associations", "Think tanks and research institutions", "Professional consultancies", "Other organisations", "Self-employed consultants", "Other public or mixed entities, created by law whose purpose is to act in the public interest", "Law firms", "Transnational associations and networks of public regional or other sub-national authorities", "Academic institutions", "Other sub-national public authorities", "Regional structures", "Organisations representing churches and religious communities"]
	  res.subCategory = cat.indexOf(elt.category.subCategory.content.replace('&amp;', '&'))
	  res.legal = elt.legalStatus?elt.legalStatus.content:""
	  res.web = elt.webSiteURL?elt.webSiteURL.attributes['ns2:href']:""
	  var country = elt.contactDetails.country.content
	  res.country = country?country.charAt(0).toUpperCase() + country.slice(1).toLowerCase():""
	  res.headAddress = elt.contactDetails.addressline1?elt.contactDetails.addressline1.content:""
	  res.headCity = elt.contactDetails.town?elt.contactDetails.town.content:""
	  res.headPostCode = elt.contactDetails.postCode?elt.contactDetails.postCode.content:""
      res.headPhone = elt.contactDetails.phone ?formatNumberPhone("(" + elt.contactDetails.phone.indicPhone.content + ") " + elt.contactDetails.phone.phoneNumber.content):""
	  res.boss = elt.legalResp.firstName?elt.legalResp.firstName.content + ' ' + elt.legalResp.lastName.content:""
	  res.bossTitle = elt.legalResp.title?elt.legalResp.title.content:""
	  res.bossPosition = elt.legalResp.position?elt.legalResp.position.content:""
	  res.membersCount = elt.members.members?Math.round(elt.members.members.content):""
	  res.membersFTE = elt.members.membersFTE?elt.members.membersFTE.content:""
	  res.membership =  elt.structure.networking?elt.structure.networking.content:""
	  res.memberOrga =  elt.structure.structureMembers?elt.structure.structureMembers.content:""
	  res.goal = elt.goals?elt.goals.content.replace(/\r?\n/g, "<br />"):""
	  res.acronym = elt.acronym?elt.acronym.content:""
	  res.interests = (elt.interests && elt.interests.children)?elt.interests.children.map(x => x.children[0].content).join(', '):""
	  res.euInitiatives = elt.activities.activityEuLegislative?elt.activities.activityEuLegislative.content.replace(/\r?\n/g, "<br />"):""
	  res.lastUp = elt.lastUpdateDate.content
	  
	  if (elt.financialData.financialInformation.newTurnoverBreakdown 
			&& elt.financialData.financialInformation.newTurnoverBreakdown.customersGroupsInAbsoluteRange ) {
				
		res.customers = elt.financialData.financialInformation.newTurnoverBreakdown.customersGroupsInAbsoluteRange.customers.children.map(x => x.children[0].content).join(',')
		
	  } 
	  if (elt.financialData.financialInformation.turnoverBreakdown 
			&& elt.financialData.financialInformation.turnoverBreakdown.customersGroupsInAbsoluteRange) {
			
		if (res.customers) {
			res.customers += "," + elt.financialData.financialInformation.turnoverBreakdown.customersGroupsInAbsoluteRange.customers.children.map(x => x.children[0].content).join(',')
		} else {
			res.customers = elt.financialData.financialInformation.turnoverBreakdown.customersGroupsInAbsoluteRange.customers.children.map(x => x.children[0].content).join(',')
		}
	  } else {
		res.customers = ""
	  }
	  
	  res.costAbsolu = elt.financialData.financialInformation.cost?elt.financialData.financialInformation.cost.content:0
	   
	   if (elt.financialData.financialInformation.cost 
			&& elt.financialData.financialInformation.cost.range 
				&& elt.financialData.financialInformation.cost.range.max) {
					
		 if (elt.financialData.financialInformation.cost.range.min) {
		  res.costRange = Math.floor(parseInt(elt.financialData.financialInformation.cost.range.min.content,10)) + '-' + 
		  Math.floor(parseInt(elt.financialData.financialInformation.cost.range.max.content),10)
		 } else {
			res.costRange = '0-' + Math.floor(parseInt(elt.financialData.financialInformation.cost.range.max.content),10)
		 }
	   } else {
		  res.costRange = ""
	   }
	   res.turnoverAbsolu = elt.financialData.financialInformation.turnover?elt.financialData.financialInformation.turnover.content:0
	   
	   if (elt.financialData.financialInformation.turnover 
			&& elt.financialData.financialInformation.turnover.range 
				&& elt.financialData.financialInformation.turnover.range.max) {
					
		 if (elt.financialData.financialInformation.turnover.range.min) {
		  res.turnoverRange = Math.floor(parseInt(elt.financialData.financialInformation.turnover.range.min.content,10)) + '-' + 
		  Math.floor(parseInt(elt.financialData.financialInformation.turnover.range.max.content),10)
		 } else {
			res.turnoverRange = '0-' + Math.floor(parseInt(elt.financialData.financialInformation.turnover.range.max.content),10)
		 }
	   } else {
		  res.turnoverRange = ""
	   }
  } catch (e) {
	console.error(e); 
   }
  return res
}


/** */
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

// git add . & git commit -m " a" & git push

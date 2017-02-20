var express  = require('express');
var request  = require('request');
var cheerio  = require('cheerio');
var mongoose = require('mongoose');
var moment = require('moment');
var extractAddresses = require('address-extractor');
var extractInfo = require('./info-extractor.js');

var iconv = require('iconv-lite');

var List = require('../models/List.js');

// bundle our routes
var apiRoutes = express.Router();

/*

  POST /api/list
In order to create or update a list

*/
apiRoutes.post('/list', function(req,res){

  // We're looking for an already existing list with email
  //console.log(req.body);
  var query = {'_id':req.body._id};

  req.body.lastsave = moment().locale('fr').format('LLLL');

  // If we find one, we update, otherwise we create
  List.findOneAndUpdate(query, req.body, {upsert:true}, function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send(req.body.lastsave);
  });

});

apiRoutes.post('/list/create', function(req,res,next){

  var ls = moment().locale('fr').format('LLLL');
  List.create({ lastsave: ls, list: [], email: req.body.email }, function (err, small) {
    if (err) return handleError(err);
    // saved!
    //console.log(small.id);
    res.send(small.id);
    return small.id;
  })

});

apiRoutes.get('/list/:id', function(req,res,next){

  List.findOne({"_id": req.params.id},function (err, list) {
    if (err) return next(err);
    res.json(list);
  });

});

var parse = function($,parsinginfo){

  // Create object that we'll return
  var json = { title : "", price : "", desc : "", img : "", superf : "",
tel : "", addr : ""};

  // Get title
  // TODO

  // Get price and remove everything after €
  $(parsinginfo.price.location).filter(function(){
    json.price = $(this)[parsinginfo.price.fun[0]]();
    for (var i = 1; i < parsinginfo.price.fun.length; i++) {
      json.price = json.price[parsinginfo.price.fun[i]]();
    }
    json.price = json.price.replace(/(\r\n|\n|\r|\t|  )/gm,"");
  })

  // Get description
  if (parsinginfo.desc.pre != ""){
    $(parsinginfo.desc.location)[parsinginfo.desc.pre]().filter(function(){
      json.desc = $(this);
      for (var i = 0; i < parsinginfo.desc.fun.length; i++) {
        json.desc = json.desc[parsinginfo.desc.fun[i]]();
      }
      json.desc = json.desc.replace(/(\r\n|\r|\t|  )/gm,"");
    })
  } else {
    $(parsinginfo.desc.location).filter(function(){
      json.desc = $(this);
      for (var i = 0; i < parsinginfo.desc.fun.length; i++) {
        json.desc = json.desc[parsinginfo.desc.fun[i]]();
      }
      json.desc = json.desc.replace(/(\r\n|\r|\t|  )/gm,"");
    })
  }


  // Get address from description
  json.address = extractAddresses(json.desc)[0] || "À définir";

  json.info = extractInfo(json.desc.toLowerCase());

  // Get image
  $(parsinginfo.img.location).filter(function(){
    json.img = $(this)[parsinginfo.img.fun[0]]();
    for (var i = 1; i < parsinginfo.img.fun.length; i++) {
      json.img = json.img[parsinginfo.img.fun[i]]();
    }
    json.img = json.img.match(parsinginfo.img.regex)[1];
  })

  // Get superficy
  $(parsinginfo.superf.location).filter(function(){
    //console.log("############### "+parsinginfo.superf.fun[0]);
    json.superf = $(this)[parsinginfo.superf.fun[0]]();
    for (var i = 1; i < parsinginfo.superf.fun.length; i++) {
      //console.log("############### "+parsinginfo.superf.fun[i]);
      json.superf = json.superf[parsinginfo.superf.fun[i]]();
    }
    json.superf = json.superf.replace(/(\r\n|\n|\r|\t|  )/gm,"");
  })

  // Get contact info
  // TODO

  return json;
};



/*

  POST /api/annonce
In order to parse an annonce

*/
apiRoutes.post('/annonce', function(req, res){

  url =  req.body.link;

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request.get({
    uri: url,
    encoding: null
  }, function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request
      if(!error){
        var json = { title : "", price : "", desc : "", img : "", superf : "",
      tel : "", addr : "ERROR"};

        // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality


        if (url.includes("boncoin")){
          var parsinginfo = {
            title     : {location: ".no-border", fun: ["text"]},
            price     : {location: "h2.item_price span.value", fun: ["text"]},
            desc      : {location: "p.property.semibold", fun: ["next","text"]},
            img       : {location: "div.item_image.big.popin-open.trackable", fun: ["html"], regex : /src="(.*?)"/},
            superf    : {location: "section.properties", fun: ["text"]}
          };
          json = parse(cheerio.load(iconv.decode(html, 'iso-8859-1')),parsinginfo);

          // Specific stuff
          json.superf = json.superf.match(/Surface(\d+ m2)/)[1];

        }
        else if (url.includes("seloger")){
          var parsinginfo = {
            title     : {location: "", fun: ["text"]},
            price     : {location: "#price", fun: ["text"]},
            desc      : {location: "p.description", pre: "", fun: ["next","text"]},
            img       : {location: "ul#slider1", fun: ["html"], regex : /src="(.*?)"/},
            superf    : {location: "ol.description-liste", fun: ["children","first","text"]}
          };
          json = parse(cheerio.load(html),parsinginfo);

          // Specific stuff
          json.superf = json.superf.replace("Surface de ","");
        }
        else if (url.includes("pap")){
          var parsinginfo = {
            title     : {location: ".title", fun: ["text"]},
            price     : {location: ".price", fun: ["text"]},
            desc      : {location: "p.item-description", pre: "first", fun: ["text"]},
            img       : {location: "div.showcase-content", fun: ["html"], regex : /src="(.*?)"/},
            superf    : {location: "ul.item-summary", fun: ["children","last","text"]}
          };
          json = parse(cheerio.load(iconv.decode(html, 'iso-8859-1')),parsinginfo);

          // Specific stuff
          json.superf = json.superf.replace("Surface","");
        }
        else if (url.includes("paruvendu")){
          var parsinginfo = {
            title     : {location: "h1.auto2012_dettophead1txt1", fun: ["text"]},
            price     : {location: "#autoprix", fun: ["text"]},
            desc      : {location: ".im12_txt_ann.im12_txt_ann_auto", pre: "", fun: ["text"]},
            img       : {location: "div.imdet15-blcphomain", fun: ["html"], regex : /src="(.*?)"/},
            superf    : {location: "ul.imdet15-infoscles", fun: ["children","first","next","text"]}
          };
          json = parse(cheerio.load(iconv.decode(html, 'iso-8859-1')),parsinginfo);

          // Specific stuff
          json.price+="€";
          json.superf = json.superf.replace("Surface :","").replace("environ","");
        }
        else if (url.includes("fnaim")){
          var parsinginfo = {
            title     : {location: "h1.auto2012_dettophead1txt1", fun: ["text"]},
            price     : {location: ".prix", fun: ["text"]},
            desc      : {location: ".description", pre: "", fun: ["text"]},
            img       : {location: "div.imageBig", fun: ["html"], regex : /src="(.*?)"/},
            superf    : {location: ".informations", fun: ["text"]}
          };
          json = parse(cheerio.load(html),parsinginfo);

          // Specific stuff
          json.superf = json.superf.match(/Surface habitable :(\d+ m)/)[1]+"2";
        }

        // Finally, we'll define the variables we're going to capture
        json.link = req.body.link;

      }

      // Debug
      console.log(json);

      res.send(json);
  })

  return res;


}) // end of app.get(/backend)


module.exports = apiRoutes;

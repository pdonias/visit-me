var express  = require('express');
var request  = require('request');
var cheerio  = require('cheerio');
var mongoose = require('mongoose');
var moment = require('moment');
var extractAddresses = require('address-extractor');

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

var seloger = function(html){

  var $ = cheerio.load(html);

  var json = { title : "", price : "", desc : "", img : "", superf : "",
tel : "", addr : ""};

  // Get title
  // TODO

  // Get price and remove everything after €
  $('#price').filter(function(){
      json.price = $(this).text();
      json.price = json.price.replace(/(\r\n|\n|\r|\t|  )/gm,"");
      json.price = json.price.replace(/€.*/,"");
      json.price+="€";
  })

  // Get description
  $('p.description').filter(function(){
      json.desc = $(this).text();
      json.desc = json.desc.replace(/(\r\n|\r|\t|  )/gm,"");
  })

  // Get address from description
  json.address = extractAddresses(json.desc)[0] || "À définir";

  // Get image
  $('ul#slider1').filter(function(){
      json.img = $(this).html();
      //console.log(">>>"+json.img+"<<<");
      json.img = json.img.match(/src="(.*?)"/)[1];
  })

  // Get superficy
  $('ol.description-liste').children().first().filter(function(){
    json.superf = $(this).text().replace("Surface de ","").replace(/(\r\n|\n|\r|\t|  )/gm,"");
  })

  // Get contact info
  // TODO

  return json;
};

var leboncoin = function(html){
  var $ = cheerio.load(iconv.decode(html, 'iso-8859-1'));

  var json = { title : "", price : "", desc : "", img : "", superf : "",
tel : "", addr : ""};

  // Get title
  $('.no-border').filter(function(){
      json.title = $(this).text();
      json.title = json.title.replace(/(\r\n|\n|\r)/gm,"");
  })

  // Get price and remove everything after €
  $('h2.item_price span.value').filter(function(){
      json.price = $(this).text();
      json.price = json.price.replace(/(\r\n|\n|\r|\t|  )/gm,"");
      json.price = json.price.replace(/€.*/,"");
      json.price+="€";
  })

  // Get description
  $('div.properties_description p.value').filter(function(){
      json.desc = $(this).text();
      json.desc = json.desc.replace(/(\r|\r|\t|  )/gm,"");
  })

  // Get address from description
  json.address = extractAddresses(json.desc)[0] || "À définir";

  // Get image
  $('div.item_image.big.popin-open.trackable').filter(function(){
      json.img = $(this).html();
      json.img = json.img.match(/data-imgsrc="(.*?)"/)[1];
  })

  // Get superficy
  $('h2.clearfix span.property').filter(function(){
      if ($(this).text() == "Surface")
        json.superf = $(this).next().text();
  })

  // Get contact info
  $('span.phone_number a').filter(function(){
      json.tel = $(this).text();
  })

  var id = "";
  $('span.phoneNumber.trackable.link-like').filter(function(){
      id = $(this).attr('data-listid');
  })

  var addr_phone_n = "http://www2.leboncoin.fr/ajapi/get/phone?list_id="+id;

  request(addr_phone_n, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //var jsonObject = JSON.parse(body);
      //json.tel = jsonObject.phoneUrl;
    }
  })

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


        if (url.includes("boncoin"))
          json = leboncoin(html);
        else if (url.includes("seloger"))
          json = seloger(html);

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

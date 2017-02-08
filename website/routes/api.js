var express  = require('express');
var request  = require('request');
var cheerio  = require('cheerio');
var mongoose = require('mongoose');

var List = require('../models/List.js');

// bundle our routes
var apiRoutes = express.Router();

/*

  POST /api/list
In order to create or update a list

*/
apiRoutes.post('/list', function(req,res){

  // We're looking for an already existing list with email
  var query = {'email':req.body.email};

  // If we find one, we update, otherwise we create
  List.findOneAndUpdate(query, req.body, {upsert:true}, function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
  });

});

/*

  POST /api/annonce
In order to parse an annonce

*/
apiRoutes.post('/annonce', function(req, res){

  url =  req.body.link; // 'https://www.leboncoin.fr/locations/1073612460.htm?ca=22_s';

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request(url, function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request
      var json = { title : url, price : "", desc : "", img : "", superf : "",
    tel : "", addr : ""};

      if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

          var $ = cheerio.load(html);

          // Finally, we'll define the variables we're going to capture

          $('.no-border').filter(function(){
              json.title = $(this).text();
              json.title = json.title.replace(/(\r\n|\n|\r)/gm,"");
          })

          $('h2.item_price span.value').filter(function(){
              json.price = $(this).text();
              json.price = json.price.replace(/(\r\n|\n|\r|\t|  )/gm,"");
          })

          $('div.properties_description p.value').filter(function(){
              json.desc = $(this).text();
              json.desc = json.desc.replace(/(\r\n|\n|\r|\t|  )/gm,"");
          })

          $('div.item_image.big img').filter(function(){
              json.img = $(this).attr("src");
              json.img = json.img.replace(/(\r\n|\n|\r|\t|  )/gm,"");
          })

          $('h2.clearfix span.property').filter(function(){
              if ($(this).text() == "Surface")
                json.superf = $(this).next().text();
          })

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


      }

      // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
      res.send(json);
  })

  return res;


}) // end of app.get(/backend)


module.exports = apiRoutes;

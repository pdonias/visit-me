var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.use(express.static('public'));

app.get('/', function(req, res){
  app.use('/', express.static(__dirname + '/'));
});

/*
app.get('/backend', function(req, res){
  url = 'https://www.leboncoin.fr/locations/990447993.htm?ca=22_s';
  request(url, function(error, response, html){
    var $ = cheerio.load(html);
    fs.writeFile('tmp.html', $.html());
    res.send('tmp.html');
  });
});
*/

app.get('/backend', function(req, res){

  url = 'https://www.leboncoin.fr/locations/1073612460.htm?ca=22_s';

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request(url, function(error, response, html){

      // First we'll check to make sure no errors occurred when making the request

      if(!error){
          // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

          var $ = cheerio.load(html);

          // Finally, we'll define the variables we're going to capture

          var json = { title : "", price : "", desc : "", img : "", superf : "",
        tel : "", addr : ""};

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
      /*
      fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

          console.log('File successfully written! - Check your project directory for the output.json file');

      })
      */

      console.log(json);

      // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
      res.send(json);
  })

  return res;


}) // end of app.get(/backend)


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;

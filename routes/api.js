var express = require('express')
var request = require('request')
var cheerio = require('cheerio')
// var jsonframe = require('jsonframe-cheerio')
var moment = require('moment')
var extractAddresses = require('address-extractor')
var extractInfo = require('./info-extractor.js')
var iconv = require('iconv-lite')

var searchLeboncoin = require('./search-leboncoin.js')
var searchSeloger = require('./search-seloger.js')

var parser = require('./parser.js')

var List = require('../models/List.js')

// bundle our routes
var apiRoutes = express.Router()

/*

  POST /api/list
In order to create or update a list

*/
apiRoutes.post('/list', function (req, res) {
  // We're looking for an already existing list with email
  // console.log(req.body);
  var query = {'_id': req.body._id}

  req.body.lastsave = moment().locale('fr').format('LLLL')

  // If we find one, we update, otherwise we create
  List.findOneAndUpdate(query, req.body, {upsert: true}, function (err, doc) {
    if (err) return res.send(500, { error: err })
    return res.send(req.body.lastsave)
  })
})

apiRoutes.post('/list/create', function (req, res, next) {
  var ls = moment().locale('fr').format('LLLL')
  List.create({ lastsave: ls, list: [] }, function (_, small) {
    // TODO handle error
    res.send(small.id)
    return small.id
  })
})

apiRoutes.post('/getinfo', function (req, res, next) {
  var search = req.body.search

  Promise.all([ searchLeboncoin(search), searchSeloger(search) ]).then(
  function (results) {
    var result = results[0].concat(results[1])
    result.sort(function (a, b) {
      // Turn your strings into dates, and then subtract them
      // to get a value that is either negative, positive, or zero.
      return new Date(b.date) - new Date(a.date)
    })
    // result = result.concat(getListSeLoger())
    res.send(result)
  }
)
})

apiRoutes.get('/list/:id', function (req, res, next) {
  List.findOne({'_id': req.params.id}, function (err, list) {
    if (err) return next(err)
    res.json(list)
  })
})

/*

  POST /api/annonce
In order to parse an annonce

*/
apiRoutes.post('/annonce', function (req, res) {
  const url = req.body.link

  // The structure of our request call
  // The first parameter is our URL
  // The callback function takes 3 parameters, an error, response status code and the html

  request.get({
    uri: url,
    encoding: null
  }, function (error, response, html) {
      // First we'll check to make sure no errors occurred when making the request
    if (!error) {
      var json = { title: '', price: '', desc: '', img: '', superf: '', tel: '', addr: 'ERROR' }

      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
      if (url.includes('boncoin')) {
        const frame = {
          title: '.no-border',
          price: 'h2.item_price span.value || [0-9| ]+',
          desc: 'p[itemprop=description]',
          img: 'div.item_image.big.popin-open.trackable < html || src="(.*?)"',
          superf: {
            _s: 'section.properties',
            _p: /Surface (\d+) m2/
          }
        }
        json = parser(cheerio.load(iconv.decode(html, 'iso-8859-1')), frame)
      } else if (url.includes('seloger')) {
        const frame = {
          title: 'h1',
          price: '#price || [0-9| ]+',
          desc: 'p.description',
          img: 'ul#slider1 < html || src="(.*?)"',
          superf: {
            _s: 'ol.description-liste',
            _p: /Surface de (\d+)/
          }
        }
        json = parser(cheerio.load(html), frame)
      } else if (url.includes('pap')) {
        const frame = {
          title: 'h1',
          price: '.price || [0-9| ]+',
          desc: 'p.item-description',
          img: 'div[data-hash=image0] img@src',
          superf: {
            _s: 'ul.item-summary',
            _p: /Surface (\d+) m/
          }
        }
        json = parser(cheerio.load(iconv.decode(html, 'iso-8859-1')), frame)
      } else if (url.includes('paruvendu')) {
        const frame = {
          title: 'h1.auto2012_dettophead1txt1',
          price: '#autoprix || [0-9| ]+',
          desc: '.im12_txt_ann.im12_txt_ann_auto',
          img: 'div.imdet15-blcphomain < html || src="(.*?)"',
          superf: {
            _s: 'ul.imdet15-infoscles',
            _p: /(\d+)m2/
          }
        }
        json = parser(cheerio.load(iconv.decode(html, 'iso-8859-1')), frame)
      } else if (url.includes('fnaim38')) {
        const frame = {
          title: '',
          price: '.prix || [0-9| ]+',
          desc: '.description',
          img: 'div.imageBig < html || src="(.*?)"',
          superf: {
            _s: '.informations',
            _p: /Surface habitable : (\d+) m/
          }
        }
        json = parser(cheerio.load(html), frame)
      } else if (url.includes('mobile.avendrealouer')) {
        const frame = {
          title: '',
          price: '.prix || [0-9| ]+',
          desc: '.description',
          img: '#slideList < html || src="(.*?)"',
          superf: {
            _s: '.details',
            _p: /(\d+) Surface/
          }
        }
        json = parser(cheerio.load(html), frame)
      } else if (url.includes('avendrealouer')) {
        const frame = {
          title: '',
          price: '#fd-price-val || [0-9| ]+',
          desc: '#propertyDesc',
          img: '.topSummary < html || src="(.*?)"',
          superf: {
            _s: '#table',
            _p: /Surface: (\d+) m/
          }
        }
        json = parser(cheerio.load(html), frame)
      } else if (url.includes('logic')) {
        const frame = {
          title: '',
          price: 'h2.main-price || [0-9| ]+',
          desc: '.offer-description-text',
          img: '#photo < html || src="(.*?)"',
          superf: {
            _s: 'span.offer-area-number',
            _p: /Surface: (\d+) m/
          }
        }
        json = parser(cheerio.load(html), frame)
      }

      // Finally, we'll define the variables we're going to capture
      json.link = req.body.link
    }

    // Debug
    console.log(json)

    res.send(json)
  })

  return res
}) // end of app.get(/backend)

module.exports = apiRoutes

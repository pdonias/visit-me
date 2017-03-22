var express = require('express')
var request = require('request')
var moment = require('moment')

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

  request.get({
    uri: url,
    encoding: null
  }, function (error, response, html) {
    if (!error) {
      // TODO : change this to res.send(parser(url, html))
      const json = parser(url, html)
      console.log(json)
      res.send(json)
    }
  })

  return res
})

module.exports = apiRoutes

var express = require('express')
var List = require('../models/List.js')
var router = express.Router()

/* GET home page. */
router.get('*', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/list/:id', function (req, res, next) {
  List.find({'_id': req.params.id}, function (err, list) {
    if (err) return next(err)
    res.json(list)
  })
})

module.exports = router

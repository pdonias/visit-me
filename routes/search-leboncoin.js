const _ = require('lodash')

const cheerio = require('cheerio')
const jsonframe = require('jsonframe-cheerio')
const request = require('request')

const frame = {
  'price': 'h3',
  'superf': '',
  'img': 'img@src',
  'url': 'a@href',
  'title': 'h2',
  'info': '',
  'date': 'p[itemprop=availabilityStarts]@content',
  'time': 'p[itemprop=availabilityStarts]'
}
const baseUrl = 'https://www.leboncoin.fr/'

// Price when you buy
const mapPrice = [0, 25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 500000, 450000, 500000, 550000, 600000, 650000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 2000000, 999999999]
const mapSurface = [0, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 200, 300, 500, 9999]

// Converts Veasit's search terms into GET params for third-party API
function convert (search) {
  const s = {}

  const promise = new Promise(function (resolve, reject) {
    s.type = (search.search_type === 'buy' ? 'ventes_immobilieres' : 'locations')
    s.idtypebien = '&ret=' + (search.house_type === 'house' ? 1 : 2)

    // Manage superficy
    let i = 0
    if (search.superf_min) {
      while (search.superf_min > mapSurface[i]) {
        i++
      }
      s.surfacemin = '&sqs=' + i
    }
    if (search.superf_max) {
      i = 0
      while (search.superf_max > mapSurface[i]) {
        i++
      }
      s.surfacemax = '&sqe=' + i
    }
    // On LeBonCoin price is managed differently depending on if you buy or rent
    if (search.search_type === 'buy') {
      if (search.price_min) {
        while (search.price_min > mapPrice[i]) {
          i++
        }
        s.pricemin = '&ps=' + i
      }
      if (search.price_max) {
        i = 0
        while (search.price_max > mapPrice[i]) {
          i++
        }
        s.pricemax = '&pe=' + i
      }
    } else {
      if (search.price_min) {
        s.pricemin = '&mrs=' + search.price_min
      }
      if (search.price_max) {
        s.pricemax = '&mre=' + search.price_max
      }
    }

    const urlApi = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=correspondance-code-insee-code-postal&q=' + search.cp + '&facet=nom_region'
    request.get({
      url: urlApi,
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err)
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode)
      } else {
        s.region = _.get(data, 'facet_groups[0].facets[0].name').replace(/'|-| /g, '_').toLowerCase()
        resolve(s)
      }
    })
  })
  return promise
}

module.exports = function (search) {
  return new Promise(function (resolve, reject) {
    let s = {}
    const promise = convert(search)
    promise.then(function (result) {
      s = result

      let searchUri = baseUrl + s.type + '/offres/' + s.region + '/?th=1&location=' + search.cp + '&parrot=0' + s.surfacemin + s.surfacemax + s.pricemin + s.pricemax + s.idtypebien

      console.log('search-leboncoin.js | ' + 'searchUri: ' + searchUri)

      let res = []
      request.get({
        uri: searchUri,
        encoding: null
      }, function (error, response, html) {
        // First we'll check to make sure no errors occurred when making the request
        if (!error) {
          let $ = cheerio.load(html, {
            normalizeWhitespace: true,
            xmlMode: false
          })
          $('section.tabsContent ul li').each(function (i, elem) {
            jsonframe($)
            res[i] = $(this).scrape(frame, { string: false })
            res[i].date = res[i].date + 'T' + res[i].time.substr(res[i].time.length - 5) + ':00'
            res[i].price = res[i].price.substr(0, res[i].price.length - 2)
          })
          resolve(res)
        } // endof if !error
      }) // endof request.get
    })
  })
}

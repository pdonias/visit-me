let cheerio = require('cheerio')
let jsonframe = require('jsonframe-cheerio')
let request = require('request')

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
  let s = {}
  s.type = (search.search_type === 'buy' ? 'ventes_immobilieres' : 'locations')

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
  return s
}

module.exports = function (search) {
  return new Promise(function (resolve, reject) {
    let s = convert(search)

    let searchUri = baseUrl + s.type + '/offres/rhone_alpes/?th=1&location=Grenoble%2038000&parrot=0' + s.surfacemin + s.surfacemax + s.pricemin + s.pricemax

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
}

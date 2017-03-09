const _ = require('lodash')

const cheerio = require('cheerio')
const jsonframe = require('jsonframe-cheerio')
const request = require('request')

const frame = {
  'price': 'prix',
  'superf': 'surface',
  'img': 'firstThumb',
  'url': 'permaLien',
  'title': 'titre',
  'info': 'libelle',
  'date': 'dtCreation'
}
const baseUrl = 'http://ws.seloger.com/search.xml'

// Converts Veasit's search terms into GET params for third-party API
function convert (search) {
  const s = {}

  var promise = new Promise(function (resolve, reject) {
    s.idtt = '&idtt=' + (search.search_type === 'buy' ? 2 : 1)
    s.idtypebien = '&idtypebien=' + (search.house_type === 'house' ? 2 : 1)

    if (search.price_min) {
      s.pxmin = '&pxmin=' + search.price_min
    }
    if (search.superf_min) {
      s.surfacemin = '&surfacemin=' + search.superf_min
    }
    if (search.price_max) {
      s.pxmax = '&pxmax=' + search.price_max
    }
    if (search.superf_max) {
      s.surfacemax = '&surfacemax=' + search.superf_max
    }

    var urlApi = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=correspondance-code-insee-code-postal&q=' + search.cp + '&facet=insee_com&facet=code_comm'
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
        const dep = _.get(data, 'facet_groups[0].facets[0].name[0]') + _.get(data, 'facet_groups[0].facets[0].name[1]')
        const comm = _.get(data, 'facet_groups[1].facets[0].name')
        s.location = `?ci=${dep}0${comm}`
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

      const searchUri = baseUrl + s.location + s.idtypebien + s.pxmin + s.surfacemin + s.pxmax + s.surfacemax + s.idtt + '&tri=d_dt_crea'
      console.log('SEARCHURI', searchUri)

      const annoncesSeLoger = []
      request.get({
        uri: searchUri,
        encoding: null
      }, function (error, response, html) {
        // First we'll check to make sure no errors occurred when making the request
        if (!error) {
          const $ = cheerio.load(html, {
            normalizeWhitespace: true,
            xmlMode: true
          })
          $('recherche annonces annonce').each(function (i, elem) {
            jsonframe($)
            annoncesSeLoger[i] = $(this).scrape(frame, { string: false })
            // annoncesSeLoger[i].date = moment(annoncesSeLoger[i].date, 'YYYY-MM-DDThh:mm:ss').fromNow()
          })
          resolve(annoncesSeLoger)
        } // endof if !error
      }) // endof request.get
    }, function (err) {
      console.log(err) // Error: "It broke"
    })
  })
}

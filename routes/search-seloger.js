const _ = require('lodash')

const cheerio = require('cheerio')
const jsonframe = require('jsonframe-cheerio')
const request = require('request')

const frame = {
  price: 'prix',
  superf: 'surface',
  img: 'firstThumb',
  url: 'permaLien',
  title: 'titre',
  info: 'libelle',
  date: 'dtCreation'
}
const baseUrl = 'http://ws.seloger.com/search.xml'

// Converts Veasit's search terms into GET params for third-party API
function convert (search) {
  return new Promise(function (resolve, reject) {
    const s = {}

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

    const urlApi = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=correspondance-code-insee-code-postal&q=' + search.cp + '&facet=insee_com&facet=code_comm'
    request.get({
      url: urlApi,
      json: true,
      headers: {'User-Agent': 'request'}
    }, (err, res, data) => {
      if (err) {
        reject(err)
      } else if (res.statusCode !== 200) {
        reject(new Error(`Bad status code ${res.statusCode}`))
      } else {
        const dep = _.get(data, 'facet_groups[0].facets[0].name[0]') + _.get(data, 'facet_groups[0].facets[0].name[1]')
        const comm = _.get(data, 'facet_groups[1].facets[0].name')
        s.location = `?ci=${dep}0${comm}`
        resolve(s)
      }
    })
  })
}

module.exports = function (search) {
  return new Promise(function (resolve, reject) {
    let s = {}
    convert(search).then(function (result) {
      s = result

      let searchUri = baseUrl + s.location + s.idtypebien + s.idtt + '&tri=d_dt_crea'
      if (!_.isUndefined(s.surfacemin)) searchUri += s.surfacemin
      if (!_.isUndefined(s.surfacemax)) searchUri += s.surfacemax
      if (!_.isUndefined(s.pxmin)) searchUri += s.pxmin
      if (!_.isUndefined(s.pxmax)) searchUri += s.pxmax

      console.log('search-leboncoin.js | ' + 'searchUri: ', searchUri)

      const res = []
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
            res[i] = $(this).scrape(frame, { string: false })
            // res[i].date = moment(res[i].date, 'YYYY-MM-DDThh:mm:ss').fromNow()
          })
          resolve(res)
        } else {
          reject(error)
        }
      }) // endof request.get
    }, function (err) {
      reject(err)
    })
  })
}

const _ = require('lodash')

const cheerio = require('cheerio')
const jsonframe = require('jsonframe-cheerio')
const iconv = require('iconv-lite')

const extractAddresses = require('address-extractor')
const extractInfo = require('./info-extractor.js')

const iconvNeeded = {
  boncoin: true,
  seloger: false,
  pap: true,
  paruvendu: true,
  fnaim: false,
  avendrealouer: false,
  'mobile.avendrealouer': false
}

const frames = {
  boncoin: {
    title: '.no-border',
    price: 'h2.item_price span.value || [0-9| ]+',
    desc: 'p[itemprop=description]',
    img: 'div.item_image.big.popin-open.trackable < html || src="(.*?)"',
    superf: {
      _s: 'section.properties',
      _p: /Surface (\d+) m2/
    }
  },
  seloger: {
    title: 'h1',
    price: '#price || [0-9| ]+',
    desc: 'p.description',
    img: 'ul#slider1 < html || src="(.*?)"',
    superf: {
      _s: 'ol.description-liste',
      _p: /Surface de (\d+)/
    }
  },
  pap: {
    title: 'h1',
    price: '.price || [0-9| ]+',
    desc: 'p.item-description',
    img: 'div[data-hash=image0] img@src',
    superf: {
      _s: 'ul.item-summary',
      _p: /Surface (\d+) m/
    }
  },
  paruvendu: {
    title: 'h1.auto2012_dettophead1txt1',
    price: '#autoprix || [0-9| ]+',
    desc: '.im12_txt_ann.im12_txt_ann_auto',
    img: 'div.imdet15-blcphomain < html || src="(.*?)"',
    superf: {
      _s: 'ul.imdet15-infoscles',
      _p: /(\d+)m2/
    }
  },
  fnaim38: {
    title: '',
    price: '.prix || [0-9| ]+',
    desc: '.description',
    img: 'div.imageBig < html || src="(.*?)"',
    superf: {
      _s: '.informations',
      _p: /Surface habitable : (\d+) m/
    }
  },
  logic: {
    title: '',
    price: 'h2.main-price || [0-9| ]+',
    desc: '.offer-description-text',
    img: '#photo < html || src="(.*?)"',
    superf: {
      _s: 'span.offer-area-number',
      _p: /Surface: (\d+) m/
    }
  },
  avendrealouer: {
    title: '',
    price: '#fd-price-val || [0-9| ]+',
    desc: '#propertyDesc',
    img: '.topSummary < html || src="(.*?)"',
    superf: {
      _s: '#table',
      _p: /Surface: (\d+) m/
    }
  },
  'mobile.avendrealouer': {
    title: '',
    price: '.prix || [0-9| ]+',
    desc: '.description',
    img: '#slideList < html || src="(.*?)"',
    superf: {
      _s: '.details',
      _p: /(\d+) Surface/
    }
  }
}

var parser = function ($, frame) {
  jsonframe($)

  // Get data
  var json = $('body').scrape(frame, { string: false })

  // Remove spaces from price
  json.price = json.price.replace(' ', '') + ' €'
  // Add m2 to surface
  json.superf = json.superf + ' m²'
  // Fetch address from description
  json.address = extractAddresses(json.desc)[0] || 'À définir'
  // Fetch information
  json.info = extractInfo(json.desc.toLowerCase())
  // Summarise this info in the notes field
  json.notes = ''
  for (var i = 0; i < json.info.length; i++) {
    if (json.info[i].text !== '') json.notes += json.info[i].text + '\n'
  }

  return json
}

/*
parser
------
- input : url to parse and html loaded from a request call
- output: a json containing all info about the entry
*/
module.exports = function (url, html) {
  let f, l
  _.forEach(frames, function (value, key) {
    if (url.includes(key)) {
      // Get the adequate frame for the website
      f = value
      // Get if we need to decode or not
      if (iconvNeeded[key]) l = cheerio.load(iconv.decode(html, 'iso-8859-1'))
      else l = cheerio.load(html)
    }
  })

  var json = parser(l, f)
  json.link = url

  return json
}

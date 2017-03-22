angular.module('veasit.controllers', ['veasit.constants'])

.controller('ListController', function ($scope, $http, $location, ngProgressFactory, API_ENDPOINT, _) {
  $scope.view = 'search'
  $scope.search = {}

  $scope.changeView = function (txt) {
    $scope.view = txt
  }

  $scope.readableWebsites = [
    {url: 'https://www.leboncoin.fr', name: 'Le Bon Coin', img: 'https://upload.wikimedia.org/wikipedia/fr/thumb/7/7d/Leboncoin.fr_Logo_2016.svg/1280px-Leboncoin.fr_Logo_2016.svg.png'},
    {url: 'http://www.fnaim38.com', name: 'FNAIM38', img: 'http://www.fnaim38.com/uploads/Image/bf/4428_868_3618_320_logofna38-3.png'},
    {url: 'http://www.seloger.com', name: 'SeLoger', img: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Seloger-logo.gif'},
    {url: 'http://www.avendrealouer.fr', name: 'AVendreALouer', img: 'http://www.ordissinaute.fr/sites/default/files/styles/full_new_main_no_crop/public/field/image/avendrealouer-logo_0.jpg?itok=FxzOnyRR'},
    {url: 'http://www.pap.fr', name: 'PAP', img: 'http://www.pap.fr/images/logo-pap-127x70.png'},
    {url: 'http://www.paruvendu.fr', name: 'ParuVendu', img: 'http://static.paruvendu.com/2017022108/communfo/img/structuresite/home/logoparuvendufr2016.png'},
    {url: 'http://www.logic-immo.com', name: 'LogicImmo', img: 'http://static.paruvendu.com/2017022108/communfo/img/structuresite/home/logoparuvendufr2016.png'}
  ]

  $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/
  $scope.linkFormat = /https?:\/\/((www|mobile|m)\.)?(logic-immo|fnaim38|leboncoin|avendrealouer|paruvendu|pap|seloger)\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/

  $scope.data = {
    title: '',
    list: [],
    lastsave: ''
  }

  // TODO maybe something cleaner here ?
  $http.get('/api' + $location.path()).then(function (result) {
    $scope.data = result.data
  })

  // By default, there are no unsaved changes
  $scope.unsaved_changes = false

  // If the user changes an input, we trigger
  $scope.changed = function () {
    $scope.unsaved_changes = true
    if ($scope.data.email != null || $scope.data.email !== '') $scope.save()
  }

  // When he clicks save, the changes are saved to the DB
  $scope.save = function () {
    if ($scope.data.email != null) {
      $scope.saving = true
      // send to DB
      $http.post(API_ENDPOINT.url + '/list', $scope.data).then(function (result) {
        // console.log(result);
        $scope.data.lastsave = result.data
      })

      $scope.unsaved_changes = false
      $scope.saving = false
    }
  }

  $scope.delete = function (index) {
    // Had to do this because of reverse order in view
    var x = index - ($scope.data.list.length - 1)
    $scope.data.list.splice(Math.abs(x), 1)
    $scope.unsaved_changes = true
    if ($scope.data.email != null) $scope.save()
  }

  // Add a link to the table

  $scope.sendLink = function (url) {
    $scope.adding = true
    $scope.progressbar = ngProgressFactory.createInstance()
    // $scope.progressbar.setColor('white');
    $scope.progressbar.start()
    $scope.loading = true

    // POST request to the back end, with the link
    // the /api/gethtml will pipe to make the request come from the client ip (proxy)
    $http.post(API_ENDPOINT.url + '/gethtml', {'link': url}).then(function (html) {
      // then send the html code to the backend for parsing
      $http.post(API_ENDPOINT.url + '/parse', {'link': url, 'html': html.data}).then(function (result) {
        $scope.progressbar.complete()
        $scope.loading = false

        // Add the result to the array
        $scope.data.list.push(result.data)
        // Apply to update the view
        // $scope.$apply();
        $scope.link = ''
        $scope.unsaved_changes = true
        $scope.adding = false

        if ($scope.data.email != null) $scope.save()
      })
    })
  }

  var boncoin = function (search) {
    const baseUrl = 'https://www.leboncoin.fr/'
    const s = {}
    // Price when you buy
    const mapPrice = [0, 25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 500000, 450000, 500000, 550000, 600000, 650000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 2000000, 999999999]
    const mapSurface = [0, 20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 200, 300, 500, 9999]

    s.type = (search.search_type === 'buy' ? 'ventes_immobilieres' : 'locations')
    s.idtypebien = '&ret=' + (search.house_type === 'house' ? 1 : 2)

    // Manage superficy
    s.surfacemin = '&sqs=' + _.findKey(mapSurface, surf => surf >= (search.superf_min || 0))

    if (search.superf_max) {
      s.surfacemax = '&sqe=' + _.findKey(mapSurface, surf => surf >= search.superf_max)
    }
    // On LeBonCoin price is managed differently depending on if you buy or rent
    if (search.search_type === 'buy') {
      if (search.price_min) {
        s.pricemin = '&ps=' + _.findKey(mapPrice, p => p >= search.price_min)
      }
      if (search.price_max) {
        s.pricemax = '&pe=' + _.findLastKey(mapPrice, p => p <= search.price_max)
      }
    } else {
      if (search.price_min) {
        s.pricemin = '&mrs=' + search.price_min
      }
      if (search.price_max) {
        s.pricemax = '&mre=' + search.price_max
      }
    }

    if (search.cp) {
      const urlApi = 'https://public.opendatasoft.com/api/records/1.0/search/?dataset=correspondance-code-insee-code-postal&q=' + search.cp + '&facet=nom_region'

      $http.get(urlApi).then(function (result) {
        var region = result.data.facet_groups[0].facets[0].name
        if (region) s.region = region.replace(/'|-| /g, '_').toLowerCase()
      })
    }

    let searchUri = baseUrl + s.type + '/offres/' + s.region + '/?th=1&parrot=0&location=' + search.cp + s.idtypebien
    if (!_.isUndefined(s.surfacemin)) searchUri += s.surfacemin
    if (!_.isUndefined(s.surfacemax)) searchUri += s.surfacemax
    if (!_.isUndefined(s.pricemin)) searchUri += s.pricemin
    if (!_.isUndefined(s.pricemax)) searchUri += s.pricemax

    return searchUri
  }

  $scope.search = function () {
    // console.log('ok')
    console.log(boncoin($scope.search))
    /*
    $http.post(API_ENDPOINT.url + '/search', {'search': $scope.search}).then(function (result) {
      $scope.list = result.data
      console.log(result)
    })
    */
  }
})

.controller('HomeController', function ($scope, $http, $window, API_ENDPOINT) {
  // Add a list to the database and get its key
  $scope.createList = function () {
    $http.post(API_ENDPOINT.url + '/list/create').then(function (result) {
      $window.location.href = '/list/' + result.data
    })
  }
})

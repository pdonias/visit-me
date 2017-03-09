angular.module('veasit.controllers', ['veasit.constants'])

.controller('ListController', function ($scope, $http, $location, ngProgressFactory, API_ENDPOINT) {
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
    $http.post(API_ENDPOINT.url + '/annonce', {'link': url}).then(function (result) {
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
  }

  $scope.getInfo = function () {
    $http.post(API_ENDPOINT.url + '/getinfo', {'search': $scope.search}).then(function (result) {
      $scope.list = result.data
      /*
      for (var i in $scope.list) {
        i.date = moment(i.date, 'YYYY-MM-DDThh:mm:ss').fromNow()
      }
      */
      console.log(result)
    })
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

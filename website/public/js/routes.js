angular.module('veasit.routes', ['ngRoute'])

.config([ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        })
        .when('/list/:id', {
            templateUrl: 'templates/list.html',
            controller: 'ListController'
        });

    $locationProvider.html5Mode(true);

}]);

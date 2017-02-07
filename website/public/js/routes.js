angular.module('veasit.routes', ['ngRoute'])

.config([ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider) {

    $routeProvider
        .when('/', {
            templateUrl: 'templates/home.html',
            controller: 'HomeController'
        });

    $locationProvider.html5Mode(true);

}]);

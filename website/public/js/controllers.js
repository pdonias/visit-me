angular.module('veasit.controllers', [])


.controller('ListController', function($scope, $http, $location) {

  $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

  $http.get('/api/list/589c48ffd0a2480d4336b061').then(function(result) {
    console.log(result.data);
    $scope.data = result.data;
  });

  // By default, there are no unsaved changes
  $scope.unsaved_changes = false;

  // If the user changes an input, we trigger
  $scope.changed = function() { $scope.unsaved_changes = true; };

  // When he clicks save, the changes are saved to the DB
  $scope.save = function() {
    if ($scope.data.email != ""){
      $scope.data.lastsave = new Date();

      // send to DB
      console.log($scope.data);
      $http.post('http://localhost:3000/api/list', $scope.data).then(function(result) {
        alert("Liste sauvegardée");
      });

      $scope.unsaved_changes = false;
    }
    else {
      alert("Pour sauvegarder, veuillez entrer une adresse email");
    }

  };

  $scope.share = function() {
    alert("Partagez cette adresse :\n"+$location.$$absUrl);
  };


  // Add a link to the table

  $scope.sendLink = function() {
    // POST request to the back end, with the link
    $http.post('http://localhost:3000/api/annonce', {"link": $scope.link}).then(function(result) {
      // Add the result to the array
      $scope.data.list.push(result.data);
      // Apply to update the view
      $scope.$apply();
    });
  };

});

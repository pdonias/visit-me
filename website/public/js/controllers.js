angular.module('veasit.controllers', [])


.controller('ListController', function($scope, $http, $location) {

  $scope.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;

  $scope.data = {
    title: '',
    list: [{price:'test'}],
    lastsave: ''
  };

  // TODO maybe something cleaner here ?
  $http.get('/api'+$location.path()).then(function(result) {
    $scope.data = result.data;
  });


  // By default, there are no unsaved changes
  $scope.unsaved_changes = false;

  // If the user changes an input, we trigger
  $scope.changed = function() { $scope.unsaved_changes = true; };

  // When he clicks save, the changes are saved to the DB
  $scope.save = function() {
    if ($scope.data.email != ""){
      // send to DB
      $http.post('http://localhost:3000/api/list', $scope.data).then(function(result) {
        alert("Liste sauvegardée");
        //console.log(result);
        $scope.data.lastsave = result.data;
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

  $scope.delete = function(index){
    // Had to do this because of reverse order in view
    var x = index-($scope.data.list.length-1);
    $scope.data.list.splice(Math.abs(x), 1);
  }


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

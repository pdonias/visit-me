angular.module('veasit.services', ['veasit.constants'])

.factory('JourneyFactory', ['$http', '$q', function($http, $q) {

  return {
    all: function() {
      return $http.get('/journeys');
    },

    getForParty: function(id) {
      return $http.get('/journeys/party/'+id);
    },

    create: function(user, journey, id_party){

      var data = {user: user, journey: journey, party: id_party};

      $http.post('/journeys', data).
      then(function(data, status, headers, config) {
        // this callback will be called asynchronously
        // when the response is available
        console.log(data);
      });
    }
  }; // end of return

}])






.factory('PartyFactory', ['$http', '$q', function($http, $q) {
  return {

    all: function() {
      return $http.get('/parties');
    },

    get: function(id) {
      return $http.get('/parties/'+id);
    },

    create: function(party){
      $http.post('/parties', party).
      success(function(data, status, headers, config) {
        console.log(data);
      }).
      error(function(data, status, headers, config) {
      });
    }
  };

}])











.service('AuthService', function($q, $http, API_ENDPOINT) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var isAuthenticated = false;
  var authToken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
    useCredentials(token);
  }

  function useCredentials(token) {
    isAuthenticated = true;
    authToken = token;

    // Set the token as header for your requests!
    $http.defaults.headers.common.Authorization = authToken;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    isAuthenticated = false;
    $http.defaults.headers.common.Authorization = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var register = function(user) {
    return $q(function(resolve, reject) {
      console.log('Posting...');

      $http.post(API_ENDPOINT.url + '/signup', user).then(function(result) {
        if (result.data.success) {
          console.log('success...');

          resolve(result.data.msg);
        } else {
          console.log(result.data.msg);

          reject(result.data.msg);
        }
      });
    });
  };

  var login = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/authenticate', user).then(function(result) {
        if (result.data.success) {
          storeUserCredentials(result.data.token);
          resolve(result.data.msg);
        } else {
          reject(result.data.msg);
        }
      });
    });
  };

  var updateInfo = function(user) {
    return $q(function(resolve, reject) {
      $http.post(API_ENDPOINT.url + '/updateinfo', user).then(function(result) {
        if (result.data.success) {
          storeUserCredentials(result.data.token);
          resolve(result.data.msg);
          console.log(result.data.msg);
        } else {
          console.log("[services.js] updateInfo failed");

          reject(result.data.msg);
        }
      });
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  loadUserCredentials();

  return {
    login: login,
    register: register,
    logout: logout,
    updateInfo: updateInfo,
    isAuthenticated: function() {return isAuthenticated;},
  };
})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
      }[response.status], response);
      return $q.reject(response);
    }
  };
})


.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');

  $httpProvider.interceptors.push(function($q, $location){
    return{
      response : function(response){
        return response;
      },
      responseError : function(response){
        if (response.status === 401){
          $location.url('/login');
        }
        return $q.reject(response);
      }
    }
  });

})

.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);

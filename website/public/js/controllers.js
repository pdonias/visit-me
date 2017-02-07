angular.module('veasit.controllers', [])


.controller('HomeController', function($scope, $http) {

  $scope.annonces = {1: {
      img:"https://img3.leboncoin.fr/ad-image/f04f4d65abfefed52b3a297e3256361529ef9087.jpg",
      price:"340 €",
      superf:"12 m2",
      address:"19 rue Hébert",
      contact:"06 32 84 64 47",
      desc:"Dans bâtiment privé situé au 19 rue Hébert à Grenoble au milieu d'un parc privatif hyper calme, studio ensoleillé au 2ème étage. Proche de toutes commodités et à 2 minutes à pieds des 3 lignes de tram. Le loyer est de 300 euros et les charges de 40 euros sont fixes et non réajustées pendant toute la durée de la location. Elles comprennent chauffage, eau chaude, eau froide, électricité. La taxe d'habitation est à la charge du locataire. Appeler au 06 32 84 64 47 pour visites. Grand hall privatif pour vélos et grand grenier pour débarras"
    },
    2: {
      img:"https://img1.leboncoin.fr/ad-image/cf172e17b3e51f53975af9aa6bb8678433537ee7.jpg",
      price:"350 €",
      superf:"17 m2",
      address:"À définir",
      contact:"06 35 93 92 02",
      desc:"Lumineux , calme , proche commerces et marché. Bus pour campus à 5mn. Clic-clac, bureau, cuisine équipée. Libre le 13/02/17"},
    3: {
      img:"https://img0.leboncoin.fr/ad-image/0dd7a13ae01c610610fda19359ae2af177a5dd43.jpg",
      price:"316 €",
      superf:"16 m2",
      address:"29 Bd Maréchal Foch",
      contact:"04 76 86 69 69",
      desc:"ISERE GRENOBLE 29 BOULEVARD MARECHAL FOCH Superbe studio meublé en très bon état avec mezzanine pour couchage, kitchenette équipée, chauffage individuel électrique, ascenseur, digicode, idéal étudiant tram direct Domaine Universitaire, secteur recherché proche toutes commodités Référence annonce : 3254 Honoraires : 214 € sDépôt de garantie : 300 € Montant des charges : 16 € / mois"},
    4: {
      img:"https://img3.leboncoin.fr/ad-image/f04f4d65abfefed52b3a297e3256361529ef9087.jpg",
      price:"353 €",
      superf:"19 m2",
      address:"4 Ter Rue Ponsard",
      contact:"04 76 47 35 00",
      desc:"STUDIO 4 TER RUE PONSARD 38100 GRENOBLE (STUDIO 24)4 Ter Rue Ponsard - Proximité MOUNIER - IUFM - Studio meublé - 2 ème étage - chauffage électrique - eau froide collective - double vitrage - digicode - disponible le 20/02/2017 - frais état des lieux 44.50euro - Loyer 330euro + 23 euroCharges - Honos 198.30euro NAHMIAS IMMOBILIER 04 76 473 500 Référence annonce : 4_TER_RUE_PONSARD Honoraires : 198 € Dépôt de garantie : 660 €"
  }};

  $scope.sendLink = function() {
    $http.post('http://localhost:3000/api/annonce', {"link": $scope.link}).then(function(result) {
      $scope.result = result.data;
      /*
      $scope.annonces.push({1: "test"});
      console.log($scope.annonces);
      console.log($scope.result);
      */


    });
  };

});

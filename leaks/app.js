// angular app name
angular.module('firstApp', [])
.controller('mainController', function($scope,$http){

  //binding to view-model
  var vm = this;

  $http.get('data.json')
  .then(function(data){
    vm.works = data.data;
    //console.log(data.data);


  vm.artists=[];
  //function counter for json elements
  vm.getCount=function(group) {
    var count = 0;
    for (var i = 0; i < vm.works.length; i++) {
      if (vm.works[i].artist == group) {
        count++;
      }
    }
    vm.artists.push({"name": group, count});
    //console.log ({"name": group, count});
    //console.log(vm.artists);
  };

  var keyStr=[];
  var displays=[];

  var counter=0;

  for (var i=0; i < vm.works.length; i ++){
    counter++;
    if(keyStr.indexOf(vm.works[i].artist) == -1) keyStr.push(vm.works[i].artist);
  };
  //console.log(keyStr);


  for (var j = 0; j < keyStr.length; j++) {
    vm.getCount(keyStr[j]);
  };

  //console.log("total artist: "+keyStr.length);
  //console.log("total works: "+vm.works.length);
  vm.selected = 'test';
  });
});

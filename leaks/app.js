// angular app name
angular.module('firstApp', [])
.controller('mainController', function($scope,$http){
  //binding to view-model
  var vm = this;

  $http.get('data.json')
  .then(function(data){
    vm.works=[];
    for(var k=0;k<data.data.length;k++){
      var accStr = data.data[k].accession.split(".")[0];
      if(accStr.length == 2){
        accStr = "19"+accStr;
      }else if(accStr == "P"){
        accStr = data.data[k].accession.split(".")[1];
        accStr = "19"+accStr;
      }else {
        accStr = accStr;
      }
      vm.works.push({
        "id": data.data[k].id,
        "img": data.data[k].img,
        "artist": data.data[k].artist,
        "title": data.data[k].title,
        "date": data.data[k].date,
        "medium": data.data[k].medium,
        "dimension": data.data[k].dimension,
        "credit": data.data[k].credit,
        "accession": accStr,
        "copyright": data.data[k].copyright
      })
    }
    //vm.works = data.data;
    //console.log(vm.works[0].accession.length);

    //func for artist search
    vm.artists=[];
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

    var keyStr=[],
    keyStr2=[],
    counter=0;

    //indexing
    for (var i=0; i < vm.works.length; i++){
      counter++;
      if(keyStr.indexOf(vm.works[i].artist) == -1) keyStr.push(vm.works[i].artist);
      if(keyStr2.indexOf(vm.works[i].accession) == -1)keyStr2.push(vm.works[i].accession);
    };


    for (var j = 0; j < keyStr.length; j++) {
      vm.getCount(keyStr[j]);
    };

    //console.log("total artist: "+keyStr.length);
    //console.log("total works: "+vm.works.length);


    //test func for accession (working)
    vm.accessions=[];
    vm.accCount = function(group){
      var count = 0;
      for (var i = 0; i < vm.works.length; i++) {
        if (vm.works[i].accession == group) {
          count++;
        }
      }
      vm.accessions.push({"accession": group, count});
      //console.log ({"accession": group, count});
      //console.log(vm.artists);
    };

    for (var j = 0; j < keyStr2.length; j++) {
      vm.accCount(keyStr2[j]);
    };

    
  });
});

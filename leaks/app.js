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
        if(accStr.length==2)accStr = "19"+accStr;
        else accStr = accStr;
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


    var keyStr=[], //artist
    keyStr2=[],   //accession
    keyStr3=[],   //date
    keyStr4=[],   //title
    keyStr5=[],  //medium
    keyStr6=[];  //dimension

    vm.artists=[],
    vm.accessions=[],
    vm.dates=[],
    vm.titles=[],
    vm.mediums=[],
    vm.dimensions=[],
    vm.col=0;


    //counter function
    vm.getCount=function(group,key) {
      var count = 0;

      //artist
      if(key == "artist"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].artist == group) {
            count++;
          }
        }
        vm.artists.push({"name": group, count});
        //console.log ({"name": group, count});
        //console.log(vm.artists);
      }

      //accession
      if(key =="accession"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].accession == group) {
            count++;
          }
        }
        vm.accessions.push({"accession": group, count});
        //console.log ({"accession": group, count});
        //console.log(vm.artists);
      }

      //date
      if(key =="date"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].date == group) {
            count++;
          }
        }
        vm.dates.push({"date": group, count});
        //console.log(vm.dates);
      }

      //title
      if(key =="title"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].title == group) {
            count++;
          }
        }
        vm.titles.push({"title": group, count});
        //console.log(vm.titles);
      }

      //medium
      if(key =="medium"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].medium == group) {
            count++;
          }
        }
        vm.mediums.push({"medium": group, count});
        //console.log(vm.mediums);
      }

      //dimension
      if(key =="dimension"){
        for (var i = 0; i < vm.works.length; i++) {
          if (vm.works[i].dimension == group) {
            count++;
          }
        }
        vm.dimensions.push({"dimension": group, count});
        //console.log(vm.dimensions);
      }

    };

    vm.Output = function(){
      var counter =0;
      for (var i=0; i < vm.works.length; i++){
        counter++;
        if(keyStr.indexOf(vm.works[i].artist) == -1) keyStr.push(vm.works[i].artist);
        if(keyStr2.indexOf(vm.works[i].accession) == -1)keyStr2.push(vm.works[i].accession);
        if(keyStr3.indexOf(vm.works[i].date) == -1)keyStr3.push(vm.works[i].date);
        if(keyStr4.indexOf(vm.works[i].title) == -1)keyStr4.push(vm.works[i].title);
        if(keyStr5.indexOf(vm.works[i].medium) == -1)keyStr5.push(vm.works[i].medium);
        if(keyStr6.indexOf(vm.works[i].dimension) == -1)keyStr6.push(vm.works[i].dimension);
      };
      //count for artist
      for (var j = 0; j < keyStr.length; j++) {
        vm.getCount(keyStr[j],"artist");
      };
      //count for accesion
      for (var j = 0; j < keyStr2.length; j++) {
        vm.getCount(keyStr2[j],"accession");
      };

      //counter for date
      for (var j = 0; j < keyStr3.length; j++) {
        vm.getCount(keyStr3[j],"date");
      };

      //counter for title
      for (var j = 0; j < keyStr4.length; j++) {
        vm.getCount(keyStr4[j],"title");
      };

      //counter for medium
      for (var j = 0; j < keyStr5.length; j++) {
        vm.getCount(keyStr5[j],"medium");
      };

      //counter for dimension
      for (var j = 0; j < keyStr6.length; j++) {
        vm.getCount(keyStr6[j],"dimension");
      };
    }

    console.log(keyStr3);

    vm.Output();

    vm.minAcc= Math.min.apply(Math,vm.accessions.map(function(item){return item.accession;}));
    vm.maxAcc= Math.max.apply(Math,vm.accessions.map(function(item){return item.accession;}));

    vm.rangeAcc = vm.maxAcc - vm.minAcc;

    vm.minDate =1870;
    vm.maxDate =2012;

    vm.rangeDate = vm.maxDate-vm.minDate;

    console.log(keyStr3);
  });
});

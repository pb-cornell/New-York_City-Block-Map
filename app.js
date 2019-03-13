var filterText = ko.observable("");
var map;
var infoWindow;
// nytimes API
var apiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=1bd4e60121e6486ca0815e445e56fcf5&q=";

// 5个地址对象
var placesData = [{
  position: {lat: 40.7713024, lng: -73.9632393},
  title: "Park Ave Penthouse"
},{
  position: {lat: 40.7444883, lng: -73.9949465},
  title: "Chelsea Loft"
},{
  position: {lat: 40.7347062, lng: -73.9895759},
  title: 'Union Square Open Floor Plan'
},{
  position: {lat: 40.7281777, lng: -73.984377},
  title: 'East Village Hip Studio'
},{
  position: {lat: 40.7180628, lng: -73.9961237},
  title: 'Chinatown Homey Space'
}
];

var  Place = function(data){
  var self = this;

  this.position = data.position;
  this.title = data.title
// 地图标记属性
  this.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    animation: google.maps.Animation.DROP
  });
// 可见属性
  this.visible = ko.computed(function(){
    var placeName = self.title.toLowerCase();
    var re = filterText().toLowerCase();
    return (placeName.indexOf(re) != -1);
  });
// 地图标记点击属性
  google.maps.event.addListener(this.marker, "click", function(){
    infoWindow.setContent(self.title);
    infoWindow.open(map, self.marker);

    //动画效果
    if (self.marker.getAnimation() != null){
      self.marker.setAnimation(null);
    }else{
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function(){
        self.marker.setAnimation(null);}, 2000);
      }
    // 异步加载
    $.ajax({
      url: apiUrl + self.title,
      dataType: "json",
      timeout: 5000
    }).done(function(data){
      infoWindow.setContent(data.response.docs[0].snippet);
      infoWindow.open(map, self.marker)
    }).fail(function(){
      alert("API加载错误.")
    });
  });
}

// 视图模型
var ViewModel = function() {
  var self = this;
  // 触发google地图标记的click事件
  this.listClick = function(place) {
    google.maps.event.trigger(place.marker, "click");
  }

  this.placesList = [];

  placesData.forEach(function(data){
    self.placesList.push(new Place(data));
  });
  this.placesList.forEach(function(place){
    place.marker.setMap(map, place.position)
  });
// 过滤地址属性
  this.filteredList = ko.computed(function(){
    var result =[];
    self.placesList.forEach(function(place){
      if (place.visible()){
        result.push(place);
        place.marker.setMap(map, place.position);
      }else{
        place.marker.setMap(null);
      }
    });
    return result;
  });
}
//初始化地图
function start(){
  map = new google.maps.Map(document.getElementById("map"), {center: placesData[2].position,zoom: 13});
  infoWindow = new google.maps.InfoWindow();
  ko.applyBindings(new ViewModel());
}

// googleError()
function googleError(){
  window.alert("There was a problem with GoogleMap,please try again later");
}

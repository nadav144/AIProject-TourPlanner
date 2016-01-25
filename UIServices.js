/**
 * Created by OdedA on 25-Jan-16.
 */

function log(content){
    console.log(content);
}

function error(content) {
    console.error(content);

}

infowindow = new google.maps.InfoWindow();

function createMarker(place, map) {
    var placeLoc = place.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}
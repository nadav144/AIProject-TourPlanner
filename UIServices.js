/**
 * Created by OdedA on 25-Jan-16.
 */

var doc;
var logTextArea;
function initializeUIServices(document) {
    doc = document;
    logTextArea = doc.getElementById("logText");
}

function log(content){
    logTextArea.value += content.toString() + "\n";
    logTextArea.scrollTop = logTextArea.scrollHeight;
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

function handleInput(data) {

}
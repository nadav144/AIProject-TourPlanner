/**
 * Created by OdedA on 25-Jan-16.
 */

var doc;
var logTextArea;
var routeArea;
function initializeUIServices(document) {
    doc = document;
    logTextArea = doc.getElementById("logText");
    routeArea = doc.getElementById("routeSteps");
}

function log(content){
    //if (typeof content === "object") {
    //    logTextArea.value += JSON.stringify(content) + "\n";
    //} else {
    //    logTextArea.value += content + "\n";
    //}
    logTextArea.value += content + "\n";
    logTextArea.scrollTop = logTextArea.scrollHeight;

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

var routeStep = 1;
function addRouteStep(name) {
    var nextStep = doc.createElement('div');
    nextStep.id = 'routeStep_' + routeStep.toString();
    nextStep.border = 1;
    nextStep.className = 'routeStep';
    nextStep.innerHTML = routeStep.toString() + ". " + name.toString();
    routeStep += 1;
    routeArea.appendChild(nextStep);
}
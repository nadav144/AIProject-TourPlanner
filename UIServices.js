/**
 * Created by OdedA on 25-Jan-16.
 */

var doc;
var logTextArea;
var routeSteps;
function initializeUIServices(document) {
    doc = document;
    logTextArea = doc.getElementById("logText");
    routeSteps = doc.getElementById("routeSteps");
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
function addRouteStep(name, index) {
    var nextStepRow = doc.createElement('li');
    nextStepRow.id = 'routeStep_' + routeStep.toString();
    nextStepRow.className = 'list-group-item';
    nextStepRow.innerHTML = routeStep.toString() + ". " + name.toString();
    routeStep += 1;
    if (routeSteps.children.length == 0) {
        routeSteps.appendChild(nextStepRow);
    } else {
        routeSteps.insertBefore(nextStepRow, routeSteps.children[index - 1]);
    }


}
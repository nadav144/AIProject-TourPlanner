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

var logLine = 1;
function log(content){
    //if (typeof content === "object") {
    //    logTextArea.value += JSON.stringify(content) + "\n";
    //} else {
    //    logTextArea.value += content + "\n";
    //}
    logTextArea.value += logLine.toString() + ". " + content + "\n";
    logLine++;
    logTextArea.scrollTop = logTextArea.scrollHeight;

    //console.log(content);
}

function error(content) {
    console.error(content);

}

infowindow = new google.maps.InfoWindow();
// TODO:: CLEAR on new route
bounds = new google.maps.LatLngBounds();

var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


function createMarker(place, map, index) {

    var marker = new google.maps.Marker({
        map: map,
        //place: {location: place.originalLocation, placeId: place.placeID},
        animation: google.maps.Animation.DROP,
        //label: labels[labelIndex++ % labels.length],
        position: place.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name + "<br>" + place.rating);
        infowindow.open(map, this);
    });

    markers.splice(index, 0, marker);

    var labelIndex = 0;
    markers.forEach(function (x) {
        x.setLabel(labels[labelIndex % labels.length]);
        labelIndex = labelIndex + 1;
    });


    bounds.extend(marker.getPosition());
    map.fitBounds(bounds);


    return marker;
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
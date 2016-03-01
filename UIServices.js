/**
 * Created by OdedA on 25-Jan-16.
 */

var logTextArea;
var routeSteps;
bounds = new google.maps.LatLngBounds();
function initializeUIServices(document) {
    logTextArea = document.getElementById("logText");
    routeSteps = document.getElementById("routeSteps");
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


var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';


function createMarker(place, map, index) {

    var marker = new google.maps.Marker({
        map: map,
        //place: {location: place.originalLocation, placeId: place.placeID},
        animation: google.maps.Animation.DROP,
        //label: labels[labelIndex++ % labels.length],
        position: place.location
    });

    marker.markerInfoWindow = function () {
        infowindow.setContent(place.name + "<br>" + place.rating);
        infowindow.open(map, this);
    };

    marker.markerInfoWindowClose = function () {
        infowindow.close();
    };

    google.maps.event.addListener(marker, 'click', function () {
        marker.markerInfoWindow();
    });

    //console.log(marker);

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
function addRouteStep(poi, index, marker) {
    var nextStepRow = document.createElement('li');


    nextStepRow.id = 'routeStep_' + routeStep.toString();
    nextStepRow.className = 'list-group-item';
    nextStepRow.style.backgroundColor = "white";
    nextStepRow.style.marginRight = "20px";
    nextStepRow.style.minHeight = "50px";
    nextStepRow.mapMarker = marker;
    nextStepRow.onmouseover = function () { this.style.backgroundColor = "#e6e6e6";
                                            this.mapMarker.markerInfoWindow();};
    nextStepRow.onmouseout = function () {  this.style.backgroundColor = "white";
                                            this.mapMarker.markerInfoWindowClose();};

    // add image to step if at least 1 exists
    var image = document.createElement('img');
    if (poi.photos) {
        image.src = poi.photos[0].getUrl({'maxWidth': 50, 'maxHeight': 50});
        nextStepRow.appendChild(image);
    }

    // add text to the step
    var textDiv = document.createElement('div');
    //div.innerHTML = routeStep.toString() + ". " + poi.name.toString();
    textDiv.innerHTML = poi.name.toString();
    textDiv.style.float = "right";
    nextStepRow.appendChild(textDiv);
    routeStep += 1;





    if (routeSteps.children.length == 0) {
        routeSteps.appendChild(nextStepRow);
    } else {
        routeSteps.insertBefore(nextStepRow, routeSteps.children[index - 1]);
    }


}

function clear() {
    markers.forEach(function (m) {
        m.setMap(null);
    });

    // delete route from map.
    directionsDisplay.setDirections({geocoded_waypoints: [], routes: [], status: 'OK', request: Object});

    // clear all route steps
    routeSteps.innerHTML = "";
    routeStep = 1;

    markers = [];
    markers.push(startmarker);
    markers.push(endMarker);
    markers.forEach(function (m) {
        m.setMap(map);
    });

    bounds = new google.maps.LatLngBounds();
    fitMap();
}

function doSearch(searchName, startAddressLoc, endAddressLoc, tourLength) {
    document.body.style.cursor='wait';
    var searchButton = document.getElementById("sendButton");
    searchButton.disabled = true;
    var searchAlgo = new SEARCH_ALGORITHMS[searchName]();
    searchAlgo.searchRoute(startAddressLoc, endAddressLoc, tourLength, function (result, error) {
        log("==== RESULT =====");
//                log(result);
        // TODO: make this nicer
        if (searchName === "Genetic Search") {
            for (var j = 0; j < result.pois.length - 1; j++) {
                addStepAndMarker(result, j);
            }
        }

        calculateAndDisplayRoute(directionsService, directionsDisplay, result.pois);
        for (var i = 0; i < result.pois.length; i++) {
//                    markers.push(createMarker(result.pois[i], map));
        }
        fitMap();
        console.log("finishing search");
        document.body.style.cursor='default';
        searchButton.disabled = false;
    });
}

function populateDropdownAlgorithms(searchAlgorithms) {
    var selectElem = document.getElementById("searchAlgo");
    var option;
    for (var searchAlgoKey in searchAlgorithms) {
        if (searchAlgorithms.hasOwnProperty(searchAlgoKey)) {
            option = document.createElement("option");
            option.innerHTML = searchAlgoKey;
            selectElem.appendChild(option);

        }
    }
}
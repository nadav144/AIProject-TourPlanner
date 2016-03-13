/**
 * Created by OdedA on 25-Jan-16.
 */

var logTextArea;
var routeSteps;
var alldirections = []
bounds = new google.maps.LatLngBounds();
function initializeUIServices(document) {
    logTextArea = document.getElementById("logText");
    routeSteps = document.getElementById("routeSteps");
}

var logLine = 1;
function log(content) {
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
function addRouteStep(poi, index, marker, remaningTime, originalTime) {
    var nextStepRow = document.createElement('li');

    updateProgressBar(((originalTime - remaningTime) / originalTime) * 100);

    nextStepRow.id = 'routeStep_' + routeStep.toString();
    nextStepRow.className = 'list-group-item routstep';
    nextStepRow.mapMarker = marker;
    //nextStepRow.innerHTML =
    nextStepRow.onmouseover = function () {
        this.style.backgroundColor = "#e6e6e6";
        this.mapMarker.markerInfoWindow();
    };
    nextStepRow.onmouseout = function () {
        this.style.backgroundColor = "white";
        this.mapMarker.markerInfoWindowClose();
    };

    // add image to step if at least 1 exists

    if (poi.photos) {
        var image = document.createElement('img');
        image.src = poi.photos[0].getUrl({'maxWidth': 50, 'maxHeight': 50});
        image.className = "img-rounded stepImage";
        nextStepRow.appendChild(image);
    }

    var badge = document.createElement('span');
    badge.className = "badge";
    badge.innerText = poi.rating;
    nextStepRow.appendChild(badge);

    // add text to the step
    //var textDiv = document.createElement('span');
    //textDiv.className = "stepHeader";

    //div.innerHTML = routeStep.toString() + ". " + poi.name.toString();


    nextStepRow.appendChild(document.createTextNode(poi.name.toString()));
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

    var routeInformation = document.getElementById("routeInformation");
    while (routeInformation.firstChild) {
        routeInformation.removeChild(routeInformation.firstChild);
    }

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

function updateProgressBar(value) {
    $('.progress-bar').css('width', value + '%').attr('aria-valuenow', value);
}

function doSearch(searchName, startAddressLoc, endAddressLoc, tourLength) {
    document.body.style.cursor = 'wait';
    var searchButton = document.getElementById("sendButton");
    searchButton.disabled = true;
    var searchAlgo = new SEARCH_ALGORITHMS[searchName]();
    updateProgressBar(0);
    $("progressBarDiv").show();
    searchAlgo.searchRoute(startAddressLoc, endAddressLoc, tourLength, function (result, error) {
        log("==== RESULT =====");
//                log(result);
        // TODO: make this nicer
        if (searchName === "Genetic Search") {
            for (var j = 0; j < result.pois.length - 1; j++) {
                addStepAndMarker(result, j);
            }
        }

        updateProgressBar(0);



        calculateAndDisplayRoute(directionsService, directionsDisplay, result.pois);
        for (var i = 0; i < result.pois.length; i++) {
//                    markers.push(createMarker(result.pois[i], map));
        }
        printScores(heuristic.detailedScores(result));
        fitMap();
        console.log("finishing search");
        document.body.style.cursor = 'default';
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

function printScores(scoresObject) {
    console.log("in print scores");
    console.log(scoresObject);

    var routeInformation = document.getElementById("routeInformation");
    while (routeInformation.firstChild) {
        routeInformation.removeChild(routeInformation.firstChild);
    }

    for (var scoreFuncName in scoresObject) {
        if (scoresObject.hasOwnProperty(scoreFuncName)) {

            var curtr = document.createElement("tr");
            var curtd = document.createElement("td");
            curtd.innerHTML = scoreFuncName.toString();
            curtr.appendChild(curtd);
            var curtd = document.createElement("td");
            curtd.innerHTML = scoresObject[scoreFuncName].toFixed(3).toString();
            curtr.appendChild(curtd);
            routeInformation.appendChild(curtr);

        }
    }
}
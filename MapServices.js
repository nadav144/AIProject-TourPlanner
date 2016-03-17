/**
 * Created by OdedA on 25-Jan-16.
 */


var service = null;
var lastRequestTime = new Date();
var MIN_QUERY_WAIT_TIME = 250;
var queryWaitTime = MIN_QUERY_WAIT_TIME;
var numOfAPIReqs = 0;

var mapCache = [];
var waitingRequests = [];
var lastRequest;

function InitMapService(mapService) {
    service = mapService;
}


function getWaitTime() {
    var now = new Date();
    var diff = now - lastRequestTime;
    if (diff > queryWaitTime) {
        return 0;
    } else {
        return queryWaitTime - diff;
    }
}


function getFromCache(location, radius) {
    var diff = 10000;


    for (var i=0;i<mapCache.length;i++){
        var item = mapCache[i];
        if (getDistance(item.location, location).airDistance < diff &&  Math.abs(item.radius - radius) < diff) {
            return item.pois;
        }
    }


    return null;
}

function getPOIsAroundLocation(location, radius, preferences, useCache, callback) {
    if (useCache) {
        var cachedItem = getFromCache(location, radius);
        if (cachedItem != null){
            log("Returning from Cache");
            callback(cachedItem);
            return;
        }
    }

    numOfAPIReqs += 1;

    log("Querying the map for POIs. Request number " + numOfAPIReqs.toString());

    var process = function (result, status, pagination) {
        querycount++;
        switch (status) {
            case google.maps.places.PlacesServiceStatus.OK:
                for (var i = 0; i < result.length; i++) {
                    var res = result[i];
                    // TODO: should we check for that?
                    if ($.inArray("point_of_interest", res.types)) {
                        pois.push(new POI(res));
                    }
                }

                if (pagination.hasNextPage) {
                    totalCount++;
                    setTimeout(function x() {
                        lastRequestTime = new Date();
                        pagination.nextPage();
                    }, queryWaitTime);
                } else {
                    if (querycount == totalCount) {
                        log("Got " + pois.length.toString() + " new POIs");
                        mapCache.push({"location": location, "radius": radius, "pois": pois});
                        reduceWaitTime();
                        window.setTimeout(executeRequests, queryWaitTime);
                        callback(pois);
                    }
                }
                break;
            case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                reduceWaitTime();
                if (querycount == totalCount) {
                    window.setTimeout(executeRequests, queryWaitTime);
                    callback([], status);
                }
                break;
            case "OVER_QUERY_LIMIT":
                increaseWaitTime();
                if (querycount === 2) {
                    window.setTimeout(executeRequests, queryWaitTime);
                    if (pois.length === 0) {
                        waitingRequests.unshift(lastRequest);
                    } else {
                        callback(pois);
                    }
                }
                break;
            default:
                error("error on query");
                error(status);
                callback([], status);
        }
    };


    var request = function () {


        pois = [];
        querycount = 0;
        totalCount = 2;

        lastRequestTime = new Date();
        service.textSearch({
                location: location,
                radius: radius,
                query: "tourist attractions",
                //query: "Western Wall, Jerusalem",
                rankby: google.maps.places.RankBy.PROMINENCE,
                //types: ['zoo', 'museum', 'aquarium', 'amusement_park']
            }, process
        );
        service.nearbySearch({
                location: location,
                radius: radius,
                rankby: google.maps.places.RankBy.PROMINENCE,
                types: ['zoo', 'museum', 'aquarium', 'amusement_park']
            }, process
        );

    };

    waitingRequests.push(request);
}

function executeRequests() {
    console.log(waitingRequests.length.toString() + " pending requests");
    if (waitingRequests.length > 0) {
        lastRequest = waitingRequests.shift();
        lastRequest();
    } else {
        window.setTimeout(executeRequests, queryWaitTime);
    }
}
executeRequests();

/**
 *
 * @param start poi.location
 * @param finish poi.location
 * @returns {Distance}
 */
function getDistance(start, finish) {
    var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start.lat, start.lng), new google.maps.LatLng(finish.lat, finish.lng));
    // distance --> km. / 60 km per hour
    var time = ((distanceInMeters / 1000) / 60);
    var drivingFactor = 1.3;
    return new Distance(start, finish, time * drivingFactor, distanceInMeters);
}

function increaseWaitTime() {
    queryWaitTime = Math.floor(queryWaitTime * 1.5);
    log("Query limit reached. Throttling API requests. Waiting " + (queryWaitTime/1000).toString() + " seconds between requests.");
}

function reduceWaitTime() {
    queryWaitTime = Math.floor(Math.max(queryWaitTime * 0.9, MIN_QUERY_WAIT_TIME));
}
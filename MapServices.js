/**
 * Created by OdedA on 25-Jan-16.
 */


var service = null;
var lastRequestTime = new Date();
var numOfAPIReqs = 0;
var QueryLimit = 0;
var mapCache = [];

function InitMapService(mapService) {
    service = mapService;
}


function getFromCache(location, radius) {
    var diff = 1000;


    for (var i = 0; i < mapCache.length; i++) {
        var item = mapCache[i];
        if (getDistance(item.location, location).airDistance < diff && Math.abs(item.radius - radius) < diff && radius <= item.radius) {
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
    log("Querying the API for POIs");

    var process = function (result, status, pagination) {
        querycount++;
        lastRequestTime = new Date();
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
                    }, 300);
                } else {
                    if (querycount == totalCount) {
                        log("Got " + pois.length.toString() + " new POIs");
                        mapCache.push({"location": location, "radius": radius, "pois": pois});
                        callback(pois);
                    }
                }
                break;
            case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                if (querycount == totalCount) {
                    callback(pois, status);
                }
                break;
            case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
                if (querycount == totalCount) {
                    setTimeout(function () {
                        callback(pois, status);
                    }, 500);
                }
                break;
                return;

            default:
                error(status);
                if (querycount == totalCount) {
                    callback([], status);
                }
        }
    };

    setTimeout(function () {


        pois = [];
        querycount = 0;
        totalCount = 1;

        if (QueryLimit < 500) {
            totalCount = 2;
            QueryLimit += 10;
            setTimeout(function () {
                service.textSearch({
                        location: location,
                        radius: radius,
                        query: "tourist attractions",
                        //query: "Western Wall, Jerusalem",
                        rankby: google.maps.places.RankBy.PROMINENCE,
                        //types: ['zoo', 'museum', 'aquarium', 'amusement_park']
                    }, process
                );
            }, 100);
        }
        setTimeout(function () {
            QueryLimit++;
            service.nearbySearch({
                    location: location,
                    radius: radius,
                    rankby: google.maps.places.RankBy.PROMINENCE,
                    types: ['zoo', 'museum', 'aquarium', 'amusement_park']
                }, process
            );

        }, 200);
    }, 10);
}

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
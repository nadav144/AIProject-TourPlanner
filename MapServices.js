/**
 * Created by OdedA on 25-Jan-16.
 */


var service = null;
var lastRequestTime = new Date();
var queryWaitTime = 201;
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

function getPOIsAroundLocation(location, radius, preferences, callback) {

    var flag = false;

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
                    }, getWaitTime());
                } else {
                    if (querycount == totalCount) {
                        callback(pois);
                    }
                }
                break;
            case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                if (querycount == totalCount) {
                    callback([], status);
                }
                break;
            default:
                error("error on query");
                error(status);
                callback([], status);
        }
    };

    setTimeout(function () {


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

    }, getWaitTime());
}

function getDistance(start, finish) {
    var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start.lat, start.lng), new google.maps.LatLng(finish.lat, finish.lng));
    // distance --> km. / 60 km per hour
    var time = ((distanceInMeters / 1000) / 60);
    var drivingFactor = 1.3;
    return new Distance(start, finish, time * drivingFactor, distanceInMeters);
}
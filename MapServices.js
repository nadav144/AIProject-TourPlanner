/**
 * Created by OdedA on 25-Jan-16.
 */


var service = null;

function InitMapService(mapService) {
    service = mapService;
}

function getPOIsAroundLocation(location, radius, preferences) {


    var flag = false;

    service.nearbySearch({
        location: location,
        radius: radius,
        rankby: google.maps.places.RankBy.PROMINENCE,
        types: ['cafe', 'museum']
    }, callback);

    var response = [];

    function callback(results, status) {
        console.log(results);
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            response = results;
        } else {
            error("error on query");
        }
    }

    // busy wait until result returned
    while (!flag) {
    }

    console.log(response);


    return [new POI("test", location, preferences, 0)];
}

function getDistance(start, finish) {
    log(start);
    log(finish);
    var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start.lat, start.lng), new google.maps.LatLng(finish.lat, finish.lng));
    log(distanceInMeters);
    // distance --> km. / 60 km per hour
    var time = ((distanceInMeters / 1000) / 60);
    var drivingFactor = 1.3;
    return new Distance(start, finish, time * drivingFactor, distanceInMeters);
}
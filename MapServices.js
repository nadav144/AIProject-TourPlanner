/**
 * Created by OdedA on 25-Jan-16.
 */


var service = null;

function InitMapService(mapService) {
    service = mapService;
}

function getPOIsAroundLocation(location, radius, preferences, callback) {


    var flag = false;

    setTimeout(function () {


        service.nearbySearch({
                location: location,
                radius: radius,
                rankby: google.maps.places.RankBy.PROMINENCE,
                types: ['cafe', 'museum']
            }, function (result, status) {
                switch (status) {
                    case google.maps.places.PlacesServiceStatus.OK:
                        pois = [];
                        for (var i = 0; i < result.length; i++) {
                            var res = result[i];
                            pois.push(new POI(res.place_id, res.name, {
                                lat: res.geometry.location.lat(),
                                lng: res.geometry.location.lng()
                            }, res.types, res.rating));
                        }

                        log(pois);

                        callback(pois);
                        break;
                    case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
                        callback([], status);
                        break;
                    default:
                        error("error on query");
                        error(status);
                        callback([], status);
                }
            }
        );

    }, 1000);


}

function getDistance(start, finish) {
    var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start.lat, start.lng), new google.maps.LatLng(finish.lat, finish.lng));

    // distance --> km. / 60 km per hour
    var time = ((distanceInMeters / 1000) / 60);
    var drivingFactor = 1.3;
    return new Distance(start, finish, time * drivingFactor, distanceInMeters);
}
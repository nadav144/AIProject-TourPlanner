/**
 * Created by OdedA on 25-Jan-16.
 */

function getPOIsAroundLocation (location, radius, preferences) {
    return [new POI()];
}

function getDistance(start, finish) {
    var distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(start.lat, start.lng), new google.maps.LatLng(finish.lat, finish.lng));
    // distance --> km. / 60 km per hour
    var time = ((distanceInMeters / 1000) / 60);
    var drivingFactor = 1.3;
    return new Distance(start, finish, time * drivingFactor, distanceInMeters);
}
/**
 * Created by OdedA on 25-Jan-16.
 */

function POI(placeID, name, location, types, raiting) {
    this.self = this;
    this.placeID = placeID;
    this.name = name;
    this.location = location;
    this.types = types;
    this.rating = raiting;
    this.time = 2;


    return this;
}
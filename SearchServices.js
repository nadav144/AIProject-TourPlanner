/**
 * Created by OdedA on 25-Jan-16.
 */


var TYPE_FINISH = 'FINISH';
var TYPE_START = 'START';


function LocalSearchGreedy(start,finish, time){
    log(start);
    log(finish);

    // Generate Start node containing a single route
    var spoi = new POI("Start",start, [TYPE_START], 0);
    var fpoi = new POI("Finish",finish, [TYPE_FINISH], 0);
    var distance =  getDistance(spoi.location, fpoi.location);

    if (distance.time < time) {
        var startNode = new Node(time, [spoi, fpoi], [distance]);
    } else {
        error("Distance alone is more than trip time.")
    }


    return new Node();
}

function Node(time, pois, distances) {
    this.self = this;
    this.pois = pois;
    this.distances = distances;
    this.timeRemainingHours = 0.0;



    return this;
}

function getScore(Node, heuristic) {

}
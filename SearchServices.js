/**
 * Created by OdedA on 25-Jan-16.
 */


var TYPE_FINISH = 'FINISH';
var TYPE_START = 'START';
var SEARCH_RADIUS = 50000;

var huristic = new ScoreHuristic();


function LocalSearchGreedy(start, finish, time, callback) {
    // Generate Start node containing a single route
    var spoi = new POI(TYPE_START, start);
    var fpoi = new POI(TYPE_FINISH, finish);
    var distance =  getDistance(spoi.location, fpoi.location);

    if (distance.time < time) {
        var node = new Node(time, time, [spoi, fpoi], [distance]);
        next(node, callback);

    } else {
        var errortext = "Distance alone is more than trip time.";
        error(errortext);
        callback(null, error);
    }

}

function next(node, callbackOnFinish) {

    if (node.isTerminal()) {
        callbackOnFinish(node);
    }

    var neighbors = getNeigbors(node, function (neighbors, index) {
        var maxScore = null;
        var maxNode = [];
        for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            var score = getScore(n, huristic);
            if (maxScore == null || score > maxScore) {
                maxNode = [n];
                maxScore = score;
            } else if (score == maxScore) {
                maxNode.push(n);
            }

        }
        if (maxNode.length == 0) {
            callbackOnFinish(node);
        } else {

            // update thte node to be the a randome from the max
            var nextnode = maxNode[Math.floor(Math.random() * maxNode.length)];
            log("Added location:" + nextnode.pois[index + 1].name);
            //log("score:");
            //huristic.calc(node, true);

            markers.push(createMarker(nextnode.pois[index + 1], map, index + 1));
            addRouteStep(nextnode.pois[index + 1].name, index + 1);
            next(nextnode, callbackOnFinish);
        }

    });
}

function getNeigbors(node, callback) {

    if (node.isTerminal()) {
        return [];
    }
    // random select a place to add
    var index = Math.floor(Math.random() * (node.pois.length - 1));

    var searchRadius = Math.min(node.timeRemainingHours, 4) * 60 * 1000;
    console.log(searchRadius);
    getPOIsAroundLocation(node.pois[index].location, searchRadius, [], function (newpois, status) {
        var neigbors = [];
        for (var i = 0; i < newpois.length; i++) {
            var exists = false;
            for (var j = 0; j < node.pois.length; j++) {
                if (newpois[i].placeID == node.pois[j].placeID) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                var newnode = node.cloneNewPOI(index, newpois[i]);
                if (newnode.timeRemainingHours >= 0) {
                    neigbors.push(newnode);
                }
            }
        }

        callback(neigbors, index);
    });


}

function Node(originalTime, time, pois, distances) {
    this.self = this;
    this.pois = pois;
    this.distances = distances;
    this.originalTime = originalTime;
    this.timeRemainingHours = time;


    this.isTerminal = function x() {
        return this.timeRemainingHours <= 0;
    };

    this.getTimeSpent = function x() {
        return 1;
    };

    this.cloneNewPOI = function x(index, poi) {
        // TODO::is this deep-copy implimented right?
        var newpois = [].concat(this.pois);
        newpois.splice(index + 1, 0, poi);
        var newDistances = [].concat(this.distances);
        var oldTime = newDistances[index].time;
        newDistances[index] = getDistance(newpois[index].location, newpois[index + 1].location);
        newDistances.splice(index + 1, 0, getDistance(newpois[index + 1].location, newpois[index + 2].location));

        var newtime = this.timeRemainingHours + oldTime - newDistances[index].time - newDistances[index + 1].time - poi.time;

        return new Node(this.originalTime, newtime, newpois, newDistances);

    };

    return this;
}

function getScore(node, heuristic) {
    return heuristic.calc(node);

}

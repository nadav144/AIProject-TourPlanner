/**
 * Created by OdedA on 25-Jan-16.
 */


var TYPE_FINISH = 'FINISH';
var TYPE_START = 'START';
var SEARCH_RADIUS = 16000;

var huristic = new ScoreHuristic();


function LocalSearchGreedy(start, finish, time, callback) {
    // Generate Start node containing a single route
    var spoi = new POI(0, "Start", start, [TYPE_START], 0);
    var fpoi = new POI(0, "Finish", finish, [TYPE_FINISH], 0);
    var distance =  getDistance(spoi.location, fpoi.location);

    if (distance.time < time) {
        var node = new Node(time, [spoi, fpoi], [distance]);
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

    var neighbors = getNeigbors(node, function (neighbors) {
        var maxScore = 0;
        var maxNode = [];
        for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            var score = getScore(n, huristic);
            log("score: " + score);
            if (score > maxScore) {
                maxNode = [n];
            } else if (score == maxScore) {
                maxNode.push(n);
            }

        }
        log(maxNode);
        if (maxNode.length == 0) {
            callbackOnFinish(node);
        } else {
            // update thte node to be the a randome from the max
            var nextnode = maxNode[Math.floor(Math.random() * maxNode.length)];
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

    getPOIsAroundLocation(node.pois[index].location, SEARCH_RADIUS, [], function (newpois, status) {
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
                neigbors.push(node.cloneNewPOI(index, newpois[i]))
            }
        }

        //return neigbors;
        log(neigbors);
        callback(neigbors);
    });


}




function Node(time, pois, distances) {
    this.self = this;
    this.pois = pois;
    this.distances = distances;
    this.timeRemainingHours = time;

    this.isTerminal = function x() {
        return this.timeRemainingHours <= 0;
    };

    this.getTimeSpent = function x() {
        return 1;
    };

    this.cloneNewPOI = function x(index, poi) {
        // is this deep-copy implimented right?
        var newpois = [].concat(this.pois);
        console.log(poi);
        newpois.splice(index + 1, 0, poi);
        var newDistances = [].concat(this.distances);
        var oldTime = newDistances[index].time;
        log(newpois);
        newDistances[index] = getDistance(newpois[index].location, newpois[index + 1].location);
        newDistances.splice(index + 1, 0, getDistance(newpois[index + 1].location, newpois[index + 2].location));

        var newtime = this.timeRemainingHours + oldTime - newDistances[index].time - newDistances[index + 1].time - poi.time;

        return new Node(newtime, newpois, newDistances);

    };

    return this;
}

function getScore(node, heuristic) {
    return heuristic.calc(node);

}

function ScoreHuristic() {

    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            score += node.pois[i].rating;
        }
        return score;
    }

}
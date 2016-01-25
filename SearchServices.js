/**
 * Created by OdedA on 25-Jan-16.
 */


var TYPE_FINISH = 'FINISH';
var TYPE_START = 'START';
var SEARCH_RADIUS = 40;


function LocalSearchGreedy(start,finish, time){
    // Generate Start node containing a single route
    var spoi = new POI("Start",start, [TYPE_START], 0);
    var fpoi = new POI("Finish",finish, [TYPE_FINISH], 0);
    var distance =  getDistance(spoi.location, fpoi.location);
    log(distance);

    var huristic = new ScoreHuristic();

    if (distance.time < time) {
        var node = new Node(time, [spoi, fpoi], [distance]);
        log(node);

        while (!node.isTerminal()) {
            // calculate neighbors
            var neighbors = getNeigbors(node);
            var maxScore = 0;
            var maxNode = [];
            for (var n in neighbors) {
                var score = getScore(n, huristic);
                if (score > maxScore) {
                    maxNode = [n];
                } else if (score == maxScore) {
                    maxnode.push(n);
                }

            }
            // update thte node to be the a randome from the max
            node = maxnode[Math.floor(Math.random() * maxnode.length)];
        }

        return node;

    } else {
        error("Distance alone is more than trip time.")
    }

    return new Node();
}

function getNeigbors(node) {
    if (node.isTerminal()) {
        return [];
    }
    // random select a place to add
    var index = Math.floor(Math.random() * maxnode.length - 1);
    var pois = getPOIsAroundLocation(node.pois[index].location, SEARCH_RADIUS, []);
    var neigbors = [];
    for (var newpoi in pois) {
        neigbors.push(node.cloneNewPOI(index, newpoi))
    }
    return neigbors;
}




function Node(time, pois, distances) {
    this.self = this;
    this.pois = pois;
    this.distances = distances;
    this.timeRemainingHours = 0.0;

    this.isTerminal = function x() {
        return this.timeRemainingHours <= 0;
    };

    this.getTimeSpent = function x() {
        return 1;
    };

    this.cloneNewPOI = function x(index, poi) {
        // is this deep-copy implimented right?
        var newpois = [].concat(this.pois);
        newpois.splice(index + 1, 0, poi);
        var newDistances = [].concat(this.distances);
        var oldTime = newDistances[index].time;
        newDistances[index] = getDistance(newpois[index].location, newpois[index + 1].location);
        newDistances.splice(index + 1, 0, getDistance(newpois[index + 1].location, newpois[index + 2].location));

        var newtime = this.timeRemainingHours + oldTime - newDistances[index].time - newDistances[index + 1].time;

        return new Node(newtime, newpois, newDistances);

    };

    return this;
}

function getScore(node, heuristic) {
    return heuristic.calc(node);

}

function ScoreHuristic() {

    function calc(Node) {
        var score = 0;
        for (var poi in Node.pois) {
            score += poi.rating;
        }
    }

}
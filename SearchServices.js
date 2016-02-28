/**
 * Created by OdedA on 25-Jan-16.
 */



var TYPE_FINISH = 'FINISH';
var TYPE_START = 'START';
var SEARCH_RADIUS = 50000;

var SEARCH_ALGORITHMS = {};

var heuristic = new ScoreHeuristic();


function LocalSearchGreedy(){
    this.self = this;

    function getNeighbours (node, callback) {

        if (node.isTerminal()) {
            return [];
        }
        // random select a place to add
        var index = Math.floor(Math.random() * (node.pois.length - 1));

        var searchRadius = Math.min(node.timeRemainingHours, 4) * 60 * 1000;
        //console.log(searchRadius);
        getPOIsAroundLocation(node.pois[index].location, searchRadius, [], function (newpois, status) {
            var neighbours = [];
            for (var i = 0; i < newpois.length; i++) {
                var exists = false;
                for (var j = 0; j < node.pois.length; j++) {
                    if (newpois[i].placeID == node.pois[j].placeID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var newNode = node.cloneAndInsertNewPOI(index, newpois[i]);
                    if (newNode.timeRemainingHours >= 0) {
                        neighbours.push(newNode);
                    }
                }
            }

            callback(neighbours, index);
        });

    }

    function next(node, callbackOnFinish) {

        if (node.isTerminal()) {
            callbackOnFinish(node);
        }

        getNeighbours(node, function (neighbours, index) {
            var maxScore = null;
            var maxNode = [];
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                var score = getScore(neighbour, heuristic);
                if (maxScore == null || score > maxScore) {
                    maxNode = [neighbour];
                    maxScore = score;
                } else if (score == maxScore) {
                    maxNode.push(neighbour);
                }

            }
            if (maxNode.length == 0) {
                callbackOnFinish(node);
            } else {

                // update the node to be the a random from the max nodes
                var nextnode = maxNode[Math.floor(Math.random() * maxNode.length)];
                log("Added location:" + nextnode.pois[index + 1].name);
                //log("score:");
                //heuristic.calc(node, true);

                addStepAndMarker(nextnode, index);
                next(nextnode, callbackOnFinish);
            }

        });
    }

    this.searchRoute = function LocalSearchGreedy(start, finish, time, callback) {
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

    };

    return this;

}
SEARCH_ALGORITHMS["Local Greedy Search"] = LocalSearchGreedy;


function LocalSearchGreedyWithNeighbourOptimize(){

    this.self = this;

    function getNeighbours (node, callback) {

        if (node.isTerminal()) {
            return [];
        }
        // random select a place to add
        var index = Math.floor(Math.random() * (node.pois.length - 1));

        var searchRadius = Math.min(node.timeRemainingHours, 4) * 60 * 1000;
        //console.log(searchRadius);
        getPOIsAroundLocation(node.pois[index].location, searchRadius, [], function (newpois, status) {
            var neighbours = [];
            for (var i = 0; i < newpois.length; i++) {
                var exists = false;
                for (var j = 0; j < node.pois.length; j++) {
                    if (newpois[i].placeID == node.pois[j].placeID) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    var newNode = node.cloneAndInsertNewPOI(index, newpois[i]);
                    if (newNode.timeRemainingHours >= 0) {
                        neighbours.push(newNode);
                    }
                }
            }

            callback(neighbours, index);
        });

    }

    function next(node, callbackOnFinish) {

        if (node.isTerminal()) {
            callbackOnFinish(node);
        }

        getNeighbours(node, function (neighbours, index) {
            var maxScore = null;
            var maxNode = [];
            if (neighbours.length > 0) {
                for (var i = 0; i < neighbours.length; i++) {
                    var neighbour = neighbours[i];
                    var score = getScore(neighbour, heuristic);
                    if (maxScore == null || score > maxScore) {
                        maxNode = [neighbour];
                        maxScore = score;
                    } else if (score == maxScore) {
                        maxNode.push(neighbour);
                    }

                }
            }
            else {
                log("no neighbours returned. trying to optimize order..");
                console.log(node);
                var tempNeighbour;
                var bestNeighbour = null;
                for (var j = 1 ; j < node.pois.length - 2 ; j++) {
                    tempNeighbour = node.cloneAndSwapIndexes(j, j+1);
                    console.log("trying to swap index " + j.toString() + " <-> " + (j+1).toString());
                    console.log(tempNeighbour);
                    if (bestNeighbour === null || bestNeighbour[0].timeRemainingHours > tempNeighbour.timeRemainingHours) {
                        bestNeighbour = [tempNeighbour , "swapped " + j.toString() + " <-> " + (j+1).toString()];
                    }
                }
                if (bestNeighbour !== null && bestNeighbour[0].timeRemainingHours > node.timeRemainingHours) {
                    console.log ("=========================================");
                    console.log ("new best order found: " +bestNeighbour[1]);
                    console.log (bestNeighbour[0]);
                    console.log ("=========================================");
                    node = bestNeighbour[0];
                    next(node, callbackOnFinish);
                } else {
                    console.log ("best order reached");
                    log ("best order reached");
                    callbackOnFinish(node);
                    return;
                }

            }
            if (maxNode.length == 0) {
                callbackOnFinish(node);
            } else {

                // update the node to be the a random from the max nodes
                var nextnode = maxNode[Math.floor(Math.random() * maxNode.length)];
                log("Added location:" + nextnode.pois[index + 1].name);
                //log("score:");
                //heuristic.calc(node, true);

                addStepAndMarker(nextnode, index);
                next(nextnode, callbackOnFinish);
            }

        });
    }
    function reOrderPOIS() {

    }

    this.searchRoute = function LocalSearchGreedy(start, finish, time, callback) {
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

    };

    return this;

}
SEARCH_ALGORITHMS["Optimized Local Greedy Search"] = LocalSearchGreedyWithNeighbourOptimize;






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

    this.cloneAndInsertNewPOI = function (index, poi) {
        // TODO::is this deep-copy implemented right?
        var newpois = [].concat(this.pois);
        newpois.splice(index + 1, 0, poi);
        var newDistances = [].concat(this.distances);
        var oldTime = newDistances[index].time;
        newDistances[index] = getDistance(newpois[index].location, newpois[index + 1].location);
        newDistances.splice(index + 1, 0, getDistance(newpois[index + 1].location, newpois[index + 2].location));

        // returns the time it took from index i to i+1 to the time remaining, and subtract the 2 new additional times.
        var newtime = this.timeRemainingHours + oldTime - newDistances[index].time - newDistances[index + 1].time - poi.time;

        return new Node(this.originalTime, newtime, newpois, newDistances);

    };

    this.cloneAndSwapIndexes = function (index1, index2) {
        var newpois = [].concat(this.pois);

        // swap 2 POIs
        var tempPOI = newpois[index1];
        newpois[index1] = newpois[index2];
        newpois[index2] = tempPOI;

        var newDistances = [];
        var newTime = 0;

        // sum the time spent in each POI
        newpois.forEach(function(poi) {
            newTime += poi.time;
        });

        // compute all the distance between each poi, and sum the additional travel times.
        for (var i = 0 ; i < newpois.length - 1 ; i++) {
            newDistances[i] = getDistance(newpois[i].location, newpois[i + 1].location);
            newTime += newDistances[i].time;
        }

        return new Node(this.originalTime, this.originalTime - newTime, newpois, newDistances);
    };

    return this;
}

function getScore(node, heuristic) {
    return heuristic.calc(node);

}

function addStepAndMarker(nextnode, index) {
    createMarker(nextnode.pois[index + 1], map, index + 1);
    addRouteStep(nextnode.pois[index + 1], index + 1);
}


//console.log("about to call populate dropdown");
//setTimeout(function(){populateDropdownAlgorithms(SEARCH_ALGORITHMS);}, 0);
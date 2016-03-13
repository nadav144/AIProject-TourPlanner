/**
 * Created by Nadav on 01/02/2016.
 */



function ScoreHeuristic() {

    var scores = [];
    scores.push({weight: 1, scoreFunc: new ratingScore()});
    scores.push({weight: 0.4, scoreFunc: new typesScore()});
    scores.push({weight: 0.5, scoreFunc: new photosScore()});
    scores.push({weight: -0.7, scoreFunc: new longestDistanceScore()});
    scores.push({weight: -0.4, scoreFunc: new closeToEnd()});
    scores.push({weight: 0.1, scoreFunc: new simpsonsDiversityScore()});
    scores.push({weight: -0.1, scoreFunc: new clusterFactor()});


    this.calc = function (node) {
        var scoreSum = 0;
        scores.forEach(function (score) {
            scoreSum += score.scoreFunc.calc(node) * score.weight;
        });

        return scoreSum;
    };

    this.detailedScores = function (node) {
        var detailedScores = {};
        var total = 0;
        scores.forEach(function(score) {
            detailedScores[score.scoreFunc.toString()] = score.weight * score.scoreFunc.calc(node);
            total += detailedScores[score.scoreFunc.toString()];
        });

        detailedScores["Total Score"] = total;

        return detailedScores;
    }

}


function ratingScore() {
    this.name = "rating";
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            if (node.pois[i].rating != null) {
                score += node.pois[i].rating;
            }
        }
        return score / (5.0 * node.pois.length);
    };

    this.toString = function () {
        return "Rating Score";
    };
}

function photosScore() {
    this.name = "photos";
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            if (node.pois[i].photos != null) {
                score += node.pois[i].photos.length;
            }
        }
        return Math.min(1, score / (20 * node.pois.length));
    };

    this.toString = function () {
        return "Photos Score";
    };
}

function typesScore() {
    this.name = "types";
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            score += node.pois[i].types.length * 0.7;

        }
        return Math.min(1, score / (6 * node.pois.length));
    };

    this.toString = function () {
        return "Type Count Score";
    };
}

//http://www.countrysideinfo.co.uk/simpsons.htm
function simpsonsDiversityScore() {
    this.name = "diversity";
    this.calc = function x(node) {
        var score = 0;
        var sum = 0;
        var types = {};
        var keys = [];
        for (var i = 0; i < node.pois.length; i++) {
            node.pois[i].types.forEach(function (x) {
                sum++;
                if (types[x] == null) {
                    keys.push(x);
                    types[x] = 1;
                } else {
                    types[x]++;
                }
            });
        }

        keys.forEach(function (x) {
            score += (types[x] * (types[x] - 1)) / (sum * (sum - 1));
        });
        return score * 10;
    };

    this.toString = function () {
        return "Diversity Score";
    };
}

function longestDistanceScore() {
    this.name = "longestDistance";
    this.calc = function (node) {
        var score = 0;
        node.distances.forEach(function (dist) {
            score = Math.max(score, dist.time);
        });
        return score / node.originalTime;
    };

    this.toString = function () {
        return "Longest Distance Score";
    };
}

function closeToEnd() {
    this.name = "closeToEnd";
    this.calc = function (node) {
        return node.distances[node.distances.length - 1].time / (node.originalTime / 2);
    };

    this.toString = function () {
        return "Close to End Score";
    };
}

function clusterFactor() {
    this.name = "clusterFactor";
    this.calc = function (node) {

        // set critical radius to be the distance between the first and last point divided by 20.
        var CRITICAL_RADIUS = getDistance(node.pois[0].location, node.pois[node.pois.length - 1].location).airDistance / 20;
        var clusters = 0;
        node.pois.forEach(function (poi1) {
            node.pois.forEach(function (poi2) {
                if (poi1 !== poi2) {
                    var dist = getDistance(poi1.location, poi2.location).airDistance;
                    if (dist < CRITICAL_RADIUS) {
                        clusters += 1;
                    }
                }
            })
        });
        return (clusters / node.pois.length);
    };

    this.toString = function () {
        return "Clustering Score";
    };
}


/**
 * Given an array of scores, reduce the lowest scoreFunc from all scores, and then normalize all scores to be from 0 to 1.
 * @param scores
 */
function NormalizeScores(scores) {
    var lowest = Math.min.apply(Math, scores);
    var highest = Math.max.apply(Math, scores);
    var returnScores;
    if (lowest === highest) {
        returnScores = scores.map(function(num) {
            return 1;
        });
    } else {
        returnScores = scores.map(function(num) {
            return (num - lowest)/(highest - lowest);
        });
    }
    return returnScores;
}
/**
 * Created by Nadav on 01/02/2016.
 */


function ScoreHuristic() {

    var scores = [];
    scores.push({weight: 0.7, score: new ratingScore()});
    scores.push({weight: 0.4, score: new typesScore()});
    scores.push({weight: 0.5, score: new photosScore()});
    scores.push({weight: -0.7, score: new longestDistanceScore()});
    scores.push({weight: -0.2, score: new closeToEnd()});
    scores.push({weight: 10, score: new simpsonsDiversityScore()});


    this.calc = function x(node) {
        var score = 0;
        scores.forEach(function (s) {
            score += s.score.calc(node) * s.weight;
        });

        return score;
    }

}


function ratingScore() {
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            score += node.pois[i].rating;
        }
        return score;
    }
}

function photosScore() {
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            if (node.pois[i].photos != null) {
                score += node.pois[i].photos.length;
            }
        }
        return score;
    }
}

function typesScore() {
    this.calc = function x(node) {
        var score = 0;
        for (var i = 0; i < node.pois.length; i++) {
            score += node.pois[i].types.length * 0.7;

        }
        return score;
    }
}

//http://www.countrysideinfo.co.uk/simpsons.htm
function simpsonsDiversityScore() {
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
        return score;
    }
}

function longestDistanceScore() {
    this.calc = function (node) {
        var score = 0;
        node.distances.forEach(function (dist) {
            score = Math.max(score, dist.time);
        });
        return score;
    }
}

function closeToEnd() {
    this.calc = function (node) {
        return node.distances[node.distances.length - 1].time;
    }
}
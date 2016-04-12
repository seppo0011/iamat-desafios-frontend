var atcode = "dilema2015",
    apiHost = "https://api.iamat.com",
    teamsData = [],
    results;

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getTags(data) {
    return Object.keys(data.userTags).map(function (key) {
        var temp = data.userTags[key];
        temp.key = key;
        temp.team = false;
        var name = key;
        if (key.indexOf("team-") > -1) {
            temp.team = true;
            var temp2 = key.replace("room:team-","");
            for (var i = teamsData.length - 1; i >= 0; i--) {
                if (teamsData[i]._id == temp2) {
                    name = teamsData[i].name;
                    break;
                }
            };
        }
        temp.name = name.replace("room:","");
        temp.displayName = toTitleCase(temp.name.replace("_"," "))
        return temp;
    }).sort(function (a,b) {
        if (a.team != b.team) {
            if (a.team) {
                return 1;
            } else {
                return -1;
            }
        }
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    });
};

function ellipsis(a) { return a.substr(0, 10).trim() + '...'; }

function showData(answers, groups) {
    $('#svg').remove();
    var data = groups[0].answers.map(function(answer0, i) {
        return {
            answer: ellipsis(answers[i].text),
            answer0: answer0,
            answer1: groups[1].answers[i]
        }
    });
    var margin = {top: 80, right: 80, bottom: 80, left: 80},
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y0 = d3.scale.linear().domain([0, d3.max(groups[0].answers)]).range([height, 0]),
    y1 = d3.scale.linear().domain([0, d3.max(groups[1].answers)]).range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxisLeft = d3.svg.axis().scale(y0).ticks(4).orient("left");
    var yAxisRight = d3.svg.axis().scale(y1).ticks(6).orient("right");

    var svg = d3.select("body").append("svg")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("class", "graph")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(answers.map(function(a) { return ellipsis(a.text); }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis axisLeft")
        .attr("transform", "translate(0,0)")
        .call(yAxisLeft)
      .append("text")
        .attr("y", 6)
        .attr("dy", "-2em")
        .style("text-anchor", "end")
        .style("text-anchor", "end")
        .text(groups[0].displayName);

    svg.append("g")
        .attr("class", "y axis axisRight")
        .attr("transform", "translate(" + (width) + ",0)")
        .call(yAxisRight)
      .append("text")
        .attr("y", 6)
        .attr("dy", "-2em")
        .attr("dx", "2em")
        .style("text-anchor", "end")
        .text(groups[1].displayName);

    bars = svg.selectAll(".bar").data(data).enter();

    bars.append("rect")
        .attr("class", "bar1")
        .attr("x", function(d) { return x(d.answer); })
        .attr("width", x.rangeBand()/2)
        .attr("y", function(d) { return y0(d.answer0); })
        .attr("height", function(d,i,j) { return height - y0(d.answer0); }); 

    bars.append("rect")
        .attr("class", "bar2")
        .attr("x", function(d) { return x(d.answer) + x.rangeBand()/2; })
        .attr("width", x.rangeBand() / 2)
        .attr("y", function(d) { return y1(d.answer1); })
        .attr("height", function(d,i,j) { return height - y1(d.answer1); }); 
}

function init(data) {
    var tags = getTags(data);
    var tagsByDisplayName = {};
    tags.forEach(function(t) { tagsByDisplayName[t.displayName] = t; });

    $('#question').text(data.question);
    data.answers.forEach(function(answer) {
        $('#answers').append($('<li>').text(answer.text));
    });

    function display() {
        var selectedTags = $inputs.map(function(i, input) {
            return tagsByDisplayName[$(input).val()]
        });
        if (selectedTags[0] && selectedTags[1]) {
            showData(data.answers, selectedTags)
            return true;
        }
        return false;
    }


    $('.select-group').addClass('select-group-ready')
    var $inputs = $('.select-group input')
        .on('focus', function() {
            var $this = $(this);
            $this.autocomplete('search', $this.val());
        })
        .on('blur', function() {
            var $this = $(this);
            if (!tagsByDisplayName[$this.val()]) {
                $this.focus();
                setTimeout(function() {
                    $this.autocomplete('search', $this.val());
                });
            } else if (!display()) {
                $inputs.not($this).focus();
            }
        })
        .autocomplete({
            minLength: 0,
            select: function() {
                setTimeout(function() {
                    var $this = $(this);
                    if (tagsByDisplayName[$this.val()]) {
                        $this.change().blur();
                    }
                }.bind(this), 0);
            },
            source: tags.map(function(t) { return t.displayName; })
        });

    $('#group1').focus();
}

results = {
    "id": "54f4c8c5226cbdaa0b004e45",
    "question": "\u00bfQu\u00e9 hac\u00e9s si una mujer con la que est\u00e1s es la ex de un amigo?",
    "answers": [
        {
            "text": "Segu\u00eds con ella a pesar de todo",
            "count": 1496,
            "percentage": 16,
            "points": 100,
            "image": null,
            "metadata": null
        },
        {
            "text": "La larg\u00e1s",
            "count": 3227,
            "percentage": 34,
            "points": 100,
            "image": null,
            "metadata": null
        },
        {
            "text": "Lo habl\u00e1s con tu amigo para que te apruebe la relaci\u00f3n",
            "count": 4791,
            "percentage": 50,
            "points": 100,
            "correct": true,
            "image": null,
            "metadata": null
        }
    ],
    "timing": {
        "start": 1425440042841,
        "countdown": 0,
        "open": 20000
    },
    "image": null,
    "type": "Standard",
    "userTags": {
        "room:team-54e5106fc161867c571d4e35": {
            "answers": [
                7,
                23,
                38
            ],
            "percentage": [
                10,
                34,
                56
            ]
        },
        "room:team-54e50ac1c161867c571d2cf6": {
            "answers": [
                16,
                12,
                19
            ],
            "percentage": [
                34,
                26,
                40
            ]
        },
        "room:team-54e50a6fc161867c571d2bf5": {
            "answers": [
                8,
                10,
                20
            ],
            "percentage": [
                21,
                26,
                53
            ]
        },
        "room:female": {
            "answers": [
                669,
                1120,
                1995
            ],
            "percentage": [
                18,
                30,
                52
            ]
        },
        "room:team-54e50b4fc161867c571d2f52": {
            "answers": [
                8,
                17,
                23
            ],
            "percentage": [
                17,
                35,
                48
            ]
        },
        "room:ESTADO_Concubinato": {
            "answers": [
                194,
                430,
                669
            ],
            "percentage": [
                15,
                33,
                52
            ]
        },
        "room:facebook": {
            "answers": [
                903,
                1877,
                2760
            ],
            "percentage": [
                16,
                34,
                50
            ]
        },
        "room:team-54f08c37695aa1792d048a6a": {
            "answers": [
                6,
                12,
                14
            ],
            "percentage": [
                19,
                38,
                43
            ]
        },
        "room:male": {
            "answers": [
                779,
                1990,
                2640
            ],
            "percentage": [
                14,
                37,
                49
            ]
        },
        "room:team-54e50898c161867c571d238b": {
            "answers": [
                24,
                24,
                64
            ],
            "percentage": [
                21,
                21,
                58
            ]
        },
        "room:ESTADO_Divorciado": {
            "answers": [
                93,
                125,
                209
            ],
            "percentage": [
                22,
                29,
                49
            ]
        },
        "room:EDAD_31a41": {
            "answers": [
                446,
                996,
                1385
            ],
            "percentage": [
                16,
                35,
                49
            ]
        },
        "room:team-54e508dfc161867c571d252f": {
            "answers": [
                5,
                18,
                35
            ],
            "percentage": [
                9,
                31,
                60
            ]
        },
        "room:team-54e51242c161867c571d598e": {
            "answers": [
                28,
                37,
                51
            ],
            "percentage": [
                24,
                32,
                44
            ]
        },
        "room:TEST": {
            "answers": [
                1,
                0,
                0
            ],
            "percentage": [
                100,
                0,
                0
            ]
        },
        "room:gender_unknown": {
            "answers": [
                696,
                1605,
                2406
            ],
            "percentage": [
                15,
                34,
                51
            ]
        },
        "room:team-54efdb76695aa1792d031f6f": {
            "answers": [
                196,
                508,
                679
            ],
            "percentage": [
                14,
                37,
                49
            ]
        },
        "room:EDAD_21a30": {
            "answers": [
                433,
                1079,
                1622
            ],
            "percentage": [
                14,
                34,
                52
            ]
        },
        "room:ESTADO_SOLTERO": {
            "answers": [
                716,
                1805,
                2632
            ],
            "percentage": [
                14,
                35,
                51
            ]
        },
        "room:team-54e510e1c161867c571d51c1": {
            "answers": [
                26,
                36,
                69
            ],
            "percentage": [
                20,
                27,
                53
            ]
        },
        "room:team-54e511cac161867c571d572e": {
            "answers": [
                16,
                30,
                45
            ],
            "percentage": [
                18,
                33,
                49
            ]
        },
        "room:team-54e508d5c161867c571d24f7": {
            "answers": [
                11,
                14,
                19
            ],
            "percentage": [
                25,
                32,
                43
            ]
        },
        "room:team-54e51263c161867c571d5a60": {
            "answers": [
                20,
                34,
                56
            ],
            "percentage": [
                18,
                31,
                51
            ]
        },
        "room:EDAD_Menor18": {
            "answers": [
                80,
                191,
                265
            ],
            "percentage": [
                15,
                36,
                49
            ]
        },
        "room:EDAD_18a21": {
            "answers": [
                144,
                393,
                549
            ],
            "percentage": [
                13,
                36,
                51
            ]
        },
        "room:team-54e51211c161867c571d5898": {
            "answers": [
                14,
                19,
                29
            ],
            "percentage": [
                23,
                31,
                46
            ]
        },
        "room:team-54e514dcc161867c571d661f": {
            "answers": [
                10,
                14,
                19
            ],
            "percentage": [
                23,
                33,
                44
            ]
        },
        "room:EDAD_62a100": {
            "answers": [
                19,
                18,
                40
            ],
            "percentage": [
                25,
                23,
                52
            ]
        },
        "room:team-54e515f3c161867c571d6b74": {
            "answers": [
                12,
                22,
                40
            ],
            "percentage": [
                16,
                30,
                54
            ]
        },
        "room:team-54e50a13c161867c571d2a8f": {
            "answers": [
                22,
                52,
                67
            ],
            "percentage": [
                16,
                37,
                47
            ]
        },
        "room:team-54e51535c161867c571d67ae": {
            "answers": [
                12,
                33,
                52
            ],
            "percentage": [
                12,
                34,
                54
            ]
        },
        "room:team-54e50b83c161867c571d30b8": {
            "answers": [
                34,
                57,
                126
            ],
            "percentage": [
                16,
                26,
                58
            ]
        },
        "room:EDAD_52a61": {
            "answers": [
                83,
                87,
                173
            ],
            "percentage": [
                24,
                25,
                51
            ]
        },
        "room:twitter": {
            "answers": [
                211,
                464,
                690
            ],
            "percentage": [
                15,
                34,
                51
            ]
        },
        "room:team-54e50ae3c161867c571d2d89": {
            "answers": [
                115,
                229,
                361
            ],
            "percentage": [
                16,
                32,
                52
            ]
        },
        "room:team-54edd3ccae68deec0505f7ba": {
            "answers": [
                18,
                32,
                52
            ],
            "percentage": [
                18,
                31,
                51
            ]
        },
        "room:team-54e48b913a718e04031c082c": {
            "answers": [
                50,
                93,
                145
            ],
            "percentage": [
                17,
                32,
                51
            ]
        },
        "room:team-54d8feffbb1ab4cf14000a24": {
            "answers": [
                448,
                1069,
                1504
            ],
            "percentage": [
                15,
                35,
                50
            ]
        },
        "room:team-54e5114dc161867c571d5474": {
            "answers": [
                9,
                19,
                35
            ],
            "percentage": [
                14,
                30,
                56
            ]
        },
        "room:ESTADO_Viudo": {
            "answers": [
                22,
                16,
                27
            ],
            "percentage": [
                34,
                25,
                41
            ]
        },
        "room:team-54d90006bb1ab4cf14000b68": {
            "answers": [
                143,
                333,
                466
            ],
            "percentage": [
                15,
                35,
                50
            ]
        },
        "room:team-54edd323ae68deec0505f63c": {
            "answers": [
                3,
                0,
                2
            ],
            "percentage": [
                60,
                0,
                40
            ]
        },
        "room:ESTADO_CASADO": {
            "answers": [
                391,
                681,
                1016
            ],
            "percentage": [
                19,
                33,
                48
            ]
        },
        "room:team-54e51438c161867c571d63b0": {
            "answers": [
                9,
                21,
                32
            ],
            "percentage": [
                15,
                34,
                51
            ]
        },
        "room:anonymous": {
            "answers": [
                472,
                1034,
                1575
            ],
            "percentage": [
                15,
                34,
                51
            ]
        },
        "room:EDAD_42a51": {
            "answers": [
                216,
                308,
                547
            ],
            "percentage": [
                20,
                29,
                51
            ]
        }
    },
    "result": "showResults",
    "historyId": "54f7434ae9d519421900984f",
    "time": 1425490762967
};

$(document).ready(function() {
    $.ajax({
        url: apiHost + "/atcodes/" + atcode + "/teams/",
        success: function (data) {
            if (data.hasOwnProperty("teams")) {
                teamsData = data.teams;
            }

            init(results);
        },
        error: function (err) {
            alert("Atcode teams error.\n");
        }
    });
});

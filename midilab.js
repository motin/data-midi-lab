var teoria_module = require('./modules/teoria/dist/teoria');
var teoria = teoria_module.teoria;

exports.fractionToIndex = function(fraction,min,max){
    var len = max-min;
    var p = Math.round(min + fraction*len);
    return p;
};


function numberRange(lower, upper) {

    var numbers = [],
    modify = 1;

    if (lower > upper) {
        modify = -1;
    }

    upper += modify;
    while (lower != upper) {

        numbers.push(lower);
        lower += modify;
    }

    return numbers;
}

exports.fullGamut = function() {
    return numberRange(0x15,0x6C);
}

exports.scheduleMidiMessage = function(midiOut, message, at, start) {
    setTimeout(function() {
        console.log('scheduleMidiMessage', message, at);
        console.log(Date.now() - start);
        // Send a MIDI message.
        midiOut.sendMessage(message);
    }, at);
}

exports.sendEvents = function(midiOut, tosend, cc) {
    var start = Date.now();
    for (i=0;i<tosend.length;i++) {
        console.log(tosend[i]);
        if (tosend[i].type == 'note') {
            exports.scheduleMidiMessage(midiOut, [143+parseInt(tosend[i].channel),tosend[i].value,tosend[i].velocity], tosend[i].at, start);
            exports.scheduleMidiMessage(midiOut, [127+parseInt(tosend[i].channel),tosend[i].value,tosend[i].velocity], tosend[i].at+tosend[i].length, start);
        } else if (tosend[i].type == 'control') {
            exports.scheduleMidiMessage(midiOut, [176,tosend[i].cc,tosend[i].value], tosend[i].at, start);
        } else {
            throw 'invalid messageType';
        }
    }
}

exports.dataToControlEvents = function(dataset, params){
    console.log('dataToControlEvents', dataset);
    console.log(params)

    events = [];
    var gamut = [];
    
    if (params.gamut !== 'undefined') {
        gamut = params.gamut.split(",");
        for (i=0;i<gamut.length;i++) {
            gamut[i] = parseInt(gamut[i]);
        }
    } else {
        gamut = exports.numberRange(0,127);
    }

    if (typeof params.cc === 'undefined') {
        params.cc = 80;
    }
        
    console.log(gamut);
    
    for (i=0;i<dataset.datapoints.length;i++) {
        events.push({
            type: 'control',
            value: gamut[exports.fractionToIndex(dataset.datapoints[i],0,(gamut.length-1))],
            at: Math.round(dataset.msBetweenPoints*i),
            cc: params.cc
        })
    }

    return events;

};

exports.dataToNoteEvents = function(dataset, params){
    console.log('dataToNoteEvents');
    console.log(dataset);

    var gamut = [];
    var basenote = teoria.note(params.basenote);

    if (typeof params.basenote != 'undefined' && typeof params.scale != 'undefined' && params.scale != 'off-or-on') {

        if (typeof params.octaves === 'undefined') {
            params.octaves = 2;
        }

        var scale;
        for (octave=0;octave<params.octaves;octave++) {
            scale = basenote.scale(params.scale);
            for (i=0;i<scale.notes.length;i++) {
                gamut.push(scale.notes[i].key());
            }
            // Rise one octave
            basenote = basenote.interval('P8');
        }

    } else if (params.scale == 'off-or-on') {

        gamut = [0,basenote.key()];

    } else {
        gamut = exports.fullGamut();
    }

    console.log('gamut', gamut);

    if (typeof params.channel === 'undefined') {
        params.channel = 1;
    }

    events = [];
    for (i=0;i<dataset.datapoints.length;i++) {
        events.push({
            type: 'note',
            value: gamut[exports.fractionToIndex(dataset.datapoints[i],0,(gamut.length-1))],
            length: dataset.msBetweenPoints,
            velocity: 95,
            channel: params.channel,
            at: Math.round(dataset.msBetweenPoints*i)
        })
    }
    return events;

};

exports.getEvents = function(dataset, params, callback) {
    
    var result;

    if (params.targetType == 'notes') {
        result = exports.dataToNoteEvents(dataset, params);
    } else if (params.targetType == 'control') {
        result = exports.dataToControlEvents(dataset, params);
    } else if (params.targetType == 'trigger') {
        throw 'TODO';
        result = exports.dataToTriggerEvents(dataset);
    } else {
        throw 'invalid targetType';
    }
    callback(result);
}
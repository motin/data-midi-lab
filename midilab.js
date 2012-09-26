exports.scheduleMidiMessage = function(midiOut, message, at, start) {
    setTimeout(function() {
        console.log('scheduleMidiMessage', message, at);
        console.log(Date.now() - start);
        // Send a MIDI message.
        midiOut.sendMessage(message);
    }, at);
}

exports.sendEvents = function(midiOut, tosend) {
    var start = Date.now();
    for (i=0;i<tosend.length;i++) {
        console.log(tosend[i]);
        if (tosend[i].type == 'note') {
            exports.scheduleMidiMessage(midiOut, [144,tosend[i].value,tosend[i].velocity], tosend[i].at, start);
            exports.scheduleMidiMessage(midiOut, [128,tosend[i].value,tosend[i].velocity], tosend[i].at+tosend[i].length, start);
        } else if (tosend[i].type == 'control') {
            exports.scheduleMidiMessage(midiOut, [176,80,tosend[i].value], tosend[i].at, start);
        } else {
            throw 'invalid messageType';
        }
    }
}

exports.dataToControlEvents = function(dataset, msBetweenEvents){
    console.log('dataToControlEvents', dataset);

    events = [];
    msFromStart = 0;
    for (i=0;i<dataset.length;i++) {
        events.push({
            type: 'control',
            value: dataset[i],
            at: Math.round(msBetweenEvents*i)
        })
    }
    return events;

};

exports.dataToNoteEvents = function(dataset, msBetweenEvents){
    console.log('dataToNoteEvents', dataset);

    events = [];
    msFromStart = 0;
    for (i=0;i<dataset.length;i++) {
        events.push({
            type: 'note',
            value: dataset[i],
            length: msBetweenEvents,
            velocity: 95,
            at: Math.round(msBetweenEvents*i)
        })
    }
    return events;

};

exports.getEvents = function(dataset, params) {
    
    var result;

    var msBetweenEvents = dataset.durationSeconds*1000/dataset.datapoints.length;
    if (params.targetType == 'notes') {
        //, params.key
        result = exports.dataToNoteEvents(dataset.datapoints, msBetweenEvents);
    } else if (params.targetType == 'control') {
        result = exports.dataToControlEvents(dataset.datapoints, msBetweenEvents);
    } else if (params.targetType == 'trigger') {
        throw 'TODO';
        result = exports.dataToTriggerEvents(dataset.datapoints);
    } else {
        throw 'invalid targetType';
    }
    return result;
}

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
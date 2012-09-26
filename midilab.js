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
        exports.scheduleMidiMessage(midiOut, [176,80,tosend[i].value], tosend[i].at, start);
    }
}
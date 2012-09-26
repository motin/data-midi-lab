
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, datalab = require('./datalab')
, midilab = require('./midilab')
, io = require('socket.io');

var app = module.exports = express.createServer(),
io = io.listen(app);

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

// Functions

var midi = require('midi'),
midiOut = new midi.output();

try {
    midiOut.openPort(0);
} catch(error) {
    midiOut.openVirtualPort('Data MIDI Lab');
}

io.sockets.on('connection', function (socket) {

    // note
    socket.on('notedown',function(data){
        midiOut.sendMessage([144,data.message,100]);
        socket.broadcast.emit('playeddown',{
            'message':data.message
        });
    });

    // note stop
    socket.on('noteup',function(data){
        midiOut.sendMessage([128,data.message,100]);
        socket.broadcast.emit('playedup',{
            'message':data.message
        });
    });

    // controller
    socket.on('controller',function(data){
        console.log('controller', data);
        datalab.foo();
        var message = parseInt(data.message,10);
        midiOut.sendMessage([message,0,0]);
    });

    socket.on('transform',function(params){
        console.log('transform', params);

        /*
        transform { dataset: 'no_data',
          targetType: 'control',
          key: 'E2',
          rate: 60,
          rateUnit: 'second',
          duration: 10,
          durationUnit: 'seconds',
          destination: 'ul#datasets li.no_data ul li.a pre.tosend' }
        */

        var bpm = 140;
        var bps = bpm/60;
        var spb = 1/bps;

        var durationSeconds;
        if (params.durationUnit == 'beats') {
            durationSeconds = params.duration*spb;
        } else     if (params.durationUnit == 'seconds') {
            durationSeconds = params.duration;
        } else {
            throw 'invalid durationUnit';
        }

        console.log('durationSeconds',durationSeconds);

        var ratePerSecond;
        if (params.rateUnit == 'beat') {
            ratePerSecond = params.rate*bps;
        } else     if (params.rateUnit == 'second') {
            ratePerSecond = params.rate;
        } else {
            throw 'invalid rateUnit';
        }

        console.log('ratePerSecond',ratePerSecond);

        var cntEvents = durationSeconds*ratePerSecond;

        console.log('cntEvents',cntEvents);

        var dataset;
        if (params.dataset == 'no_data') {
            dataset = datalab.getRandomDataSet(cntEvents);
        } else {
            throw 'TODO dataset';
        }
        var result;

        if (params.targetType == 'notes') {
            //params.key
            throw 'TODO';
            result = datalab.dataToNoteEvents(dataset);
        } else if (params.targetType == 'control') {
            var msBetweenEvents = durationSeconds*1000/cntEvents;
            result = datalab.dataToControlEvents(dataset, msBetweenEvents);
        } else if (params.targetType == 'trigger') {
            throw 'TODO';
            result = datalab.dataToTriggerEvents(dataset);
        } else {
            throw 'invalid targetType';
        }

        // send to preview div
        socket.emit('update_preview',{
            'destination':params.destination,
            'result':result
        });

    });

    socket.on('send',function(params){
        
        console.log('send');
        console.log(params);

        midilab.sendEvents(midiOut, params.tosend);
        
        socket.emit('send_start',{
            'sent_cnt':params.tosend.length
        });
        
    });

    socket.on('error', function (err) {
        console.log(err);
    })


});

// Stop

process.on("SIGTERM", function(){
    midiOut.closePort();
});

// Start

app.listen(3001);
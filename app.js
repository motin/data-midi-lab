
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
    app.use('/javascripts', express.static(__dirname + '/public/javascripts'));
    app.use('/stylesheets', express.static(__dirname + '/public/stylesheets'));
	app.use('/o3djs', express.static(__dirname + '/modules/o3djs'));
	app.use('/shaders', express.static(__dirname + '/modules/chromium-audio/shaders'));
	app.use('/vizualizer-live', express.static(__dirname + '/modules/chromium-audio/vizualizer-live'));
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
    console.log('Opening Virtual MIDI port: Data MIDI Lab');
    res = midiOut.openVirtualPort('Data MIDI Lab');
    console.log('Success');
} catch(error) {
    console.log(error);
    console.log('Opening first available MIDI port');
    midiOut.openPort(0);
    console.log('Success');
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

        console.log('transform');
        
        var dataset = datalab.getDataSet(params, function(dataset) {

            var result = midilab.getEvents(dataset, params, function(result) {

                // send to preview div
                socket.emit('update_preview',{
                    'destination':params.destination,
                    'result':result
                });

            });

        });

    });

    socket.on('send',function(params){
        
        console.log('send');

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
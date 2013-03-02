
o3djs.require('o3djs.shader');

function output(str) {
    console.log(str);
}

// Events
// init() once the page has finished loading.
window.onload = init;

var context;
var source;
var analyser;
var buffer;
var audioBuffer;

var analyserView1;

function error() {
    alert('Stream generation failed.');
    finishJSTest();
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.webkitGetUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('webkitGetUserMedia threw exception :' + e);
        finishJSTest();
    }
}

function gotStream(stream) {
    s = stream;

    analyserView1 = new AnalyserView("view1");

    initAudio(stream);
    analyserView1.initByteBuffer();

    window.requestAnimationFrame(draw);
}

function init() {
    getUserMedia({audio:true}, gotStream);
}

function initAudio(stream) {
    context = new webkitAudioContext();

    analyser = context.createAnalyser();
    analyser.fftSize = 2048;

    // Connect audio processing graph:
    // live-input -> analyser -> destination

    // Create an AudioNode from the stream.
    var mediaStreamSource = context.createMediaStreamSource(stream);
    mediaStreamSource.connect(analyser);
    analyser.connect(context.destination);

    window.requestAnimationFrame(draw);
}

if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = ( function() {

                return window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

                        window.setTimeout( callback, 1000 / 60 );

                };
        } )();
}

function draw() {
    analyserView1.doFrequencyAnalysis();
    window.requestAnimationFrame(draw);
}
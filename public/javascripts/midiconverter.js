AnalyserView.prototype.convertToMIDI = function() {

	var freqByteData = this.freqByteData;

	analyser.smoothingTimeConstant = 0.99;
	analyser.getByteFrequencyData(freqByteData);

	console.log('freqByteData', freqByteData);

}


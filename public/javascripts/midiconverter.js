AnalyserView.prototype.convertToMIDI = function() {

	var freqByteData = this.freqByteData;

	analyser.smoothingTimeConstant = 0.99;
	analyser.getByteFrequencyData(freqByteData);

	console.log('freqByteData', freqByteData);

	s = new Stats();
	for (var i = 0; i < freqByteData.length; ++i) {
		s.push(freqByteData[i]);
	}

	console.log(s.gmean(), s.amean(), s.amean().toFixed(2));

}


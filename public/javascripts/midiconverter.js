AnalyserView.prototype.buffer = [];
AnalyserView.prototype.lastEmit = null;

AnalyserView.prototype.convertToMIDI = function() {

	var freqByteData = this.freqByteData;

	analyser.smoothingTimeConstant = 0.99;
	analyser.getByteFrequencyData(freqByteData);

	//console.log('freqByteData', freqByteData);

	//console.log(this.buffer, this.buffer.length);

	s = new Stats();
	for (var i = 0; i < freqByteData.length; ++i) {
		s.push(freqByteData[i]);
	}

	//console.log(s.gmean(), s.amean(), s.amean().toFixed(2));

	this.buffer.push(s.amean());

	//console.log(this.buffer, this.buffer.length);

	if (this.lastEmit === null)
		this.lastEmit = Date.now();

	if (Date.now() - this.lastEmit > 500) {
		window.socket.emit('convert', {
			toconvert: this.buffer
		});
		console.log("Sent " + this.buffer.length + " average frequencies at " + this.lastEmit);
		this.buffer = [];
		this.lastEmit = Date.now();
	}

}


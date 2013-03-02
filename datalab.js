exports.foo = function(){
    console.log('foo');
};

/*
exports.randinterval = function(min,max){
    var len = max-min;
    var p = min + parseInt(Math.random()*len);
    return p;
};
 */

exports.setRandomDataPoints = function(dataset){
    console.log('getRandomDataPoints');
    for (i=0;i<dataset.datapoints.length;i++) {
        dataset.datapoints[i] = Math.random();
    }
};


exports.setCsvDataPoints = function(params, dataset, callback) {

    var csv = require('csv');

    if (typeof params.sourcevaluespersec === 'undefined') {
        params.sourcevaluespersec = dataset.ratePerSecond;
    }
    if (params.sourcevaluespersec < dataset.ratePerSecond) {
        throw 'TODO interpolation for case sourcevaluespersec < ratePerSecond';
    }
   
    csv()
    .fromPath(__dirname+'/data/'+params.dataset+'.csv', {
        delimiter: ';'
    //columns: [params.datacolumn]
    })
    //.toPath(__dirname+'/data/'+params.dataset+'-transformed.csv')
    .on('data',function(data,index){

        // Skip first row since we assume they are headers
        if (index == 0) {
            return;
        }
        
        var rowno = index-1;

        var datapointIndex = Math.round(rowno/(params.sourcevaluespersec*dataset.durationSeconds)*(dataset.datapoints.length));
        //console.log(index, params.sourcevaluespersec*dataset.durationSeconds);
        
        console.log('#'+rowno+' '+JSON.stringify(data), datapointIndex);

        // Skip row if already sampled a value from source to the datapoints array
        if (typeof dataset.datapoints[datapointIndex] !== 'undefined' && params.tatumcalc != 'avg') {

        } else if (datapointIndex < dataset.datapoints.length) {

            // Get the value from datacolumnindex - TODO: support datacolumn name-based by reading headers first...
            fl = parseFloat(data[params.datacolumnindex].replace(',','.'));

            console.log('data transform bef',data,data[params.datacolumnindex],data[params.datacolumnindex].replace(',','.'),fl);

            // Normalize - map the linear range [A..B] to [C..D] http://stackoverflow.com/questions/1471370/normalizing-from-0-5-1-to-0-1
            A = params.lowerNormalize;
            B = params.upperNormalize;
            C = 0.0;
            D = 1.0;
            normalizedValue = (D-C)/(B-A)*fl+((C*B)-(A*D))/(B-A);

            if (normalizedValue < 0) {
                normalizedValue = 0.0;
            }

            if (normalizedValue > 1) {
                normalizedValue = 1.0;
            }

            // Put the value that we will use firstmost in the array
            data.unshift(normalizedValue);

            console.log('data transform aft',data);

            if (params.tatumcalc == 'avg') {
                throw 'todo';
            } else {
                dataset.datapoints[datapointIndex] = data[0];
            }
        
            
        }
        return true;
    })
    .on('end',function(count){
        console.log('Number of datapoints to collect: '+dataset.datapoints.length);
        console.log('Number of lines in CSV: '+count);
        callback(dataset);
    })
    .on('error',function(error){
        console.log(error.message);
    });

}

exports.setDataArrayDataPoints = function(params, dataset, callback, dataarray) {

	if (typeof params.sourcevaluespersec === 'undefined') {
		params.sourcevaluespersec = dataset.ratePerSecond;
	}
	if (params.sourcevaluespersec < dataset.ratePerSecond) {
		throw 'TODO interpolation for case sourcevaluespersec < ratePerSecond';
	}
	for (rowno = 0; rowno < params.dataarray.length; rowno++) {
		params.datacolumnindex = 0;
		var data = [params.dataarray[rowno]];

		var datapointIndex = Math.round(rowno / (params.sourcevaluespersec * dataset.durationSeconds) * (dataset.datapoints.length));
		//console.log(index, params.sourcevaluespersec*dataset.durationSeconds);

		console.log('#' + rowno + ' ' + JSON.stringify(data), datapointIndex);

		// Skip row if already sampled a value from source to the datapoints array
		if (typeof dataset.datapoints[datapointIndex] !== 'undefined' && params.tatumcalc != 'avg') {

		} else if (datapointIndex < dataset.datapoints.length) {

			// Get the value from datacolumnindex - TODO: support datacolumn name-based by reading headers first...
			fl = parseFloat(data[params.datacolumnindex]);

			//console.log('data transform bef', data, data[params.datacolumnindex], data[params.datacolumnindex].replace(',', '.'), fl);

			// Normalize - map the linear range [A..B] to [C..D] http://stackoverflow.com/questions/1471370/normalizing-from-0-5-1-to-0-1
			A = params.lowerNormalize;
			B = params.upperNormalize;
			C = 0.0;
			D = 1.0;
			normalizedValue = (D - C) / (B - A) * fl + ((C * B) - (A * D)) / (B - A);

			if (normalizedValue < 0) {
				normalizedValue = 0.0;
			}

			if (normalizedValue > 1) {
				normalizedValue = 1.0;
			}

			// Put the value that we will use firstmost in the array
			data.unshift(normalizedValue);

			console.log('data transform aft', data);

			if (params.tatumcalc == 'avg') {
				throw 'todo';
			} else {
				dataset.datapoints[datapointIndex] = data[0];
			}
		}
	}

	callback(dataset);

}

exports.getDataSet = function(params, callback){
    
    console.log('getDataSet', params);

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

    var cntEvents = Math.round(durationSeconds*ratePerSecond);

    console.log('cntEvents',cntEvents);

    var dataset = {};
    dataset.datapoints = new Array(cntEvents);

    dataset.bpm = bpm;
    dataset.bps = bps;
    dataset.spb = spb;
    dataset.durationSeconds = durationSeconds;
    dataset.ratePerSecond = ratePerSecond;
    dataset.msBetweenPoints = dataset.durationSeconds*1000/dataset.datapoints.length;

    if (params.datasource == 'no_data') {
        exports.setRandomDataPoints(dataset);
        callback(dataset);
    } else if (params.datasource == 'csv') {
        exports.setCsvDataPoints(params, dataset, function(dataset) {
            callback(dataset);
        });
	} else if (params.datasource == 'data-array') {
		exports.setDataArrayDataPoints(params, dataset, function(dataset) {
			callback(dataset);
		});
    } else {
        throw 'TODO datasource';
    }

    
    
}

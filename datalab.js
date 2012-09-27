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

exports.getRandomDataPoints = function(cnt){
    console.log('getRandomDataPoints');

    var datapoints = [];
    for (i=0;i<cnt;i++) {
        datapoints.push(Math.random());
    }
    return datapoints;

};


exports.getCsvDataPoints = function(params, cntEvents, callback) {

    var csv = require('csv');

    var datapoints = [];

    csv()
    .fromPath(__dirname+'/data/'+params.dataset+'.csv', {
        delimiter: ';'
    //columns: [params.datacolumn]
    })
    //.toPath(__dirname+'/data/'+params.dataset+'-transformed.csv')
    .transform(function(data){
        //console.log('data transform b',data);

        // Get the value from datacolumnindex - TODO: support datacolumn name-based by reading headers first...
        fl = parseFloat(data[params.datacolumnindex]);

        // Normalize
        normalizedValue = (fl - params.lowerNormalize)/params.upperNormalize;
        
        // Put the value that we will use firstmost in the array
        data.unshift(normalizedValue);

        //console.log('data transform a',data);
        
        return data;
    })
    .on('data',function(data,index){
        // Skip first row since we assume they are headers
        if (index > 1) {
            //console.log('#'+index+' '+JSON.stringify(data));
            datapoints.push(data[0]);
        }
    })
    .on('end',function(count){
        console.log('Number of lines expected: '+cntEvents);
        console.log('Number of lines in CSV: '+count);
        callback(datapoints);
    })
    .on('error',function(error){
        console.log(error.message);
    });

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

    var cntEvents = durationSeconds*ratePerSecond;

    console.log('cntEvents',cntEvents);

    var addmetadataandreturn = function(dataset) {

        dataset.bpm = bpm;
        dataset.bps = bps;
        dataset.spb = spb;
        dataset.durationSeconds = durationSeconds;
        dataset.ratePerSecond = ratePerSecond;
        dataset.msBetweenPoints = dataset.durationSeconds*1000/dataset.datapoints.length;

        callback(dataset);

    }


    var dataset = {};
    if (params.datasource == 'no_data') {
        dataset.datapoints = exports.getRandomDataPoints(cntEvents);
        addmetadataandreturn(dataset);
    } else if (params.datasource == 'csv') {
        exports.getCsvDataPoints(params, cntEvents, function(datapoints) {
            dataset.datapoints = datapoints;
            addmetadataandreturn(dataset);
        });
    } else {
        throw 'TODO datasource';
    }

    
    
}

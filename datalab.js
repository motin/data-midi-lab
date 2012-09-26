exports.foo = function(){
    console.log('foo');
};

exports.randinterval = function(min,max){
    var len = max-min;
    var p = min + parseInt(Math.random()*len);
    return p;
};

exports.getRandomDataPoints = function(cnt){
    console.log('getRandomDataPoints');

    dataset = [];
    for (i=0;i<cnt;i++) {
        dataset.push(exports.randinterval(0, 127));
    }
    return dataset;

};

exports.getDataSet = function(params){
    
    console.log('getDataSet', params);

    /*
        getDataSet { dataset: 'no_data',
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

    var dataset = {};
    if (params.dataset == 'no_data') {
        dataset.datapoints = exports.getRandomDataPoints(cntEvents);
    } else {
        throw 'TODO dataset';
    }
    
    dataset.bpm = bpm;
    dataset.bps = bps;
    dataset.spb = spb;
    dataset.durationSeconds = durationSeconds;
    dataset.ratePerSecond = ratePerSecond;
    dataset.msBetweenPoints = dataset.durationSeconds*1000/dataset.datapoints.length;

    return dataset;
    
}

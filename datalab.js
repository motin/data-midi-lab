exports.foo = function(){
    console.log('foo');
};

exports.randinterval = function(min,max){
    var len = max-min;
    var p = min + parseInt(Math.random()*len);
    return p;
};

exports.getRandomDataSet = function(cnt){
    console.log('getRandomDataSet');

    dataset = [];
    for (i=0;i<cnt;i++) {
        dataset.push(exports.randinterval(0, 127));
    }
    return dataset;

};

exports.dataToControlEvents = function(dataset, msBetweenEvents){
    console.log('dataToControlEvents', dataset);

    events = [];
    msFromStart = 0;
    for (i=0;i<dataset.length;i++) {
        events.push({
            type: 'control',
            value: dataset[i],
            at: Math.round(msBetweenEvents*i)
        })
    }
    return events;

};

exports.dataToNoteEvents = function(dataset, msBetweenEvents){
    console.log('dataToNoteEvents', dataset);

    events = [];
    msFromStart = 0;
    for (i=0;i<dataset.length;i++) {
        events.push({
            type: 'note',
            value: dataset[i],
            length: msBetweenEvents,
            velocity: 95,
            at: Math.round(msBetweenEvents*i)
        })
    }
    return events;

};

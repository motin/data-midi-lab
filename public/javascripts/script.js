(function($){
    // connect to socket.io
    var socket = io.connect('http://localhost'); // change to appropiate for network access

    ////////////

    var KeyBoard = function(el) {
        this._el = el;
        this.octave = 0;
        this.notes = {
            C:  60,
            Cs: 61,
            D:  62,
            Ds: 63,
            E:  64,
            F:  65,
            Fs: 66,
            G:  67,
            Gs: 68,
            A:  69,
            As: 70,
            B:  71
        };
        this.keys = {
            65: 'C',
            87: 'Cs',
            83: 'D',
            69: 'Ds',
            68: 'E',
            70: 'F',
            84: 'Fs',
            71: 'G',
            89: 'Gs',
            72: 'A',
            85: 'As',
            74: 'B'
        };
        this.controlKeys = {
            90: 'octaveDown',
            88: 'octaveUp'
        };
        this.init();
    };
    
    KeyBoard.prototype = function(){
        var init = function(){
            createKeys.call(this);
            bindEvents.call(this);
        },
        createKeys = function(){
            var self = this;
            $.each(this.notes, function(index,item){
                createKey.call(self,index,item);
            });
        },
        createKey = function(note,message){
            var key = $('<div/>').attr('rel',message).addClass(note).addClass('key').appendTo(this._el);
            if ( note.indexOf('s') > 0 ) {
                key.addClass('sharp');
            }
        },
        bindEvents = function(){
            var self = this,
            note, key, code, pressed = {};

            // Click
            this._el.find('.key').on('mousedown touchstart',function(e){
                e.preventDefault();
                note = $(this).attr('rel');
                noteDown.call(self,note);
            }).on('mouseup touchend',function(e){
                e.preventDefault();
                note = $(this).attr('rel');
                noteUp.call(self,note);
            });

            // Keyboard
            $(window).on('keydown',function(e){
                if ( self.keys[e.keyCode] ) {
                    e.preventDefault();
                    note = self.notes[self.keys[e.keyCode]];
                    key = getKey.call(self,note).addClass('active');
                    if ( pressed[note] !== true ) {
                        pressed[note] = true;
                        noteDown.call(self,note);
                    }
                } else if ( self.controlKeys[e.keyCode] ) {
                    code = self.controlKeys[e.keyCode];
                    if ( code === 'octaveUp' ) {
                        octaveUp.call(self);
                    } else if ( code === 'octaveDown') {
                        octaveDown.call(self);
                    }
                }
            }).on('keyup',function(e){
                if ( self.keys[e.keyCode] ) {
                    e.preventDefault();
                    note = self.notes[self.keys[e.keyCode]];
                    key = getKey.call(self,note).removeClass('active');
                    pressed[note] = false;
                    noteUp.call(self,note);
                }
            });

            // Remote Click
            socket.on('playeddown', function(data){
                getKey.call(self,data.message).addClass('active');
            });

            socket.on('playedup', function(data){
                getKey.call(self,data.message).removeClass('active');
            });
        },
        getKey = function(message) {
            return this._el.find('div[rel="'+message+'"]');
        },
        noteDown = function(note){
            var octavedNote = getNoteInOctave.call(this,note);
            socket.emit('notedown',{
                message: octavedNote
            });
        },
        noteUp = function(note){
            var octavedNote = getNoteInOctave.call(this,note);
            socket.emit('noteup',{
                message: octavedNote
            });
        },
        getNoteInOctave = function(note){
            var octave = this.octave;
            if ( octave === 0 ) {
                return note;
            } else {
                return ~~note + ( 12 * octave );
            }
        },
        octaveUp = function() {
            if ( this.octave === 4 ) {
                return;
            }
            this.octave += 1;
        },
        octaveDown = function() {
            if ( this.octave === -4 ) {
                return;
            }
            this.octave -= 1;
        };
        return {
            init: init
        };
    }();

    var keyboard = new KeyBoard($('#keyboard'));

    ////////////


    // send message on click
    $('#controller a').on('click', function(e){
        e.preventDefault();
        socket.emit('controller',{
            message: $(this).data('message')
        });
    });

    $('#compositions a').on('click', function(e){
        e.preventDefault();
        socket.emit('compositions',$(this).data());
    });

    $('#container a.transform').on('click', function(e){
        e.preventDefault();
        socket.emit('transform',$(this).data());
    });

    $('#container a.send').on('click', function(e){
        e.preventDefault();
        var tosend = {};
        var str = $($(this).data().source).html();
        if (str == '') {
            transform_anchor = $($(this).data().source).parent().children('a.transform');
            console.log($($(this).data().source).parent());
            console.log(transform_anchor);
            var todo_mark_that_transform_should_send_right_away;
            transform_anchor.click(todo_mark_that_transform_should_send_right_away);
            str = '{empty: true}';
            //str = $($(this).data().source).html();
            console.log('nothing to send, preview first...');
        } else {
            tosend = eval('tosend = ' + str + ';');
            socket.emit('send',{
                tosend: tosend
            });
        }
    });

    // State updates
    socket.on('update_preview', function(data){
        console.log('update_preview', data);
        $(data.destination).html(JSON.stringify(data.result));
    });

    socket.on('send_start', function(data){
        console.log('send_start', data);
    //$(data.destination).html(JSON.stringify(data.result));
    });

    socket.on('send_stop', function(data){
        console.log('send_stop', data);
    //$(data.destination).html(JSON.stringify(data.result));
    });

    socket.on('message', function (msg) {
        console.log('message', msg);
    })

    socket.on('error', function (err) {
        console.log('error', err);
    })

    /*
    socket.onError(function(err) {
        console.log(err);
    });
    */

    console.log('sdfsdf');

})(jQuery);
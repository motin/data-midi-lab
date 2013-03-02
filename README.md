# Data MIDI Lab - experiments/realtime-audio-to-midi-converter

An Node.JS / Socket.IO / MIDI Controller / Web Audio API experiment for converting microphone audio input to MIDI events sent to a virtual MIDI Controller (usable in for instance Reason)

## How to Install

    git clone https://github.com/motin/data-midi-lab.git -b experiments/realtime-audio-to-midi-converter
    cd data-midi-lab
    npm install
    git submodule init
    git submodule update
    cd modules/teoria
    npm install mingler
    npm install jake -g
    jake build
    cd ../..
    node app.js

Currently, the parameters adjusting MIDI conversion are hard-coded in app.js (in the 'convert' callback). Adjust these to your liking, then open [http://localhost:3001](http://localhost:3001) in a browser.

## License

This work is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/). To view a copy of this license, visit [http://creativecommons.org/licenses/by-sa/3.0/](http://creativecommons.org/licenses/by-sa/3.0/).

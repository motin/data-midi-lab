# Data MIDI Lab

A Node.js-based MIDI Controller and web frontend that allows you to generate MIDI notes and control data from arbitrary chunks of data.

Built on top of Matt Varone's [Node.JS / Socket.IO / MIDI Keyboard](https://github.com/sksmatt/nodejs-ableton-piano).

## How to Install

    sudo port install npm jake
    git clone https://github.com/motin/data-midi-lab.git -b develop
    cd data-midi-lab
    npm install
    git submodule init
    git submodule update
    cd modules/teoria
    npm install mingler
    jake build
    cd ../..
    node app.js

Then open [http://localhost:3001](http://localhost:3001) in a browser.

## License

This work is licensed under the [Creative Commons Attribution-ShareAlike 3.0 Unported License](http://creativecommons.org/licenses/by-sa/3.0/). To view a copy of this license, visit [http://creativecommons.org/licenses/by-sa/3.0/](http://creativecommons.org/licenses/by-sa/3.0/).

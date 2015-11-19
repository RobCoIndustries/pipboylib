# pipboylib

A companion pip boy library for Fallout 4

Totally a work in progress.

## Installation

You'll need node & npm. Go get 'em.

```
npm install pipboylib
```

## Usage

This is intended to become just a library, with a main outside. The prototype dumping cli is in `cli.js`. Run it with `node cli.js`.

For more programmatic usage of this library, use something like you see in `cli.js`.

## TODO

* [X] UDP Autodiscovery of other pip boy servers [Bronze]
* [X] UDP Relay of another pip boy server [Silver]
* [X] TCP Relay of another pip boy server [Silver]
* [ ] Decode initial stats response from a pip boy server [Gold]
* [ ] Figure out the map update protocol [Gold]
* [ ] Document the wire protocol app -> server [Gold]
* [ ] Document the wire protocol server -> app [Gold]
* [ ] Finish all of the above [Platinum]

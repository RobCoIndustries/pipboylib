# pipboylib

A companion pip boy library for Fallout 4.

See [pipboyrelay](https://github.com/rgbkrk/pipboyrelay) for an example usage.

Totally a work in progress. This is intended to become just a library, with a main outside. 

## Requirements

You'll need node & npm. Go get 'em then install `pipboylib`.

```
npm install pipboylib
```

In addition, you'll need Fallout 4 on PC, PS4, or XBONE.

## Usage

In order for the utilities provided here to work, you'll need a running Fallout 4 game with the pip-boy app enabled. In order to do the full relay, you'll also want the mobile app running.

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

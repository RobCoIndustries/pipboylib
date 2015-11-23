# pipboylib

[![npm version](https://badge.fury.io/js/pipboylib.svg)](https://badge.fury.io/js/pipboylib)

A companion library to the Fallout 4 pip boy app.

![It's Close to Metal!](https://8d8dcdd952aa2708c2ff-519cda130c91226e76017ae910bdb276.ssl.cf1.rackcdn.com/close-to-metal-ba0f30d76e986ef9fa02e7fbb1c3a8a954b268777325adf87250e3f0cfc4ef17.png)

See [pipboyrelay](https://github.com/rgbkrk/pipboyrelay) for an example usage.

Totally a work in progress. Checkout the TODO/ROADMAP to see what you could help with.

[Read the blog post for more details](https://getcarina.com/blog/fallout-4-service-discovery-and-relay)

## Requirements

You'll need Fallout 4 for the PC, PS4. XBONE doesn't work yet.

You'll need node & npm. Go get 'em then install `pipboylib`.

```
npm install pipboylib
```

In order for the utilities provided here to work, you'll need a running Fallout 4 game with the pip-boy app enabled. In order to do the full relay, you'll also want the mobile app running.

## Documentation

As we figure out the spec we'll document what we can over in [docs](docs):

* [App to Server Message Spec](docs/app-msg-spec.md)
* [Server to App Message Spec](docs/server-msg-spec.md)

## TODO

* [X] UDP Autodiscovery of PS4 pip boy servers on PS4 [Bronze]
* [ ] UDP Autodiscovery of PC pip boy servers on [Bronze]
* [ ] UDP Autodiscovery of XBONE pip boy servers on [Bronze]
* [X] UDP Relay of PS4 pip boy server [Silver]
* [X] TCP Relay of PS4 pip boy server [Silver]
* [ ] Decode initial stats response from a pip boy server [Gold]
* [ ] Figure out the map update protocol [Gold]
* [ ] Document the wire protocol app -> server [Gold]
* [ ] Document the wire protocol server -> app [Gold]
* [ ] Finish all of the above [Platinum]

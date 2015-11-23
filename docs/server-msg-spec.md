# Server to app protocol

### Basics

All values follow the little-endian encoding, strings are suspected to be UTF-8 or Latin-1.

The server listens on TCP port 27000 and immediately starts transmitting after a client connects. There is no specific handshake protocol. Thus far transmission always starts with two packets:

1. JSON-Document concerning language and version of the game
2. binary object tree containing all game-relevant data to display

The app can send JSON messages to the server (see [App to Server Message Spec](app-msg-spec.md)), otherwise the server keeps sending packages to the client whenever data updates become available.

### Basic structure

The basical protocol seems to be composed of packages prefixed by length (32-bit value) and type (8-bit value). After this the data follows directly, which may be in the same TCP package but may be not. Known types thus far:

- 0: ping/pong/keepalive
- 1: JSON text
- 3: binary object update

## 0 Ping/Pong keepalive

Whenever nothing specific happens, the server sends an empty (length = 0) package of type 0, which is copied by the app and sent back to the server.

## 1 JSON text

JSON text is just that. This comes up for example when the first connection is made.

## 3 binary objects

A binary object update package is basically a large collection of packages in the form of (type::int8, identifier::int32, content) where the content depends on the actual package type. The identifiers are arbitrary integers but in practice start from zero upwards. The identifier 0 (zero) denotes the root dictionary of the complete game data.

The easiest way to parse the initial object update is to read in all objects one by one (generating a large table of value -> object data)and then start building the object graph at object 0 (root) resolving array/dictionary references along the way.

After the initial update the game simply sends more object update packages, e.g. when the player moves, the object update package contains only two objects, the player's X and Y position. These are transmitted using the same identifiers as in the initial update. It is therefore necessary to track the link between object identifiers and game object graph to properly process the updates (e.g. a map position update may just be something like "float value 5764 = 1234.0, float value 5766 = 2345.0" on the wire).

### object types

| type | size (bytes) | meaning |
|------|------|---------|
| 0 | 1 | boolean value, indicating true (1) or false (0) |
| 1 | 1 | signed byte value (no values exceeding 0x7f have been observed yet) |
| 2 | 1 | unsigned byte value (no values exceeding 0x7f have been observed yet) |
| 3 | 4 | signed 32-bit integer value |
| 4 | 4 | unsigned 32-bit integer value |
| 5 | 4 | 32-bit floating point value |
| 6 | variable | zero-termined string (UTF-8?)
| 7 | 2 + 4 * size | array of objects; first a 2-byte integer value follows to give the number of elements to follow. Then exactly that amount of object identifiers (4 byte each) follows. |
| 8 | 2 + variable + 2| dictionary of objects; first a 2-byte integer value follows to give the number of key-value pairs. Then for each key-value pair first follows the identifier (4 byte) of the value object and then a zero-terminated key string. An additional two (zero?) bytes conclude the dictionary, their meaning has not been determined yet. |

## object graph contents

The object graph contains a variety of objects, both known to the player and yet unknown to the player (for example it seems to contain all locations already). For example to quickly look up the player's current special values, one can simply navigate through the object graph (here using python):

	for stat in root["Special"]:
		print "%s: %d" % (stat["Name"], stat["Value"])
		
This section probably needs a lot more expansion but the basic object graph is quite human-readable. For example root.Map.Local.Player.X denotes the local map player X position while Object.Inventory.[typeID].[arrayIndex].text is the name of an item.

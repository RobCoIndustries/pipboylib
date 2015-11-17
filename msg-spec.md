# Basic Structure

TCP messages from the app to the console are ASCII encoded JSON strings of the form:

```
{"type":<int>,"args":<any[]>,"id":<int>}
```

An example of this:  

```json
{"type":6,"args":[-71774.303255814,87841.2072351421,false],"id":11}
```

It appears that the app sends the console messages twice.  It's unknown if this
is intentional or not.

## Arguments
### type

**integer** used to represent the type of the message

### args

**array** array of arguments, of any type, to pass to the handler

### id

**integer** starting at 1 and incrementing by one for each message sent


## Oddities

Sometimes the JSON messages are prefixed with some binary data.  An example of
this follows:

```json
0x22 0x00 0x00 0x00 0x05 {"type":12,"args":[50308],"id":34}
```

### Theory A
`0x22` is `34`, which is the length of the ASCII contents that follows the binary 
contents.  `0x00000005` is 5, it's unknown what this stands for.


# Messages
Messages are by their **id** and nickname below.

## **6**: Set waypoint 

Sets a waypoint on the world map.

### args
*longitude?* **double**
*latitude?* **double**
*?* **boolean**

### Example

```json
{"type":6,"args":[-71774.303255814,87841.2072351421,false],"id":11}
```


## **9**: Fast travel

Fast travel to a location

### args
*locationId* **integer**

### Example

```json
{"type":9,"args":[48363],"id":15}
```


## **13**: Toggle local map view

Changes the map to/from world view from/to local view

### args
none

### Example

```json
{"type":13,"args":[],"id":18}
```


## **12**: Toggle a radio station

Toggles a radio station

### args
*ID* **integer**  Station ID

### Known station IDs

ID    | Name
----- | -------------
50313 | Diamond city
50308 | Classical

### Example

```json
{"type":12,"args":[50308],"id":34}
```


## **1**: Drop item

Drop an item from the player's inventory

### args
*?* **integer**
*pageIndex?* **integer**
*?* **integer**
*items?* **integer[]**

### Example

The following is an example of the item at index 0, a fedora, inside the apparel page (page index 1), getting dropped:  

```json
{"type":1,"args":[4207600413,1,0,[0]],"id":56}
```

import dissolve from 'dissolve'

function createDataStream() {
  return dissolve()
    .loop(function() {
      this
        .uint32("length")
        .int8("type")
        .tap(function() {
          if (this.vars.length) {
            this.buffer("data", this.vars.length);
          }
        })
        .tap(function() {
          this.push(this.vars);
          this.vars = {};
        });
    });
}

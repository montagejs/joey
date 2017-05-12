
var joey = require("../joey");
var MockFs = require("q-io/fs-mock");

var mockFs = MockFs({
    "a": {
        "b": {
            "c.txt": "Content of a/b/c.txt"
        }
    },
    "a/b/d.txt": new Buffer("Content of a/b/d.txt", "utf-8")
})

var server = joey // Hi.
  .blah() // log, handle errors, blah blah blah
  .fileTree('/', {fs: mockFs}) // Use mockFs
  .listen(8888) // start the server
  .then(function (server) { // when it has started
    // let us know
    console.log("Listening on", server.address().port);
  })
  .done();

/* <copyright>
Copyright (c) 2012, Motorola Mobility LLC.
All Rights Reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of Motorola Mobility LLC nor the names of its
  contributors may be used to endorse or promote products derived from this
  software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
</copyright> */

var HTTP = require("q-io/http");
var Joey = require("../joey");
var Q = require("q");

// TODO end

function scaffold(setup, tests) {
    return Object.keys(tests).reduce(function (done, test) {
        return done.then(function () {
            return setup(Joey.blah({
                log: function () {}
            }))
            .listen(0)
            .then(function (server) {
                var port = server.node.address().port;
                var parts = test.split(/ /);
                if (parts.length === 2) {
                    method = parts[0];
                    path = parts[1];
                } else {
                    method = "GET",
                    path = parts[0];
                }
                return HTTP.request({
                    url: "http://localhost:" + port + "/" + path,
                    method: method
                })
                .then(function (response) {
                    if (response.status === 200) {
                        if (typeof tests[test] === "string") {
                            return Q(response.body).invoke("read").then(function (content) {
                                expect(content.toString("utf-8")).toEqual(tests[test]);
                            });
                        }
                    } else {
                        if (typeof tests[test] === "number") {
                            expect(response.status).toEqual(tests[test]);
                        } else {
                            expect(response.status).toBe(200);
                        }
                    }
                }, function (error) {
                    expect(false).toBe(true);
                })
                .finally(server.stop);
            });
        });
    }, Q());
}

describe("routing", function () {

    it("produces inline content", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (pattern) {
                    pattern("text").content("Hello, World!");
                    pattern("html").ok("<h1>Hello</h1>", "text/html", 201);
                });
            },
            {
                "text": "Hello, World!",
                "html": 201
            }
        );
    })

    it("routes via this", function () {
        scaffold(
            function (Joey) {
                return Joey.route(function () {
                    this.any("text").content("Hello, World!");
                    this.GET("html").ok("<h1>Hello</h1>", "text/html", 201);
                });
            },
            {
                "text": "Hello, World!",
                "html": 201
            }
        );
    });

    it("routes cap", function () {
        return scaffold(
            function (Joey) {
                return Joey.cap().content("Hello, World!")
            },
            {
                "hi": 404
            }
        );
    });

    it("routes tap", function () {
        return scaffold(
            function (Joey) {
                return Joey.tap(function (request) {
                    expect(true).toBe(true);
                })
                .file((module.directory || __dirname) + "/fixture.txt");
            },
            {
                "": "Hello, World!\n"
            }
        );
    });

    it("routes trap", function () {
        return scaffold(
            function (Joey) {
                return Joey.trap(function (response) {
                    expect(response.status).toBe(200);
                    return response;
                })
                .file((module.directory || __dirname) + "/fixture.txt");
            },
            {
                "": "Hello, World!\n"
            }
        );
    });

    it("routes empty", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {});
            },
            {
                "": 404,
                "x": 404,
                "x/y": 404,
            }
        );
    });

    it("routes optional", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY(":a?/:b?/:c?").app(template("$a $b $c"));
                });
            },
            {
                "a/b/c": "a b c",
                "a/b/": "a b ",
                "a/b": "a b ",
                "a/": "a  ",
                "a": "a  ",
                "": "  "
            }
        );
    });

    it("routes rest", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY("a/...").app(template("@pathInfo"));
                    ANY("d/:e/...").app(template("$e @pathInfo"));
                    ANY("g/:h?/...").app(template("$h @pathInfo"));
                });
            },
            {
                "a/b/c": "/b/c",
                "d": 404,
                "d/": 404,
                "d/e": "e ",
                "d/e/f": "e /f",
                "g": " ",
                "g/": " ",
                "g/h": "h ",
                "g/h/": "h /",
                "g/h/i": "h /i"
            }
        );
    });

    it("routes rest alone", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY("...").app(template("@pathInfo"));
                });
            },
            {
                "x/y/z": "/x/y/z"
            }
        );
    });

    it("routes anonymous", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY(":/:/:").app(template("$0 $1 $2"));
                });
            },
            {
                "a/b/c": "a b c"
            }
        );
    });

    it("routes star", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY("*a").app(template("$a"));
                });
            },
            {
                "foo": "foo"
            }
        );
    });

    it("routes star anonymous", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY("*").app(template("$0"));
                });
            },
            {
                "foo": "foo"
            }
        );
    });

    it("routes star interaction", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY) {
                    ANY("a/*").app(template("$0"));
                    ANY("b/*b").app(template("$b"));
                    ANY("c/*c?").app(template("$c"));
                });
            },
            {
                "a/b/c": "b/c",
                "a/b": "b",
                "a/": "",
                "a": 404,
                "b/c/d": "c/d",
                "b/c/": "c/",
                "b/c": "c",
                "b/": "",
                "b": 404,
                "c/d/e": "d/e",
                "c/d/": "d/",
                "c/d": "d",
                "c/": "",
                "c": "",
            }
        );
    });

    it("routes prefix", function () {
        return scaffold(
            function (Joey) {
                return Joey.route("/", function (ANY) {
                    ANY("foo...").route("", function (ANY) {
                        ANY("/").app(template("text"));
                        ANY(".html").app(template("<html>"));
                    });
                });
            },
            {
                "foo/": "text",
                "foo.html": "<html>"
            }
        );
    });

    it("routes chain", function () {
        return scaffold(
            function (Joey) {
                return Joey.route("/", function (ANY) {
                    ANY("foo...").route(function (ANY) {
                        ANY("bar").app(template("foobar"));
                    });
                });
            },
            {
                "foo/bar": "foobar",
            }
        );
    });

    it("routes install object", function () {
        return scaffold(
            function (Joey) {
                return Joey.install({
                    "template": template
                })
                .route(function (ANY) {
                    ANY(":foo/:bar").template("$foo: $bar")
                })
            },
            {
                "a/b": "a: b"
            }
        );
    });

    it("routes install function", function () {
        return scaffold(
            function (Joey) {
                return Joey.install(template)
                .route(function (ANY) {
                    ANY(":foo/:bar").template("$foo: $bar")
                })
            },
            {
                "a/b": "a: b"
            }
        );
    });

    it("routes route continuation", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function ($) {
                    $("foo").content("foo");
                    $("bar").trap(function (response) {
                        expect(response.body).toEqual(["fallback"]);
                        return response;
                    })
                })
                .content("fallback");
            },
            {
                "foo": "foo",
                "bar": "fallback"
            }
        );
    });

    it("accepts a positional argument all the way to DELETE", function () {
        return scaffold(
            function (Joey) {
                return Joey.route(function (ANY, GET, PUT, POST, DELETE) {
                    DELETE("text").content("Hello, World!");
                });
            },
            {
                "GET text": 404,
                "DELETE text": "Hello, World!"
            }
        );
    });

});

function template(template) {
    return function (request) {
        return {
            "status": 200,
            "headers": {"content-type": "text/plain"},
            "body": [template.replace(/([$@%])([\w\d]+)/g, function (_, symbol, name) {
                if (symbol === "$") {
                    return request.params[name];
                } else if (symbol === "@") {
                    return request[name];
                } else if (symbol == "%") {
                    return request.headers[name];
                }
            })]
        }
    }
}


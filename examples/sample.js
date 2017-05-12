
var joey = require("../joey");

joey.log()
    .error()
    .favicon()
    .route(function ($) {

        $("")
        .method("GET")
        .contentType("text/plain")
        .content("Hello, World!")

        $("hello/:name")
        .method("GET")
        .contentType("text/html")
        .contentApp(function (request) {
            return "Hello, " + request.params.name + "!\n";
        })

        $("store")
        .methods(function ($) {

            var content = "\n";

            $("GET")
            .contentType("text/plain")
            .contentApp(function () {
                return content;
            });

            $("PUT")
            .tap(function (request) {
                return request.body.read()
                .then(function (_content) {
                    content = _content.toString("utf-8");
                });
            })
            .redirect("");

        })

        $("files/...").fileTree("."); // danger!

    })
    .listen(8080)
    .then(function () {
        console.log("Listening on 8080")

        // client
        var request = require("../joey").redirectTrap(20).client();

        request("http://localhost:8080")
        .then(function (response) {
            console.log(response.status, response.headers);
            response.body.read()
            .invoke('toString', 'utf-8')
            .then(console.log)
        })
    })
    .done()
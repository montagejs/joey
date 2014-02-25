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

var Joey = require("../joey");

xdescribe("cookies", function () {
    ["localhost", "127.0.0.1"].forEach(function (host) {
        it("manages cookies on host " + host, function () {
            var request = Joey.normalize().cookieJar().client();
            return J.log().app(function (request) {
                return {
                    status: 200,
                    headers: {"set-cookie": "a=10; MaxAge=1"},
                    body: [request.headers.cookie || ""]
                }
            })
            .listen(0)
            .then(function (server) {
                var port = server.node.address().port;
                return request("http://" + host + ":" + port)
                .get("body")
                .invoke("read")
                .invoke("toString", "utf-8")
                .then(function (content) {
                    expect(content).toBe(""); // no cookie first time
                    return request("http://" + host + ":" + port)
                    .get("body")
                    .invoke("read")
                    .invoke("toString", "utf-8")
                })
                .then(function (content) {
                    expect(content).toBe("a=10"); // cookie set second time
                })
                .delay(2000)
                .then(function () {
                    return request("http://" + host + ":" + port)
                    .get("body")
                    .invoke("read")
                    .invoke("toString", "utf-8")
                })
                .then(function (content) {
                    expect(content).toBe(""); // no cookie after expiry
                })
                .finally(server.stop)
            })
        });
    });
});


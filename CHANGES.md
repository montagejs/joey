# 1.5.1

-   Updates dependency versions. Q-IO vq-io, Q 1.5.0

# 1.5.0

-   Updates dependency versions. Q-IO v1.1, Q 1.0.
-   Threads the `fs` argument through the `file` adaptor.

# 1.4.0

-   `bin/joey` now supports priviledge descalation with the `-u UID` argument.

# 1.3.3

-   Update dependency on Q-IO, to obtain fixes for host negotiation decision
    tracking and ranged HTTP requests for files.

# 1.3.2

-   Update dependencies. Particularly, fixes host negotiation.

# 1.3.1

-   Update dependencies.

# 1.3.0

-   Support route.any (@wmertens)

# 1.2.1

-   Update dependencies.

# 0.0.12

-   Prepare for launch.

# 0.0.11

-   Added ``parseQuery()`` and ``normalize()`` to common
    adapters.
-   Added ``cookieJar()``.
-   Synchronized q-http and jaque, particularly for query
    string bug fix on pathInfo.

# 0.0.10

-   Added ``proxyTree(url)`` / ``proxyTree(app)``

# 0.0.9

-   Added ``proxy(url)`` or ``proxy(app)``.
-   Fixed dependencies.

# 0.0.8

-   Added ``redirect``, ``redirectTree`` using ``permanent``
    decoration to elect permanent redirects over the default of
    temporary.
-   Added ``trap`` for intercepting responses.
-   Added client-ware like ``normal``, ``cookieJar``,
    ``redirectTrap``, and terminal ``client``.
-   Added name ``useCommon`` for ``blahblahblah``

# 0.0.7

-   Synchronized dependencies.

# 0.0.6

-   Synchronized dependencies.

# 0.0.5

-   Upgraded Jaque to 0.1.19 for the use of redirects in
    file trees.

# 0.0.4

-   Consolidated "connect" and "enclose" into the new,
    singular "use" function.
-   Synchronized dependencies for bug fix in IO.
-   Simplified internal chaining structures.


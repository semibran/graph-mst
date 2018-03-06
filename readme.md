# graph-mst
> generates a minimum spanning tree from a weighted graph

![demo](img/demo.gif)

This module exposes the `span` function, which uses [Prim's algorithm] to generate a [minimum spanning tree] from a weighted graph.

## usage

### `span(graph) -> tree`
Converts a `graph` with the fields `nodes : [ x, y ]` and `edges : { endpoints : [ ...nodeIndices ], weight: Number }` to a minimum spanning tree.

[Prim's algorithm]:      https://en.wikipedia.org/wiki/Prim%27s_algorithm
[Minimum spanning tree]: https://en.wikipedia.org/wiki/Minimum_spanning_tree

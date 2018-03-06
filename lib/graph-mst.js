module.exports = function span(graph) {
  var edges = []
  var indices = [ 0 ]
  while (indices.length < graph.nodes.length) {
    var shortest = null
    var target = null
    for (var i = 0; i < indices.length; i++) {
      var index = indices[i]
      var node = graph.nodes[index]
      for (var j = 0; j < graph.edges.length; j++) {
        var edge = graph.edges[j]
        var a = edge.endpoints[0]
        var b = edge.endpoints[1]
        var t = -1
        if (a === index) {
          t = b
        } else if (b === index) {
          t = a
        }
        if ((t !== -1 && indices.indexOf(t) === -1)
        && (!shortest || edge.weight < shortest.weight)
        ) {
          shortest = edge
          target = t
        }
      }
    }
    if (shortest) {
      edges.push(shortest)
      indices.unshift(target)
    }
  }
  return {
    nodes: graph.nodes.slice(),
    edges: edges
  }
}

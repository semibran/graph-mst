module.exports = function span(graph) {
  var tree = {
    nodes: graph.nodes.slice(),
    edges: []
  }
  var edges = graph.edges
    .slice()
    .sort(function (a, b) { return a.weight - b.weight })
  var indices = [ 0 ]
  while (indices.length < graph.nodes.length) {
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i]
      var a = edge.endpoints[0]
      var b = edge.endpoints[1]
      for (var j = 0; j < indices.length; j++) {
        var o = indices[j]
        var t = -1
        if (a === o) {
          t = b
        } else if (b === o) {
          t = a
        }
        if (t !== -1) {
          break
        }
      }
      if (t !== -1) {
        if (indices.indexOf(t) === -1) {
          indices.push(t)
          tree.edges.push(edge)
        }
        edges.splice(i, 1)
        break
      }
    }
  }
  return tree
}

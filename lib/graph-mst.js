module.exports = function span(graph) {
  var prospects = graph.edges.slice()
  var edges = []
  var indices = [ 0 ]
  while (prospects.length && indices.length < graph.nodes.length) {
    var shortest = null
    var target = null
    var index = null
    for (var i = 0; i < indices.length; i++) {
      var o = indices[i]
      for (var j = 0; j < prospects.length; j++) {
        var edge = prospects[j]
        var a = edge.endpoints[0]
        var b = edge.endpoints[1]
        var t = -1
        if (a === o) {
          t = b
        } else if (b === o) {
          t = a
        }
        if (t === -1 || indices.indexOf(t) !== -1) continue
        if (!shortest || edge.weight < shortest.weight) {
          shortest = edge
          target = t
          index = j
        }
      }
    }
    if (shortest) {
      edges.push(shortest)
      indices.push(target)
      prospects.splice(index, 1)
    }
  }
  return {
    nodes: graph.nodes.slice(),
    edges: edges
  }
}

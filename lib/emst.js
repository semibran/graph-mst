module.exports = function span(graph) {
  var tree = { nodes: [ graph.nodes[0] ], edges: [] }
  while (tree.nodes.length < graph.nodes.length) {
    var shortest = Infinity
    var origin = -1
    var target = null
    for (var i = 0; i < tree.nodes.length; i++) {
      var node = tree.nodes[i]
      for (var j = 0; j < graph.edges.length; j++) {
        var edge = graph.edges[j]
        var o = -1
        if (edge[0] === i) {
          o = edge[1]
        } else if (edge[1] === i) {
          o = edge[0]
        }
        var other = graph.nodes[o]
        if (other && tree.nodes.indexOf(other) === -1) {
          var distance = euclidean(node, other)
          if (distance < shortest) {
            shortest = distance
            origin = i
            target = other
          }
        }
      }
    }
    var index = tree.nodes.length
    tree.nodes.push(target)
    tree.edges.push([ origin, index ])
  }
  return tree
}

function euclidean(a, b) {
  var quadrance = 0
  var dimensions = Math.max(a.length, b.length)
  for (var i = 0; i < dimensions; i++) {
    var distance = (b[i] || 0) - (a[i] || 0)
    quadrance += distance * distance
  }
  return Math.sqrt(quadrance)
}

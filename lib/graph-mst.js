module.exports = function span(graph) {
  var tree = {
    nodes: graph.nodes.slice(),
    edges: []
  }
  var edges = graph.edges
    .slice()
    .sort(function (a, b) { return a.weight - b.weight })
  var nodes = [ 0 ]
  for (var i = 0; nodes.length < graph.nodes.length; i++) {
    var edge = edges[i]
    var a = edge.endpoints[0]
    var b = edge.endpoints[1]
    for (var j = 0; j < nodes.length; j++) {
      var origin = nodes[j]
      var target = -1
      if (a === origin) {
        target = b
      } else if (b === origin) {
        target = a
      }
      if (target !== -1) {
        if (nodes.indexOf(target) === -1) {
          nodes.push(target)
          tree.edges.push(edge)
          edges.splice(i, 1)
          i = -1
        }
        break
      }
    }
  }
  return tree
}

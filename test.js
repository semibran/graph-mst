const span = require("./lib/emst")
const radius = 128
const graph = {
  edges: [],
  nodes: new Array(32)
    .fill()
    .map(_ => {
      let direction = Math.random() * 2 * Math.PI
      let magnitude = Math.sqrt(Math.random())
      return [
        Math.cos(direction) * magnitude * radius,
        Math.sin(direction) * magnitude * radius
      ]
    })
}

for (let i = 0; i < graph.nodes.length - 1; i++) {
  for (let j = i + 1; j < graph.nodes.length; j++) {
    graph.edges.push([ i, j ])
  }
}

let tree = span(graph)
let state = {
  graph: tree,
  viewport: {
    halfsize: [ radius * 2, radius * 2 ],
    position: [ 0, 0 ]
  }
}

let context = render(state)
document.body.appendChild(context.canvas)

function render({ graph, viewport }, context) {
  let canvas = null
  if (context) {
    canvas = context.canvas
  } else {
    canvas = document.createElement("canvas")
    context = canvas.getContext("2d")
  }
  canvas.width = viewport.halfsize[0] * 2
  canvas.height = viewport.halfsize[1] * 2
  context.fillStyle = "black"
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (let edge of graph.edges) {
    let nodes = edge.map(i =>
      graph.nodes[i].map((x, i) =>
        x + viewport.halfsize[i]
      )
    )
    context.beginPath()
    context.moveTo(...nodes[0])
    context.lineTo(...nodes[1])
    context.strokeStyle = "white"
    context.stroke()
  }
  for (let node of graph.nodes) {
    let x = node[0] + viewport.halfsize[0]
    let y = node[1] + viewport.halfsize[1]
    context.beginPath()
    context.arc(x, y, 2, 0, 2 * Math.PI)
    context.fillStyle = "white"
    context.fill()
  }
  return context
}

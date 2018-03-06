import span from "../../lib/graph-mst"
import euclidean from "euclidean"

const width = window.innerWidth
const height = window.innerHeight

let graph = {
  edges: [],
  nodes: new Array(128)
    .fill()
    .map(_ => {
      let direction = Math.random() * 2 * Math.PI
      let magnitude = Math.sqrt(Math.random())
      return [
        Math.cos(direction) * magnitude,
        Math.sin(direction) * magnitude
      ]
    })
}

graph.nodes.sort((a, b) => euclidean([ 0, 0 ], a) - euclidean([ 0, 0 ], b))

for (let i = 0; i < graph.nodes.length - 1; i++) {
  for (let j = i + 1; j < graph.nodes.length; j++) {
    graph.edges.push({
      endpoints: [ i, j ],
      weight: euclidean(graph.nodes[i], graph.nodes[j])
    })
  }
}

let tree = span(graph)
let state = {
  graph: tree,
  animation: {
    time: 0,
    phase: "spawn",
    nodes: [],
    edges: [],
    lines: [],
    history: []
  },
  viewport: {
    scale: Math.min(width, height) / 2.5,
    halfsize: [ width / 2, height / 2 ],
    position: [ 0, 0 ]
  }
}

let canvas = document.createElement("canvas")
let context = canvas.getContext("2d")
canvas.width = width
canvas.height = height
document.body.appendChild(canvas)
requestAnimationFrame(loop)

function loop() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  let { graph, animation, viewport } = state
  const scale = (x, i) => x * viewport.scale + viewport.halfsize[i]
  let phase = animation[animation.phase]
  if (animation.phase === "spawn") {
    if (animation.time < graph.nodes.length) {
      animation.nodes.push([ 0, 0 ])
    }
    let farthest = 0
    for (let i = 0; i < animation.nodes.length; i++) {
      let position = animation.nodes[i]
      let target = graph.nodes[i]
      let next = animation.nodes[i] = [
        position[0] + (target[0] - position[0]) / 16,
        position[1] + (target[1] - position[1]) / 16
      ]
      let distance = euclidean(position, target)
      if (distance > farthest) {
        farthest = distance
      }
    }
    if (farthest < 1 / 256) {
      animation.phase = "connect"
      animation.nodes = graph.nodes
    }
  } else if (animation.phase === "connect") {
    let { lines, history } = animation
    if (!lines.length) {
      let best = { distance: Infinity, node: null }
      for (let node of graph.nodes) {
        let distance = Math.sqrt(node[0] * node[0] + node[1] * node[1])
        if (distance < best.distance) {
          best.distance = distance
          best.node = node
        }
      }
      history.push(best.node)
      lines.push({
        origin: best.node,
        position: best.node.slice(),
        target: null
      })
    }
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]
      if (!line.target) {
        for (let edge of graph.edges) {
          let [ a, b ] = edge.endpoints.map(i => graph.nodes[i])
          let target = null
          if (a === line.origin) {
            target = b
          } else if (b === line.origin) {
            target = a
          }
          if (target && history.indexOf(target) === -1) {
            history.push(target)
            if (!line.target) {
              line.target = target
            } else {
              lines.push({
                origin: line.origin,
                position: line.origin.slice(),
                target: target
              })
            }
          }
        }
        if (!line.target) {
          lines.splice(i--, 1)
          continue
        }
      }
      let distance = euclidean(line.position, line.target)
      if (distance < 1 / 64) {
        animation.edges.push([ line.origin, line.target ])
        line.origin = line.target
        line.position = line.target.slice()
        line.target = null
        if (animation.edges.length === graph.edges.length) {
          animation.phase = "done"
        }
      } else {
        let delta = [
          line.target[0] - line.origin[0],
          line.target[1] - line.origin[1]
        ]
        let direction = Math.atan2(delta[1], delta[0])
        line.position[0] += Math.cos(direction) * 1 / 64,
        line.position[1] += Math.sin(direction) * 1 / 64
      }
    }
  }

  for (let line of animation.lines) {
    context.strokeStyle = "gray"
    context.beginPath()
    context.moveTo(...line.origin.map(scale))
    context.lineTo(...line.position.map(scale))
    context.stroke()
  }

  for (let node of animation.nodes) {
    context.fillStyle = "white"
    context.beginPath()
    context.arc(...node.map(scale), 1, 0, 2 * Math.PI)
    context.fill()
  }

  for (let edge of animation.edges) {
    let [ a, b ] = edge

    context.strokeStyle = "white"
    context.beginPath()
    context.moveTo(...a.map(scale))
    context.lineTo(...b.map(scale))
    context.stroke()

    context.fillStyle = "white"
    context.beginPath()
    context.arc(...a.map(scale), 2, 0, 2 * Math.PI)
    context.fill()
    context.beginPath()
    context.arc(...b.map(scale), 2, 0, 2 * Math.PI)
    context.fill()
  }

  if (animation.phase !== "done") {
    animation.time++
    requestAnimationFrame(loop)
  }
}

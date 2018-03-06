(function () {
'use strict';

var graphMst = function span(graph) {
  var tree = {
    nodes: graph.nodes.slice(),
    edges: []
  };
  var edges = graph.edges
    .slice()
    .sort(function (a, b) { return a.weight - b.weight });
  var nodes = [ 0 ];
  for (var i = 0; nodes.length < graph.nodes.length; i++) {
    var edge = edges[i];
    var a = edge.endpoints[0];
    var b = edge.endpoints[1];
    for (var j = 0; j < nodes.length; j++) {
      var origin = nodes[j];
      var target = -1;
      if (a === origin) {
        target = b;
      } else if (b === origin) {
        target = a;
      }
      if (target !== -1) {
        if (nodes.indexOf(target) === -1) {
          nodes.push(target);
          tree.edges.push(edge);
          edges.splice(i, 1);
          i = -1;
        }
        break
      }
    }
  }
  return tree
};

var euclidean = function distance(a, b) {
  var quadrance = 0;
  var dimensions = Math.max(a.length, b.length);
  for (var i = 0; i < dimensions; i++) {
    var distance = (b[i] || 0) - (a[i] || 0);
    quadrance += distance * distance;
  }
  return Math.sqrt(quadrance)
};

let size = Math.min(window.innerWidth, window.innerHeight);
let graph = {
  edges: [],
  nodes: new Array(512)
    .fill()
    .map(_ => {
      let direction = Math.random() * 2 * Math.PI;
      let magnitude = Math.sqrt(Math.random());
      return [
        Math.cos(direction) * magnitude,
        Math.sin(direction) * magnitude
      ]
    })
};

graph.nodes.sort((a, b) => euclidean([ 0, 0 ], a) - euclidean([ 0, 0 ], b));

for (let i = 0; i < graph.nodes.length - 1; i++) {
  for (let j = i + 1; j < graph.nodes.length; j++) {
    graph.edges.push({
      endpoints: [ i, j ],
      weight: euclidean(graph.nodes[i], graph.nodes[j])
    });
  }
}

let tree = graphMst(graph);
let state = {
  graph: tree,
  animation: {
    phase: "spawn",
    nodes: [],
    edges: [],
    lines: [],
    history: []
  },
  viewport: {
    scale: size / 2.5,
    halfsize: [ size / 2, size / 2 ],
    position: [ 0, 0 ]
  }
};

let context = render(state);
document.body.appendChild(context.canvas);
requestAnimationFrame(loop);

function loop() {
  let { graph, animation } = state;
  let phase = animation[animation.phase];
  if (animation.phase === "spawn") {
    if (animation.nodes.length < graph.nodes.length) {
      animation.nodes.push([ 0, 0 ]);
    }
    let farthest = 0;
    for (let i = 0; i < animation.nodes.length; i++) {
      let position = animation.nodes[i];
      let target = graph.nodes[i];
      let next = animation.nodes[i] = [
        position[0] + (target[0] - position[0]) / 16,
        position[1] + (target[1] - position[1]) / 16
      ];
      let distance = euclidean(position, target);
      if (distance > farthest) {
        farthest = distance;
      }
    }
    if (farthest < 1 / 256) {
      animation.phase = "connect";
      animation.nodes = graph.nodes;
    }
  } else if (animation.phase === "connect") {
    let { lines, history } = animation;
    if (!lines.length) {
      let best = { distance: Infinity, node: null };
      for (let node of graph.nodes) {
        let distance = Math.sqrt(node[0] * node[0] + node[1] * node[1]);
        if (distance < best.distance) {
          best.distance = distance;
          best.node = node;
        }
      }
      history.push(best.node);
      lines.push({
        origin: best.node,
        position: best.node.slice(),
        target: null
      });
    }
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (!line.target) {
        for (let edge of graph.edges) {
          let [ a, b ] = edge.endpoints.map(i => graph.nodes[i]);
          let target = null;
          if (a === line.origin) {
            target = b;
          } else if (b === line.origin) {
            target = a;
          }
          if (target && history.indexOf(target) === -1) {
            history.push(target);
            if (!line.target) {
              line.target = target;
            } else {
              lines.push({
                origin: line.origin,
                position: line.origin.slice(),
                target: target
              });
            }
          }
        }
        if (!line.target) {
          lines.splice(i--, 1);
          continue
        }
      }
      let distance = euclidean(line.position, line.target);
      if (distance < 1 / 64) {
        animation.edges.push([ line.origin, line.target ]);
        line.origin = line.target;
        line.position = line.target.slice();
        line.target = null;
        if (animation.edges.length === graph.edges.length) {
          animation.phase = "done";
        }
      } else {
        let delta = [
          line.target[0] - line.origin[0],
          line.target[1] - line.origin[1]
        ];
        let direction = Math.atan2(delta[1], delta[0]);
        line.position[0] += Math.cos(direction) * 1 / 64, line.position[1] += Math.sin(direction) * 1 / 64;
      }
    }
  }

  render(state, context);

  if (animation.phase !== "done") {
    console.log(state);
    requestAnimationFrame(loop);
  }
}

function render(state, context) {
  let { animation, viewport } = state;
  let scale = adjust.bind(null, viewport);
  let canvas = null;
  if (!context) {
    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    canvas.width = viewport.halfsize[0] * 2;
    canvas.height = viewport.halfsize[1] * 2;
  } else {
    canvas = context.canvas;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let line of animation.lines) {
    context.strokeStyle = "gray";
    context.beginPath();
    context.moveTo(...line.origin.map(scale));
    context.lineTo(...line.position.map(scale));
    context.stroke();
  }

  for (let node of animation.nodes) {
    context.fillStyle = "white";
    context.beginPath();
    context.arc(...node.map(scale), 1, 0, 2 * Math.PI);
    context.fill();
  }

  for (let edge of animation.edges) {
    let [ a, b ] = edge;

    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(...a.map(scale));
    context.lineTo(...b.map(scale));
    context.stroke();

    context.fillStyle = "white";
    context.beginPath();
    context.arc(...a.map(scale), 2, 0, 2 * Math.PI);
    context.fill();
    context.beginPath();
    context.arc(...b.map(scale), 2, 0, 2 * Math.PI);
    context.fill();
  }

  return context
}

function adjust(viewport, x, i) {
  return x * viewport.scale + viewport.halfsize[i] - viewport.position[i]
}

}());
//# sourceMappingURL=script.js.map

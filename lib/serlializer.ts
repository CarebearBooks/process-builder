import { Step, FlowGraph, FlowNode, FlowEdge } from "@/src/types/step"

export function stepsToGraph(steps: Step[]): FlowGraph {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  // START node — centered
  nodes.push({
    id: 'start',
    type: 'startNode',
    position: { x: 280, y: 0 },
    data: { label: 'START' },
  })

  // Step nodes
  steps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      type: 'stepNode',
      position: { x: 180, y: (index + 1) * 160 },
      data: { step },
    })
  })

  // END node
  nodes.push({
    id: 'end',
    type: 'endNode',
    position: { x: 280, y: (steps.length + 1) * 160 },
    data: { label: 'END' },
  })

  // Edges — linear chain START → step1 → ... → END
  const allIds = ['start', ...steps.map((s) => s.id), 'end']
  allIds.forEach((id, index) => {
    if (index < allIds.length - 1) {
      edges.push({
        id: `e-${id}-${allIds[index + 1]}`,
        source: id,
        target: allIds[index + 1],
      })
    }
  })

  return { nodes, edges }
}

export function graphToSteps(graph: FlowGraph): Step[] {
  const { nodes, edges } = graph
  const stepNodes = nodes.filter((n) => n.type === 'stepNode')

  // Build adjacency map
  const nextMap: Record<string, string> = {}
  edges.forEach((e) => { nextMap[e.source] = e.target })

  // Walk from START following edges
  const ordered: Step[] = []
  let current = 'start'
  const visited = new Set<string>()

  while (current && !visited.has(current)) {
    visited.add(current)
    const node = nodes.find((n) => n.id === current)
    if (node?.type === 'stepNode' && node.data.step) {
      ordered.push(node.data.step)
    }
    current = nextMap[current]
  }

  // Append any orphaned nodes not reachable from START
  const reachedIds = new Set(ordered.map((s) => s.id))
  stepNodes.forEach((n) => {
    if (n.data.step && !reachedIds.has(n.id)) {
      ordered.push(n.data.step)
    }
  })

  return ordered
}
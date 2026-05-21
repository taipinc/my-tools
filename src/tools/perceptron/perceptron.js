const RETINA_SIZE = 20;
const NUM_PIXELS = RETINA_SIZE * RETINA_SIZE;
const NUM_ASSOCIATION = 512;
const NUM_OUTPUTS = 2;

// Each association unit connects to a random subset of retina pixels
// and has a threshold for firing.
export function createAssociationLayer() {
  const units = [];
  for (let i = 0; i < NUM_ASSOCIATION; i++) {
    // Each unit connects to ~10-40 random pixels
    const numConnections = Math.floor(Math.random() * 31) + 10;
    const connections = new Set();
    while (connections.size < numConnections) {
      connections.add(Math.floor(Math.random() * NUM_PIXELS));
    }
    const connectionArray = Array.from(connections);
    // Threshold: fire if ~30% of connected pixels are active
    const threshold = Math.max(1, Math.ceil(numConnections * 0.3));
    units.push({ connections: connectionArray, threshold });
  }
  return units;
}

// Compute association unit activations given retina input
export function computeAssociationActivations(retina, associationUnits) {
  const activations = new Float32Array(NUM_ASSOCIATION);
  for (let i = 0; i < NUM_ASSOCIATION; i++) {
    const unit = associationUnits[i];
    let sum = 0;
    for (const pixelIdx of unit.connections) {
      sum += retina[pixelIdx];
    }
    activations[i] = sum >= unit.threshold ? 1 : 0;
  }
  return activations;
}

// Initialize output weights to small random values
export function createOutputWeights() {
  const weights = [];
  for (let o = 0; o < NUM_OUTPUTS; o++) {
    const w = new Float32Array(NUM_ASSOCIATION);
    for (let i = 0; i < NUM_ASSOCIATION; i++) {
      w[i] = (Math.random() - 0.5) * 0.1;
    }
    weights.push(w);
  }
  return weights;
}

export function createOutputBiases() {
  return new Float32Array(NUM_OUTPUTS); // initialized to 0
}

// Compute output scores (weighted sum of association activations + bias)
export function computeOutputScores(associationActivations, weights, biases) {
  const scores = new Float32Array(NUM_OUTPUTS);
  for (let o = 0; o < NUM_OUTPUTS; o++) {
    let sum = biases[o];
    for (let i = 0; i < NUM_ASSOCIATION; i++) {
      sum += weights[o][i] * associationActivations[i];
    }
    scores[o] = sum;
  }
  return scores;
}

// Get prediction (index of the winning output unit)
export function predict(scores) {
  return scores[0] >= scores[1] ? 0 : 1;
}

// Perceptron learning rule:
// Reinforce correct unit, punish incorrect unit, for active association units
export function learn(weights, biases, associationActivations, correctLabel, learningRate) {
  const incorrectLabel = correctLabel === 0 ? 1 : 0;
  const newWeights = weights.map((w) => new Float32Array(w));
  const newBiases = new Float32Array(biases);

  for (let i = 0; i < NUM_ASSOCIATION; i++) {
    if (associationActivations[i] > 0) {
      newWeights[correctLabel][i] += learningRate;
      newWeights[incorrectLabel][i] -= learningRate;
    }
  }
  newBiases[correctLabel] += learningRate;
  newBiases[incorrectLabel] -= learningRate;

  return { weights: newWeights, biases: newBiases };
}

// Project output weights back through association connections onto the retina.
// For each output unit, compute a 20x20 heatmap: each pixel accumulates the
// weight of every association unit that connects to it.
export function computeReceptiveFields(weights, associationUnits) {
  const fields = [];
  for (let o = 0; o < NUM_OUTPUTS; o++) {
    const field = new Float32Array(NUM_PIXELS);
    for (let a = 0; a < NUM_ASSOCIATION; a++) {
      const w = weights[o][a];
      for (const pixelIdx of associationUnits[a].connections) {
        field[pixelIdx] += w;
      }
    }
    fields.push(field);
  }
  return fields;
}

export { RETINA_SIZE, NUM_PIXELS, NUM_ASSOCIATION, NUM_OUTPUTS };

import { useState, useMemo, useCallback } from "react";
import {
  NUM_PIXELS,
  createAssociationLayer,
  computeAssociationActivations,
  createOutputWeights,
  createOutputBiases,
  computeOutputScores,
  predict,
  learn,
  computeReceptiveFields,
} from "./perceptron";
import RetinaInput from "./components/RetinaInput";
import NetworkViz from "./components/NetworkViz";
import OutputPanel from "./components/OutputPanel";
import WeightViz from "./components/WeightViz";
import ControlPanel from "./components/ControlPanel";
import ReceptiveFieldViz from "./components/ReceptiveFieldViz";

function App() {
  const [associationUnits] = useState(() => createAssociationLayer());
  const [retina, setRetina] = useState(() => new Array(NUM_PIXELS).fill(0));
  const [weights, setWeights] = useState(() => createOutputWeights());
  const [biases, setBiases] = useState(() => createOutputBiases());
  const [labels, setLabels] = useState(["Class A", "Class B"]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [stepCount, setStepCount] = useState(0);

  const hasInput = retina.some((v) => v > 0);

  const associationActivations = useMemo(
    () => computeAssociationActivations(retina, associationUnits),
    [retina, associationUnits],
  );

  const scores = useMemo(
    () => computeOutputScores(associationActivations, weights, biases),
    [associationActivations, weights, biases],
  );

  const prediction = useMemo(() => predict(scores), [scores]);

  const receptiveFields = useMemo(
    () => computeReceptiveFields(weights, associationUnits),
    [weights, associationUnits],
  );

  const handleLearn = useCallback(
    (correctLabel) => {
      const result = learn(
        weights,
        biases,
        associationActivations,
        correctLabel,
        learningRate,
      );
      setWeights(result.weights);
      setBiases(result.biases);
      setStepCount((c) => c + 1);
    },
    [weights, biases, associationActivations, learningRate],
  );

  const handleReset = useCallback(() => {
    setWeights(createOutputWeights());
    setBiases(createOutputBiases());
    setStepCount(0);
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Perceptron Mark I
            </h1>
            <p className="mono text-sm mt-1" style={{ color: "#8a8275" }}>
              Interactive simulator — {stepCount} training step
              {stepCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div
            className="mono text-xs px-4 py-2 rounded-full border-2 border-current"
            style={{ color: "#8a8275" }}
          >
            Frank Rosenblatt, 1958
          </div>
        </div>

        {/* Network visualization */}
        <div className="card card-green mb-6">
          <div className="card-label">Network Architecture</div>
          <NetworkViz
            retina={retina}
            associationUnits={associationUnits}
            activations={associationActivations}
            weights={weights}
            scores={scores}
            labels={labels}
            prediction={prediction}
          />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6">
          {/* Left: Retina input */}
          <div className="card card-blue">
            <RetinaInput retina={retina} onRetinaChange={setRetina} />
          </div>

          {/* Center: Controls + Weights */}
          <div className="flex flex-col gap-6 w-72">
            <div className="card card-yellow">
              <ControlPanel
                labels={labels}
                learningRate={learningRate}
                onLearningRateChange={setLearningRate}
                onLearn={handleLearn}
                onReset={handleReset}
                hasInput={hasInput}
              />
            </div>

            <div className="card card-neutral">
              <WeightViz weights={weights} labels={labels} />
            </div>
          </div>

          {/* Right: Output */}
          <div className="card card-red">
            <OutputPanel
              scores={scores}
              labels={labels}
              onLabelsChange={setLabels}
            />
          </div>
        </div>

        {/* Receptive fields */}
        <div className="card card-neutral mt-6">
          <ReceptiveFieldViz
            receptiveFields={receptiveFields}
            labels={labels}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

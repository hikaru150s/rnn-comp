import { 
    TrainStream, 
    recurrent,
    INeuralNetworkState,
} from 'brain.js';
import { createReadStream, writeFile } from 'fs';
import { join } from 'path';

const net = new recurrent.RNNTimeStep({
    learningRate: 0.01,
    // activation: 'sigmoid',
    // hiddenLayers: [128, 128],
});

function finished(state: INeuralNetworkState) {
    console.log('Done traning:', state);
    let json = net.toJSON();
    writeFile(join(__dirname, '../assets/state.json'), json, () => { console.log('State saved!'); });
}

const train = new TrainStream({
    neuralNetwork: net,
    neuralNetworkGPU: net,
    floodCallback() { readInputs(train); },
    doneTrainingCallback: finished,
});

function readInputs(stream: TrainStream) {
    console.log('Read Executed');
    /* 
    // WARNING! This block will ignore backpressure mechanism, neural networks will think the size is different due to different .write call counts
    const src = createReadStream(join(__dirname, '../assets/test.zip'));
    let counter = 0;
    src.on('data', (chunk) => {
        counter += chunk.length;
        console.log('Input size received:', { chunk: chunk.length, total: counter });
        let buff = Buffer.from(chunk);
        stream.write([...buff]);
    });
    src.on('end', () => {
        src.destroy();
        stream.endInputs();
        console.log('Input Ended');
    }); */
    const src = createReadStream(join(__dirname, '../assets/test.zip'));
    src.pipe(stream);
}

readInputs(train);

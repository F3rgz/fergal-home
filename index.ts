import dotenv from 'dotenv';
import {
    Porcupine,
    BuiltinKeyword,
    getBuiltinKeywordPath,
} from '@picovoice/porcupine-node';
const PvRecorder = require('@picovoice/pvrecorder-node');

dotenv.config();

const accessKey = process.env.ACCESS_KEY as string;
const testKeyword = 'grapefruit';
const sensitivities = [0.5]
const audioDeviceIndex = process.env.AUDO_DEVICE || 0;
let isInterrupted = false;

async function listener() {
    console.log(accessKey);
    console.log(testKeyword);

    if (!accessKey) {
        console.log('ACCESS_KEY not defined in .env file')
        return;
    }

    let keywordPaths = [ getBuiltinKeywordPath(BuiltinKeyword.PICOVOICE) ];

    let wakeHandler = new Porcupine(
        accessKey,  
        keywordPaths,
        sensitivities,
    );

    const frameLength = wakeHandler.frameLength;

    const recorder = new PvRecorder(audioDeviceIndex, frameLength);
    recorder.start();

    console.log(`Using device: ${recorder.getSelectedDevice()}...`);

    console.log(`Listening for wake word(s): PicoVoice`);
    console.log("Press ctrl+c to exit.")

    while (!isInterrupted) {
        const pcm = await recorder.read();
        let index = wakeHandler.process(pcm);
        if (index !== -1) {
          console.log('DETECTED!');
        }
    }
  
    console.log("Stopping...");
    recorder.release();
}

process.on("SIGINT", function () {
    isInterrupted = true;
});

(async function () {
    try {
        await listener();
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(`Things exploded (${err.message})`);
        }
    }
})();

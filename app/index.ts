import dotenv from 'dotenv';
import {
  Porcupine,
  BuiltinKeyword,
  getBuiltinKeywordPath,
} from '@picovoice/porcupine-node';
import { program } from 'commander';

program.option(
  '-d, --show_audio_devices',
  'show the list of available devices',
);
program.parse(process.argv);

const PvRecorder = require('@picovoice/pvrecorder-node');

dotenv.config();

const accessKey = process.env.ACCESS_KEY as string;
const testKeyword = 'grapefruit';
const sensitivities = [0.5];
const audioDeviceIndex = process.env.AUDO_DEVICE || 0;
const isInterrupted = false;

async function listener() {
  console.log(accessKey);
  console.log(testKeyword);

  if (!accessKey) {
    console.log('ACCESS_KEY not defined in .env file');
    return;
  }

  // eslint-disable-next-line dot-notation
  const showAudioDevices = program.getOptionValue('showAudioDevices');
  console.log(showAudioDevices);
  if (showAudioDevices !== undefined) {
    const devices = PvRecorder.getAudioDevices();
    for (let i = 0; i < devices.length; i++) {
      console.log(`index: ${i}, device name: ${devices[i]}`);
    }
    process.exit();
  }

  const keywordPaths = [getBuiltinKeywordPath(BuiltinKeyword.PICOVOICE)];

  const wakeHandler = new Porcupine(accessKey, keywordPaths, sensitivities);

  const { frameLength } = wakeHandler;

  const recorder = new PvRecorder(audioDeviceIndex, frameLength);
  recorder.start();

  console.log(`Using device: ${recorder.getSelectedDevice()}...`);

  console.log('Listening for wake word(s): PicoVoice');
  console.log('Press ctrl+c to exit.');

  while (!isInterrupted) {
    // eslint-disable-next-line no-await-in-loop
    const pcm = await recorder.read();
    const index = wakeHandler.process(pcm);
    if (index !== -1) {
      console.log('DETECTED!');
    }
  }

  console.log('Stopping...');
  recorder.release();
}

process.on('SIGINT', () => {
  process.exit();
});

(async () => {
  try {
    await listener();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error);
    }
  }
})();

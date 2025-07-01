import { audioPaths } from './audioPaths';

let masterSwitchOn = true;
let currentAudio = null;

export function setMasterSwitchAudioOn(on) {
    masterSwitchOn = on;
}

export function playAudio(audioType, options = {}) {
    if (!masterSwitchOn) {
        return;
    }

    const {
        waitMs = 0,
        enqueue = true,
        separate = false,
        volume = 100
    } = options;

    setTimeout(() => {
        const paths = audioPaths[audioType];
        if (!paths || paths.length === 0) {
            console.warn(`No audio paths found for type: ${audioType}`);
            return;
        }

        // Stop current audio if not enqueueing or if separate
        if (!enqueue || separate) {
            stopAudio();
        }

        // If enqueueing and audio is playing, don't play new audio
        if (enqueue && currentAudio && !currentAudio.ended) {
            return;
        }

        // Select random audio file from the array
        const randomIndex = Math.floor(Math.random() * paths.length);
        const audioPath = `${process.env.PUBLIC_URL}/mp3/${paths[randomIndex]}`;

        const audio = new Audio(audioPath);
        audio.volume = volume / 100;

        if (!separate) {
            currentAudio = audio;
        }

        audio.onended = () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }
        };

        audio.onerror = (e) => {
            console.error(`Error playing audio ${audioPath}:`, e);
        };

        audio.play().catch(e => {
            console.error(`Failed to play audio ${audioPath}:`, e);
        });

    }, waitMs);
}

export function stopAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

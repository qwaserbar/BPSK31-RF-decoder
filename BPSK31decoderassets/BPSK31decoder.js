function decodeBPSK31(arrayBuffer, frequency, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        const decodedText = bpsk31Decode(audioBuffer, frequency * 1000); // Converting kHz to Hz
        callback(null, decodedText);
    }, function(error) {
        callback(error);
    });
}

function bpsk31Decode(audioBuffer, frequency) {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    let decodedMessage = '';

    const baudRate = 31.25; // BPSK31 baud rate in baud
    const samplesPerSymbol = Math.floor(sampleRate / baudRate); // Calculating samples per symbol

    let phase = 0;
    const phaseIncrement = (2 * Math.PI * frequency) / sampleRate;

    const bits = [];

    // Looping through the audio samples
    for (let i = 0; i < channelData.length; i += samplesPerSymbol) {
        // Ensuring it's reading within bounds
        if (i + samplesPerSymbol > channelData.length) break;

        const sample = channelData[i];
        const expectedValue = Math.sin(phase);

        // Applying a simple threshold
        const threshold = 0; // Note: adjust if necessary
        const detectedBit = sample > threshold ? (expectedValue > 0 ? '1' : '0') : (expectedValue <= 0 ? '1' : '0');
        bits.push(detectedBit);

        // Increment phase
        phase += phaseIncrement;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI; // Wrap phase
        }
    }

    // Convert bits to characters, assuming 8 bits per character, or binary
    for (let i = 0; i < bits.length; i += 8) {
        const byteString = bits.slice(i, i + 8).join('');
        if (byteString.length === 8) { // Ensuring it's a full byte
            const charCode = parseInt(byteString, 2);
            if (charCode) {
                decodedMessage += String.fromCharCode(charCode);
            }
        }
    }

    return decodedMessage.trim(); // Returning the decoded BPSK31 message
}


// creator note: this took me almost forever to write

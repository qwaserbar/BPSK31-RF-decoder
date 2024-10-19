function decodeBPSK31(arrayBuffer, frequency, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        const decodedText = bpsk31Decode(audioBuffer, frequency * 1000); // Convert kHz to Hz
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
    const samplesPerSymbol = Math.floor(sampleRate / baudRate); // Calculate samples per symbol

    // Phase accumulator to detect frequency
    let phase = 0;
    const phaseIncrement = (2 * Math.PI * frequency) / sampleRate;

    for (let i = 0; i < channelData.length; i++) {
        // Using phase to determine bit value
        const sample = channelData[i];

        // Determine the expected value based on the current phase
        const expectedValue = Math.sin(phase);

        // Detect bit based on the expected value and the sample
        if ((sample > 0 && expectedValue > 0) || (sample <= 0 && expectedValue <= 0)) {
            // No phase change
            decodedMessage += '0';
        } else {
            // Phase change detected
            decodedMessage += '1';
        }

        // Increment phase
        phase += phaseIncrement;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI; // Wrap phase
        }
    }

    return decodedMessage; // Return the decoded BPSK31 message
}

// creator note: this took me almost forever to write

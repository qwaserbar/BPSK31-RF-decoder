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
    const channelData = audioBuffer.getChannelData(0); // Getting the first channel
    let decodedMessage = '';

    const baudRate = 31.25; // BPSK31 baud rate in baud
    const samplesPerSymbol = Math.floor(sampleRate / (baudRate)); // Calculate samples per symbol based on baud rate

    let previousSample = 0;
    let bit = '';

    // Loop through the audio data
    for (let i = 0; i < channelData.length; i += samplesPerSymbol) {
        const sample = channelData[i];

        // Simple phase detection
        if (sample > 0) {
            if (previousSample <= 0) {
                bit = '1'; // Phase change detected
            } else {
                bit = '0'; // No phase change
            }
        } else {
            if (previousSample >= 0) {
                bit = '0'; // Phase change detected
            } else {
                bit = '1'; // No phase change
            }
        }

        decodedMessage += bit;
        previousSample = sample;
    }

    return decodedMessage; // Returning the decoded BPSK31 message
}


// creator note: this took me almost forever to write

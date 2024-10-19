function decodeBPSK31(arrayBuffer, frequency, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        // audioBuffer is finally ready
        const decodedText = bpsk31Decode(audioBuffer, frequency);
        callback(null, decodedText);
    }, function(error) {
        callback(error);
    });
}

function bpsk31Decode(audioBuffer, frequency) {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // Getting the first channel
    let decodedMessage = '';

    // Calculate the appropriate step based on the frequency provided (in kHz)
    const baudRate = 31.25; // BPSK31 baud rate in baud
    const samplesPerSymbol = Math.floor(sampleRate / (baudRate * frequency)); // Adjusting for the provided frequency (in Hz)

    // Simplified logic for BPSK31 decoding
    for (let i = 0; i < channelData.length; i += samplesPerSymbol) {
        const sample = channelData[i];
        decodedMessage += sample > 0 ? '1' : '0'; // note: may need to replace with actual decoding logic
    }

    return decodedMessage; // Returning the decoded BPSK31 message
}


// creator note: this took me almost forever to write

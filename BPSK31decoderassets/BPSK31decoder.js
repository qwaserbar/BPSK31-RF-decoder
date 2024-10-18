function decodeBPSK31(arrayBuffer, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        // Now audioBuffer is ready and we can process it
        const decodedText = bpsk31Decode(audioBuffer);
        callback(null, decodedText);
    }, function(error) {
        callback(error);
    });
}

function bpsk31Decode(audioBuffer) {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0); // Getting the first channel
    let decodedMessage = '';

    // Simplified logic for BPSK31 decoding
    for (let i = 0; i < channelData.length; i += Math.floor(sampleRate / 31)) {
        const sample = channelData[i];
        decodedMessage += sample > 0 ? '1' : '0'; // Replace with actual decoding logic
    }

    return decodedMessage; // Return the decoded BPSK31 message
}

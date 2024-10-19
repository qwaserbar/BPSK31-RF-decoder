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
        const sample = channelData[i];

        // Determining if we are receiving a '1' or '0'
        const expectedValue = Math.sin(phase);
        if (sample > 0) {
            bits.push(expectedValue > 0 ? '1' : '0');
        } else {
            bits.push(expectedValue <= 0 ? '1' : '0');
        }

        // Increment phase for the next sample
        phase += phaseIncrement;
        if (phase >= 2 * Math.PI) {
            phase -= 2 * Math.PI; // Wrap phase
        }
    }

    // Converting bits to characters
    for (let i = 0; i < bits.length; i += 8) {
        const byteString = bits.slice(i, i + 8).join('');
        const charCode = parseInt(byteString, 2);
        if (charCode) {
            decodedMessage += String.fromCharCode(charCode);
        }
    }

    return decodedMessage.trim(); // Returning the decoded BPSK31 message
}


// creator note: this took me almost forever to write

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    document.getElementById('decodeButton').style.display = file ? 'inline-block' : 'none';
});


document.getElementById('decodeButton').addEventListener('click', function() {
    const frequency = parseFloat(document.getElementById('frequencyInput').value);
    if (isNaN(frequency) || frequency <= 0) {
        alert('Please enter a valid center frequency in kHz.');
        return;
    }

    const file = document.getElementById('fileInput').files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const arrayBuffer = e.target.result;

        
        decodeBPSK31(arrayBuffer, frequency, function(error, decodedText) {
            if (error) {
                console.error("Decoding error:", error);
                document.getElementById('output').value = 'Error decoding';
                alert('Error decoding BPSK31: ' + error.message);
            } else {
                document.getElementById('output').value = decodedText;
                alert('BPSK31 decoded successfully');
            }
        });
    };

    reader.readAsArrayBuffer(file);
});


function decodeBPSK31(arrayBuffer, frequency, callback) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioContext.decodeAudioData(arrayBuffer, function(audioBuffer) {
        const decodedText = bpsk31Decode(audioBuffer, frequency); 
        callback(null, decodedText);
    }, function(error) {
        callback(error);
    });
}


function bpsk31Decode(audioBuffer, frequency) {
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    let decodedMessage = '';

    const baudRate = 31.25; 
    const samplesPerSymbol = Math.floor(sampleRate / baudRate);

    const lookupTable = {
        0b1010101011000: 'NUL', 0b1011110111000: 'DLE', 0b1011011011000: 'SOH',
        0b1011110101000: 'DCI', 0b1011101101000: 'STX', 0b1110101101000: 'DC2',
        0b1101110111000: 'ETX', 0b1110101111000: 'DC3', 0b1011101011000: 'EOT',
        0b1101011011000: 'DC4', 0b1101011111000: 'ENQ', 0b1101101011000: 'NAK',
        0b1011101111000: 'ACK', 0b1101101101000: 'SYN', 0b1011111101000: 'BEL',
        0b1101010111000: 'ETB', 0b1011111111000: '\b', 0b1101111011000: 'CAN',
        0b11101111000: 'HT', 0b1101111101000: 'EM', 0b11101000: '\r\n',
        0b1110110111000: 'SUB', 0b1101101111000: 'VT', 0b1101010101000: 'ESC',
        0b1011011101000: 'FF', 0b1101011101000: 'FS', 0b11111000: '\r\n',
        0b1110111011000: 'GS', 0b1101110101000: 'SO', 0b1011111011000: 'RS',
        0b1110101011000: 'SI', 0b1101111111000: 'US', 0b1000: ' ',
        0b10101101000: 'C', 0b111111111000: '!', 0b10110101000: 'D',
        0b101011111000: '"', 0b101111111000: "'", 0b1110111000: 'E',
        0b111110101000: '#', 0b11011011000: 'F', 0b111011011000: '$',
        0b11111101000: 'G', 0b1011010101000: '%', 0b101010101000: 'H',
        0b1010111011000: '&', 0b1111111000: 'I', 0b111111101000: 'J',
        0b11111011000: '(', 0b101111101000: 'K', 0b11110111000: ')',
        0b11010111000: 'L', 0b101101111000: '*', 0b10111011000: 'M',
        0b111011111000: '+', 0b11011101000: 'N', 0b1110101000: ',',
        0b10101011000: 'O', 0b110101000: '-', 0b11010101000: 'P',
        0b1010111000: '.', 0b111011101000: 'Q', 0b110101111000: '/',
        0b10101111000: 'R', 0b10110111000: '0', 0b1101111000: 'S',
        0b10111101000: '1', 0b1101101000: 'T', 0b11101101000: '2',
        0b101010111000: 'U', 0b11111111000: '3', 0b110110101000: 'V',
        0b101011101000: 'W', 0b101110111000: '4', 0b101110101000: 'X',
        0b101011011000: '5', 0b101111011000: 'Y', 0b101101011000: '6',
        0b1010101101000: 'Z', 0b110101101000: '7', 0b110101011000: '8',
        0b110110111000: '9', 0b111110111000: '[', 0b111111011000: ']',
        0b11110101000: ':', 0b1010111111000: '^', 0b110111101000: ';',
        0b101101101000: '_', 0b111101101000: '<', 0b1010101000: '=',
        0b1011011111000: '/', 0b111010111000: '>', 0b1011000: 'a',
        0b1010101111000: '?', 0b1011111000: 'b', 0b1010111101000: '@',
        0b101111000: 'c', 0b1111101000: 'A', 0b101101000: 'd', 
        0b11101011000: 'B', 0b11000: 'e', 0b111101000: 'f', 
        0b10111000: 's', 0b1011011000: 'g', 0b101000: 't',
        0b101011000: 'h', 0b110111000: 'u', 0b1101000: 'i', 
        0b1111011000: 'v', 0b111101011000: 'j', 0b1101011000: 'w', 
        0b10111111000: 'k', 0b11011111000: 'x', 0b11011000: 'l', 
        0b1011101000: 'y', 0b111011000: 'm', 0b111010101000: 'z', 
        0b1111000: 'n', 0b1010110111000: '{', 0b111000: 'o', 
        0b110111011000: '|', 0b111111000: 'p', 0b1010110101000: '}',
        0b110111111000: 'q', 0b1011010111000: '~', 0b10101000: 'r',
        0b1110110101000: 'DEL',
        
    };

    const bitStream = [];

    
    for (let i = 0; i < channelData.length; i += samplesPerSymbol) {
        if (i + samplesPerSymbol > channelData.length) break;

       
        const segment = channelData.slice(i, i + samplesPerSymbol);
        const detectedFrequency = detectFrequency(segment, sampleRate);

        
        const threshold = 200; 
        if (detectedFrequency >= 1100 && detectedFrequency <= 1300) {
            bitStream.push(0); 
        } else if (detectedFrequency >= 2100 && detectedFrequency <= 2300) {
            bitStream.push(1); 
        }
    }

   
    for (let i = 0; i < bitStream.length; i += 12) {
        const bitChunk = bitStream.slice(i, i + 12).join('');
        const byte = parseInt(bitChunk, 2);

        if (lookupTable[byte]) {
            decodedMessage += lookupTable[byte];
        } else {
            
            decodedMessage += '?';
        }
    }

    return decodedMessage.trim(); 
}


function detectFrequency(segment, sampleRate) {
    const fftSize = segment.length;
    const fft = new FFT(fftSize, sampleRate);
    fft.forward(segment);

    const spectrum = fft.spectrum;
    let peakFrequency = 0;
    let maxAmplitude = 0;

    
    for (let i = 0; i < spectrum.length; i++) {
        if (spectrum[i] > maxAmplitude) {
            maxAmplitude = spectrum[i];
            peakFrequency = i * (sampleRate / fftSize);
        }
    }

    return peakFrequency;
}

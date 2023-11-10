"use strict";
window.onload = function () {
    // Verificar si el navegador admite el reconocimiento de voz
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'es-ES'; // Establecer el idioma, por ejemplo, español de España
        var recognition2 = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition2.lang = 'es-ES';
        recognition2.continuous = false;
        function reconocerPalabra() {
            recognition.continuous = true;
            // Iniciar el reconocimiento de voz cuando se carga la página
            recognition.start();
            recognition.onresult = function (event) {
                const transcript = [];
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript.push(event.results[i][0].transcript);
                    console.log(event.results[i][0].transcript);
                }

                if (transcript.includes(' profe') || transcript.includes(' profesor')) {
                    recognition.abort();
                    startListening();
                    console.log('escuchando...')
                }
            };
        }

        function startListening() {
            recognition2.start();
            recognition2.onresult = async function (event) {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    console.log(event.results[i][0].transcript);
                    let TEXTOINSANO=await event.results[i][0].transcript;
                    await Converter(TEXTOINSANO);
                }
            };
        }

        reconocerPalabra();

    } else {
        alert('El reconocimiento de voz no es compatible con este navegador.');
        // Aquí puedes proporcionar una alternativa para navegadores que no admiten el reconocimiento de voz
    }
};
let credito = document.getElementById("CREDITO");
const talkVideo = document.getElementById('talk-video');
const stream = document.getElementById('STREAM');
talkVideo.setAttribute('playsinline', '');
let sessionClientAnswer;
let peerConnection;
let headersList = {
    Accept: "application/json",
    Authorization: "application/json",
    Authorization:
        "Basic ZUdSa1pHVnJhWE5rWlVCbmJXRnBiQzVqYjIwOlJ6aWFxeVQ4ODlfT0NSVVdUX2xmaw==",
};
await fetch("https://api.d-id.com/credits", {
    method: "GET",
    headers: headersList,
})
    .then((response) => response.json())
    .then(async (res) => {
        let data = await res;
        console.log(data.remaining);
        let creditos = await data.remaining;
        credito.innerHTML = creditos;
    })
    .catch((error) => {
        console.error(error);
    })
let header = {
    Accept: "application/json",
    Authorization: "application/json",
    Authorization:
        "Basic ZUdSa1pHVnJhWE5rWlVCbmJXRnBiQzVqYjIwOlJ6aWFxeVQ4ODlfT0NSVVdUX2xmaw=='",
    "Content-Type": "application/json",
};
let body = JSON.stringify({
    source_url:
        "https://create-images-results.d-id.com/google-oauth2%7C109795923262889365844/upl_F1PnQESsVmCZEzkPgWYFG/image.png",
});
const sessionResponse = await fetch(`https://api.d-id.com/talks/streams`, {
    method: "POST",
    body: body,
    headers: header,
});
const { id: newStreamId, offer, ice_servers: iceServers, session_id: newSessionId } = await sessionResponse.json()
console.log(iceServers)
console.log(offer)
console.log(newStreamId)
let streamId = newStreamId;
let sessionId = newSessionId;
function onIceCandidate(event) {
    if (event.candidate) {
        const { candidate, sdpMid, sdpMLineIndex } = event.candidate;

        fetch(`https://api.d-id.com/talks/streams/${streamId}/ice`,
            {
                method: 'POST',
                headers: header,
                body: JSON.stringify({ candidate, sdpMid, sdpMLineIndex, session_id: sessionId })
            });
    }
}
function onTrack(event) {
    const remoteStream = event.streams[0];
    setVideoElement(remoteStream);
}
async function createPeerConnection(offer, iceServers) {
    peerConnection = new RTCPeerConnection({ iceServers });
    peerConnection.addEventListener('icecandidate', onIceCandidate, true);
    peerConnection.addEventListener('track', onTrack, true);
    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');
    await peerConnection.setRemoteDescription(offer);
    console.log('set remote sdp OK');
    const sessionClientAnswer = await peerConnection.createAnswer();
    console.log('create local sdp OK');
    await peerConnection.setLocalDescription(sessionClientAnswer);
    console.log('set local sdp OK');
    console.log('LA SESION WTF :' + sessionClientAnswer)
    return sessionClientAnswer;
}
try {
    sessionClientAnswer = await createPeerConnection(offer, iceServers);
    console.log('ok')
} catch (e) {
    console.log('error during streaming setup', e);
}
const sdpResponse = await fetch(`https://api.d-id.com/talks/streams/${streamId}/sdp`, {
    method: "POST",
    headers: header,
    body: JSON.stringify({
        answer: sessionClientAnswer,
        session_id: sessionId,
    }),
});
let date = await sdpResponse.text();
console.log('FETCH TO SDP :' + date);

async function Converter(prompt) {
    await prompt;
    async function llamada(messages) {
        await messages;
        let oRess = await fetch(`https://api.openai.com/v1/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer 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",
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: "responde en español y en pocas palabras el siguiente mensaje :" + messages,
                max_tokens: 2000,
            }),
        });
        return await oRess.json();
    }
    let data = await llamada(prompt);
    await console.log(data.choices[0].text);
    let textito = data.choices[0].text;
    await speech(textito)
}
async function speech(testoInasno) {
    await testoInasno
    const options = {
        method: 'POST',
        headers: header,
        body: JSON.stringify({
            script: {
                type: 'text',
                subtitles: 'false',
                provider: { type: 'elevenlabs', voice_id: 'pNInz6obpgDQGcFmaJgB' },
                ssml: 'false',
                input: testoInasno
            },
            config: { fluent: 'false', pad_audio: '0.0' },
            session_id: sessionId
        })
    };
    fetch(`https://api.d-id.com/talks/streams/${streamId}`, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
    return;
};
async function setVideoElement(stream) {
    talkVideo.srcObject = stream;
    if (talkVideo.paused) {
        talkVideo.play().then(_ => { }).catch(e => { });
    }
}

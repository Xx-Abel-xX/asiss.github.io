"use strict";
let timem;
let talkVideo = document.getElementById('talk-video');
let bol = false;
window.onload = async function () {
    let transcripts;
    let transcripts2;
    let recognition;
    // Verificar si el navegador admite el reconocimiento de voz
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        async function reconocerPalabra() {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'es-ES';
            recognition.continuous = true;
            recognition.interimResult = false;
            recognition.start();
            recognition.onresult = async function (e) {
                transcripts = await e.results[e.results.length - 1][0].transcript;
                console.log(transcripts);
                if (transcripts === ' profe' || ' profesor' || 'profe' || 'profesor') {
                    await recognition.stop();
                    setTimeout(function () {
                        startListening()
                        console.log("escuchando...")
                        return;
                    }, 2000)
                }
            };
        }
        async function startListening() {
            recognition.continuous = false;
            recognition.start();
            recognition.onresult = async function (e) {
                transcripts2 = await e.results[e.results.length - 1][0].transcript;
                console.log(transcripts2)
                setTimeout(function () {
                    GPT(transcripts2);
                    return;
                }, 2000)
            };
        }
        async function GPT(p1) {
            await recognition.abort();
            await Converter(p1);
            setTimeout(function () {
                reconocerPalabra()
                return;
            }, 7400)
            return;
        }

        document.addEventListener('click',()=>{
            reconocerPalabra();
        })

        reconocerPalabra();
    } else {
        alert('El reconocimiento de voz no es compatible con este navegador.');
        // Aquí puedes proporcionar una alternativa para navegadores que no admiten el reconocimiento de voz
    };
    let credito = document.getElementById("CREDITO");
    const stream = document.getElementById('STREAM');
    talkVideo.setAttribute('playsinline', '');
    let sessionClientAnswer;
    let peerConnection;
    let headersList = {
        Accept: "application/json",
        Authorization: "application/json",
        Authorization:
            "Basic YzJWeVoybHZhVzV6WVc1dmNHRmtRR2R0WVdsc0xtTnZiUTpZU2REWFZFdWhfdUpCbUVYdXRVTXI=",
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
            "Basic YzJWeVoybHZhVzV6WVc1dmNHRmtRR2R0WVdsc0xtTnZiUTpZU2REWFZFdWhfdUpCbUVYdXRVTXI=",
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
            let oRess = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer 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",
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            "role": "user",
                            "content": "responde en español y se breve en el siguiente mensaje: " + messages
                        },
                    ],
                    max_tokens: 2000,
                }),
            });
            return await oRess.json();
        }
        let data = await llamada(prompt);
        await console.log(data.choices[0].message.content);
        let textito = data.choices[0].message.content;
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
            .then((response) => {
                console.log(response)
            }).catch(err => console.error(err));
        return;
    };
    async function setVideoElement(stream) {
        talkVideo.srcObject = stream;
        if (talkVideo.paused) {
            talkVideo.play().then(_ => { }).catch(e => { });
        }
    }
}
"use strict";
let talkVideo = document.getElementById('talk-video');
// Obtiene una referencia al elemento de video con el ID 'talk-video'.
window.onload = async function () {
    let transcripts;
    let transcripts2;
    let recognition;
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        // La función se ejecuta cuando la página ha cargado completamente.
        async function reconocerPalabra() {
            // Declaración de variables para el reconocimiento de voz.
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'es-ES';
            recognition.continuous = true;
            recognition.interimResult = false;
            recognition.start();
            recognition.onresult = async function (e) {
                // Manejador de eventos cuando se detecta voz.
                transcripts = await e.results[e.results.length - 1][0].transcript;
                console.log(transcripts);
                if (transcripts === ' profe' || ' profesor' || 'profe' || 'profesor') {
                    await recognition.stop();
                    // Detiene el reconocimiento de voz.
                    setTimeout(function () {
                        startListening()
                        console.log("escuchando...")
                        return;
                    }, 2000)
                }
            };
        }
        async function startListening() {
            // Función para comenzar a escuchar después de cierta espera.
            recognition.continuous = false;
            recognition.start();
            recognition.onresult = async function (e) {
                // Manejador de eventos cuando se detecta voz después de detener y volver a iniciar.
                transcripts2 = await e.results[e.results.length - 1][0].transcript;
                console.log(transcripts2)
                setTimeout(function () {
                    GPT(transcripts2);
                    return;
                }, 2000)
            };
        }
        async function GPT(p1) {
            // Función que maneja la lógica después de reconocer la voz.
            await recognition.abort();
            await Converter(p1);
            setTimeout(function () {
                reconocerPalabra()
                return;
            }, 7400)
            return;
        }

        document.addEventListener('click',()=>{
            // Agrega un evento de clic que inicia el reconocimiento de voz.
            reconocerPalabra();
        })

        reconocerPalabra();
    } else {
        alert('El reconocimiento de voz no es compatible con este navegador.');
        // Muestra una alerta si el reconocimiento de voz no es compatible.
    };
    let credito = document.getElementById("CREDITO");
    const stream = document.getElementById('STREAM');
    talkVideo.setAttribute('playsinline', '');
    // Configuración de elementos HTML.
    let sessionClientAnswer;
    let peerConnection;
    let headersList = {
        Accept: "application/json",
        Authorization: "application/json",
        Authorization:
            "Basic WVd4aGJtUnZjM1J5WlhNd01ERkFaMjFoYVd3dVkyOXQ6Z29kTnVxS3FaWlNMNmk0VUprWklP",
    };
    // Declaración de variables para la conexión y encabezados.
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
        // Realiza una solicitud para obtener información de créditos y actualiza el contenido HTML.
    let header = {
        Accept: "application/json",
        Authorization: "application/json",
        Authorization:
            "Basic WVd4aGJtUnZjM1J5WlhNd01ERkFaMjFoYVd3dVkyOXQ6Z29kTnVxS3FaWlNMNmk0VUprWklP",
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
    // Realiza una solicitud para obtener información sobre la sesión de transmisión.
    function onIceCandidate(event) {
        // Manejador de eventos cuando se detecta un candidato ICE.
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
    async function setVideoElement(stream) {
        // Función para configurar el elemento de video.
        talkVideo.srcObject = stream;
        if (talkVideo.paused) {
            talkVideo.play().then(_ => { }).catch(e => { });
        }
    }
    function onTrack(event) {
        // Manejador de eventos cuando se detecta una pista de transmisión.
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
        // Intenta crear la conexión de pares y maneja errores si los hay
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
    // Realiza una solicitud para obtener información sobre la sesión de descripción de sesión.
    async function Converter(prompt) {
        // Función que realiza conversiones basadas en el prompt.
        await prompt;
        async function llamada(messages) {
            // Función que realiza llamadas utilizando la API de OpenAI.
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
                            "content": "responde en español y con mas de 15 palabras el siguiente mensaje: " + messages
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
        // Función que realiza una operación de habla basada en el texto proporcionado.
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
    
}
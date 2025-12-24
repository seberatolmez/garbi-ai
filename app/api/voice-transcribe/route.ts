
/*
 accepts WebSocket connections from the browser,
 conects to Deepgram's live transcription API,
 forwards audio chunks from client to Deepgram,
 and sends transcription results back to the client.
*/

import { createClient } from "@deepgram/sdk";

export function SOCKET(client: WebSocket) {

    const deepgram = createClient({key: process.env.DEEPGRAM_API_KEY!});
    const connection = deepgram.listen.live({
        model: "nova-3",
    })

    // forward client audio to Deepgram
    client.onmessage = (message) => {
        if (typeof message.data === "string") return;
        const audioChunk = structuredClone(message.data);
        connection.send(audioChunk);
    };

    // Send transcription results back to client
    connection.on('transcript', (transcript) => {
        client.send(JSON.stringify({ type: 'transcript', data: transcript }));
    });
}
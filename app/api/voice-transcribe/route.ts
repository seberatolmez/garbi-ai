
/*
 accepts WebSocket connections from the browser,
 conects to Deepgram's live transcription API,
 forwards audio chunks from client to Deepgram,
 and sends transcription results back to the client.
*/

import { createClient } from "@deepgram/sdk";
import { NextRequest } from "next/server";

export function SOCKET(client: WebSocket ,request: NextRequest) {

    const deepgram = createClient({key: process.env.DEEPGRAM_API_KEY!});
    const connection = deepgram.listen.live({
        model: "nova-3",
    })

    // forward client audio to Deepgram



    // Send transcription results back to client
}
import { createClient, LiveTranscriptionEvents, TextSource} from "@deepgram/sdk";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;
const deepgramClient = createClient({key: DEEPGRAM_API_KEY});

const deepgramConnection = deepgramClient.listen.live({
    model: "nova-3",
});

deepgramConnection.on(LiveTranscriptionEvents.Open, ()=>{
    deepgramConnection.on(LiveTranscriptionEvents.Transcript, (data) =>{
        console.log(data);
    });
});
    // TODO: adding source - listener 
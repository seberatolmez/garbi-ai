import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import type { WebSocket } from 'ws';

// Message types for client-server communication
interface TranscriptionMessage {
  type: 'transcript' | 'error' | 'status';
  text?: string;
  isFinal?: boolean;
  error?: string;
  status?: 'connected' | 'disconnected';
}

export function SOCKET(
  client: WebSocket,
  request: Request,
  server: { upgrade: (req: Request, options?: { data?: unknown }) => void }
) {
  console.log('[Voice Transcribe] Client connected');

  const apiKey = process.env.DEEPGRAM_API_KEY;
  
  if (!apiKey) {
    const errorMsg: TranscriptionMessage = {
      type: 'error',
      error: 'Deepgram API key not configured'
    };
    client.send(JSON.stringify(errorMsg));
    client.close();
    return;
  }

  const deepgram = createClient(apiKey);
  
  // Create live transcription connection
  const connection = deepgram.listen.live({
    model: 'nova-2',
    smart_format: true,
    interim_results: true,
    utterance_end_ms: 1000,
    vad_events: true,
  });

  let isDeepgramOpen = false;

  // Handle Deepgram connection open
  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log('[Deepgram] Connection opened');
    isDeepgramOpen = true;
    
    const statusMsg: TranscriptionMessage = {
      type: 'status',
      status: 'connected'
    };
    client.send(JSON.stringify(statusMsg));
  });

  // Handle transcription results from Deepgram
  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript;
    
    if (transcript && transcript.length > 0) {
      const msg: TranscriptionMessage = {
        type: 'transcript',
        text: transcript,
        isFinal: data.is_final ?? false
      };
      client.send(JSON.stringify(msg));
    }
  });

  // Handle Deepgram errors
  connection.on(LiveTranscriptionEvents.Error, (error) => {
    console.error('[Deepgram] Error:', error);
    const errorMsg: TranscriptionMessage = {
      type: 'error',
      error: 'Transcription error occurred'
    };
    client.send(JSON.stringify(errorMsg));
  });

  // Handle Deepgram connection close
  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log('[Deepgram] Connection closed');
    isDeepgramOpen = false;
  });

  // Handle incoming audio data from client
  client.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
    if (!isDeepgramOpen) {
      console.log('[Voice Transcribe] Deepgram not ready, buffering audio...');
      return;
    }

    try {
      // Forward audio data to Deepgram - convert to ArrayBuffer which Deepgram expects
      let audioData: Uint8Array;
      
      if (data instanceof Buffer) {
        audioData = new Uint8Array(data);
      } else if (data instanceof ArrayBuffer) {
        audioData = new Uint8Array(data);
      } else if (Array.isArray(data)) {
        const combined = Buffer.concat(data);
        audioData = new Uint8Array(combined);
      } else {
        return;
      }
      
      // Deepgram accepts ArrayBuffer, so we pass the underlying buffer
      connection.send(audioData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('[Voice Transcribe] Error sending to Deepgram:', error);
    }
  });

  // Handle client disconnect
  client.on('close', () => {
    console.log('[Voice Transcribe] Client disconnected');
    if (isDeepgramOpen) {
      connection.requestClose();
    }
  });

  // Handle client errors
  client.on('error', (error) => {
    console.error('[Voice Transcribe] Client error:', error);
    if (isDeepgramOpen) {
      connection.requestClose();
    }
  });
}

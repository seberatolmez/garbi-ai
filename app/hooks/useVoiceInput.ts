'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { UseVoiceInputOptions, UseVoiceInputReturn } from '../types/types';

// Message types matching server-side
interface TranscriptionMessage {
  type: 'transcript' | 'error' | 'status';
  text?: string;
  isFinal?: boolean;
  error?: string;
  status?: 'connected' | 'disconnected';
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onTranscript, onError, onStatusChange } = options;
  
  const [status, setStatus] = useState<'idle' | 'connecting' | 'recording' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Notify status changes
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Stop media stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setStatus('idle');
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setStatus('connecting');

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      streamRef.current = stream;

      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/voice-transcribe`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[VoiceInput] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: TranscriptionMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'status':
              if (message.status === 'connected') {
                setStatus('recording');
                // Start MediaRecorder once Deepgram is ready
                startMediaRecorder(stream, ws);
              }
              break;
            case 'transcript':
              if (message.text) {
                onTranscript?.(message.text, message.isFinal ?? false);
              }
              break;
            case 'error':
              setError(message.error || 'Unknown error');
              setStatus('error');
              onError?.(message.error || 'Unknown error');
              stopRecording();
              break;
          }
        } catch (e) {
          console.error('[VoiceInput] Error parsing message:', e);
        }
      };

      ws.onerror = () => {
        console.error('[VoiceInput] WebSocket error');
        setError('Connection error');
        setStatus('error');
        onError?.('Connection error');
      };

      ws.onclose = () => {
        console.log('[VoiceInput] WebSocket closed');
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
      stopRecording();
    }
  }, [onTranscript, onError, stopRecording]);

  const startMediaRecorder = (stream: MediaStream, ws: WebSocket) => {
    try {
      // Use webm/opus - browser native format that Deepgram supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        console.error('[VoiceInput] MediaRecorder error');
        setError('Recording error');
        setStatus('error');
        onError?.('Recording error');
      };

      // Start recording with 250ms chunks for real-time streaming
      mediaRecorder.start(250);
      console.log('[VoiceInput] MediaRecorder started with mimeType:', mimeType);

    } catch (err) {
      console.error('[VoiceInput] Error starting MediaRecorder:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setStatus('error');
      onError?.(errorMessage);
    }
  };

  return {
    isRecording: status === 'recording',
    isConnecting: status === 'connecting',
    status,
    error,
    startRecording,
    stopRecording,
  };
}

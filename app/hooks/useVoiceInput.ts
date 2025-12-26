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
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

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

  const updateStatus = useCallback((newStatus: 'idle' | 'connecting' | 'recording' | 'error') => {
    setStatus(newStatus);
  }, []);

  const stopRecording = useCallback(() => {
    // Stop the audio processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    updateStatus('idle');
  }, [updateStatus]);

  const startRecording = useCallback(async () => {
    // Reset state
    setError(null);
    updateStatus('connecting');

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
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
                updateStatus('recording');
                // Start sending audio once Deepgram is ready
                startAudioCapture(stream, ws);
              }
              break;
            case 'transcript':
              if (message.text) {
                onTranscript?.(message.text, message.isFinal ?? false);
              }
              break;
            case 'error':
              setError(message.error || 'Unknown error');
              updateStatus('error');
              onError?.(message.error || 'Unknown error');
              stopRecording();
              break;
          }
        } catch (e) {
          console.error('[VoiceInput] Error parsing message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('[VoiceInput] WebSocket error:', event);
        setError('Connection error');
        updateStatus('error');
        onError?.('Connection error');
      };

      ws.onclose = () => {
        console.log('[VoiceInput] WebSocket closed');
        if (status === 'recording') {
          stopRecording();
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      updateStatus('error');
      onError?.(errorMessage);
      stopRecording();
    }
  }, [onTranscript, onError, stopRecording, updateStatus, status]);

  const startAudioCapture = (stream: MediaStream, ws: WebSocket) => {
    try {
      // Create audio context for processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      
      // Create a script processor to capture raw audio data
      // Using 4096 buffer size for balance between latency and performance
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert float32 to int16 (linear16 format for Deepgram)
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Send audio data to server
        ws.send(int16Data.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

    } catch (err) {
      console.error('[VoiceInput] Error starting audio capture:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to capture audio';
      setError(errorMessage);
      updateStatus('error');
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


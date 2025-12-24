'use client';

import { useCallback, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '@/app/hooks/use-voice-input';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VoiceInputButton({ 
  onTranscript, 
  disabled = false,
  className 
}: VoiceInputButtonProps) {
  const [interimText, setInterimText] = useState('');

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      // When we get final text, append it to input with a space
      onTranscript(text + ' ');
      setInterimText('');
    } else {
      // Store interim text for potential display
      setInterimText(text);
    }
  }, [onTranscript]);

  const handleError = useCallback((error: string) => {
    console.error('[VoiceInput] Error:', error);
  }, []);

  const { 
    isRecording, 
    isConnecting, 
    startRecording, 
    stopRecording 
  } = useVoiceInput({
    onTranscript: handleTranscript,
    onError: handleError,
  });

  const handleClick = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const isLoading = isConnecting;
  const isActive = isRecording;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative shrink-0 rounded-lg transition-all duration-200',
        isActive && 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50',
        !isActive && !isLoading && 'text-muted-foreground hover:text-foreground',
        className
      )}
      title={isActive ? 'Stop recording' : 'Start voice input'}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isActive ? (
        <>
          <MicOff className="size-4" />
          {/* Pulsing indicator when recording */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </>
      ) : (
        <Mic className="size-4" />
      )}
    </Button>
  );
}


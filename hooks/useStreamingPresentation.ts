import { useState, useCallback } from 'react';

interface StreamingState {
  isStreaming: boolean;
  content: string;
  error: string | null;
  progress: number;
}

export function useStreamingPresentation() {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    content: '',
    error: null,
    progress: 0,
  });

  const generatePresentation = useCallback(
    async (topic: string, audience: string, outline?: any[], settings?: any) => {
      setState({
        isStreaming: true,
        content: '',
        error: null,
        progress: 0,
      });

      try {
        const response = await fetch('/api/generate-presentation-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic, audience, outline, settings }),
        });

        if (!response.ok) {
          throw new Error('Failed to start stream');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No reader available');
        }

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            console.log('✅ Stream complete');
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.content) {
                  accumulatedContent += data.content;

                  setState((prev) => ({
                    ...prev,
                    content: accumulatedContent,
                    progress: Math.min(
                      (accumulatedContent.length / 10000) * 100,
                      95
                    ),
                  }));
                }

                if (data.done) {
                  setState((prev) => ({
                    ...prev,
                    isStreaming: false,
                    progress: 100,
                  }));
                }

                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate presentation',
        }));
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      content: '',
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    generatePresentation,
    reset,
  };
}

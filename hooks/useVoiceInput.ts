import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export type UseVoiceInputOptions = {
    onResult: (text: string) => void;
    lang?: string;
};

export type UseVoiceInputReturn = {
    isListening: boolean;
    supported: boolean;
    startListening: () => Promise<void>;
    stopListening: () => void;
};

export function useVoiceInput({ onResult, lang = 'en-US' }: UseVoiceInputOptions): UseVoiceInputReturn {
    const [isListening, setIsListening] = useState(false);
    const onResultRef = useRef(onResult);
    useEffect(() => { onResultRef.current = onResult; }, [onResult]);

    // ── Native (iOS / Android) ────────────────────────────────────────────
    useSpeechRecognitionEvent('start', () => setIsListening(true));
    useSpeechRecognitionEvent('end', () => setIsListening(false));
    useSpeechRecognitionEvent('result', (event) => {
        const transcript = event.results?.[0]?.transcript;
        if (transcript) {
            onResultRef.current(transcript);
        }
    });
    useSpeechRecognitionEvent('error', () => setIsListening(false));

    const startListening = useCallback(async () => {
        if (Platform.OS === 'web') {
            startWebListening();
            return;
        }

        const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!granted) return;

        ExpoSpeechRecognitionModule.start({
            lang,
            interimResults: false,
            continuous: false,
        });
    }, [lang]);

    const stopListening = useCallback(() => {
        if (Platform.OS === 'web') {
            stopWebListening();
            return;
        }
        ExpoSpeechRecognitionModule.stop();
    }, []);

    // ── Web SpeechRecognition fallback ────────────────────────────────────
    const webRecognitionRef = useRef<any>(null);

    const startWebListening = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results?.[0]?.[0]?.transcript;
            if (transcript) {
                onResultRef.current(transcript);
            }
        };

        webRecognitionRef.current = recognition;
        recognition.start();
    }, [lang]);

    const stopWebListening = useCallback(() => {
        webRecognitionRef.current?.stop();
        webRecognitionRef.current = null;
    }, []);

    const supported =
        Platform.OS !== 'web' ||
        !!(
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition
        );

    return { isListening, supported, startListening, stopListening };
}

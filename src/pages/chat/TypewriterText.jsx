import React, { useState, useEffect, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";

/**
 * Componente que exibe texto com efeito de digitação (typewriter)
 * Resistente a re-renders - mantém o progresso mesmo quando o componente pai re-renderiza
 */
export default function TypewriterText({
    text,
    speed = 15,
    onComplete,
    skipAnimation = false
}) {
    // Usa ref para manter o progresso entre re-renders
    const progressRef = useRef(0);
    const isCompleteRef = useRef(false);
    const textRef = useRef(text);

    const [displayedText, setDisplayedText] = useState(() => {
        // Se já estava completo, mostra tudo
        if (isCompleteRef.current && textRef.current === text) {
            return text;
        }
        return "";
    });
    const [isComplete, setIsComplete] = useState(false);

    // Memoiza o texto para evitar re-runs desnecessários
    const stableText = useMemo(() => text, [text]);

    useEffect(() => {
        // Se deve pular animação, mostra tudo de uma vez
        if (skipAnimation) {
            setDisplayedText(stableText);
            setIsComplete(true);
            isCompleteRef.current = true;
            return;
        }

        // Se o texto mudou, reseta
        if (textRef.current !== stableText) {
            textRef.current = stableText;
            progressRef.current = 0;
            isCompleteRef.current = false;
        }

        // Se já completou esse texto, não faz nada
        if (isCompleteRef.current) {
            setDisplayedText(stableText);
            setIsComplete(true);
            return;
        }

        if (!stableText) return;

        let animationFrame;
        let lastTime = 0;

        const typeNextChar = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;

            if (elapsed >= speed) {
                if (progressRef.current < stableText.length) {
                    // Adiciona múltiplos caracteres por vez para texto longo
                    const charsToAdd = Math.min(3, stableText.length - progressRef.current);
                    progressRef.current += charsToAdd;
                    setDisplayedText(stableText.slice(0, progressRef.current));
                    lastTime = timestamp;
                } else {
                    setIsComplete(true);
                    isCompleteRef.current = true;
                    if (onComplete) onComplete();
                    return;
                }
            }

            animationFrame = requestAnimationFrame(typeNextChar);
        };

        // Começa de onde parou
        if (progressRef.current > 0) {
            setDisplayedText(stableText.slice(0, progressRef.current));
        }

        animationFrame = requestAnimationFrame(typeNextChar);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [stableText, speed, skipAnimation, onComplete]);

    return (
        <div className="typewriter-container">
            <ReactMarkdown>{displayedText}</ReactMarkdown>
            {!isComplete && <span className="typewriter-cursor">▌</span>}
        </div>
    );
}

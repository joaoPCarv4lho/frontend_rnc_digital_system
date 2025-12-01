import { useEffect } from "react";
import { webSocketClient } from "../types/websocket";

interface Props{
    onRncCreated?: ()=> void
    onRncUpdated?: ()=> void
    onRncClosed?: ()=> void
}

export function useRNCWebSocket({ onRncCreated, onRncUpdated, onRncClosed }: Props){
    useEffect(() => {
        const unsubscribe = webSocketClient.subscribe((event)=> {
            console.log("Evento WebSocket recebido", event);

            if(event.type === "rnc_created" && onRncCreated) onRncCreated();
            if(event.type === "rnc_analysis_completed" && onRncUpdated) onRncUpdated();
            if(event.type === "rnc_rework_completed" && onRncUpdated) onRncUpdated();
            if(event.type === "rnc_closed" && onRncClosed) onRncClosed();
        });
        return () => unsubscribe();
    }, [onRncCreated, onRncUpdated, onRncClosed]);
}
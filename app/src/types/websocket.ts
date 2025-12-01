import { refreshAuthToken } from "../services/refreshToken";

type RNCEvent = 
| { type: "rnc_created", payload: any } 
| { type: "rnc_analysis_completed", payload: any } 
| { type: "rnc_rework_completed", payload: any }
| { type: "rnc_closed", payload: any };

type MessageListener = (event: RNCEvent)=> void;

class WebSocketClient{
    private ws: WebSocket | null = null;
    private listeners = new Set<MessageListener>();
    private reconnectInterval = 5000;
    private url = import.meta.env.VITE_SOCKET_URL;
    private isReconnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;
    private currentToken: string | null = null;
    private isInitialized = false;

    constructor(){
        console.log("WebSocketClient instanciado (não conectado ainda)")
        return
    }

    public initialize(token: string){
        if(this.isInitialized){
            if(this.currentToken == token){
                console.log("Websocket já inicializado com esse token")
                console.log(token)
                console.log(this.currentToken)
                return;
            }
            console.log("Token mudou, reiniciando conexão...")
            this.shutdown()
        }
        if(!token){
            console.error("Não foi possível inicializar WebSocket: token não encontrado")
            return
        }

        console.log("Inicializando WebSocket...")
        this.currentToken = token;
        this.isInitialized = true;
        this.reconnectAttempts = 0;
        this.connect()
    }

    public shutdown(){
        console.log("Deslinga WebSocket...")
        this.isInitialized = false;
        this.reconnectAttempts = this.maxReconnectAttempts;
        this.currentToken = null
        this.disconnect();
    }

    private connect(){
        if(!this.isInitialized || !this.currentToken){
            console.log("WebSocket não inicializado ou sem token, abortando conexão");
            return
        }
        console.log("Tentando conectar WebSocket... ", this.url);
        const wsUrl = `${this.url}?token=${this.currentToken}`;

        try{
            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () =>{
                console.log("WebSocket Conectado");
                this.isReconnecting = false;
                this.reconnectAttempts = 0;
            }            
            this.ws.onclose = (event) =>{
                if(!this.isInitialized) return;
                console.warn("WebSocket fechado");
                console.warn("Código :", event.code);
                console.warn("Razão: ", event.reason);
                console.warn("Clean: ", event.wasClean);

                switch(event.code) {
                    case 1000:
                        console.log("   ℹ️ Fechamento normal");
                        break;
                    case 1006:
                        console.error("   ❌ ERRO 1006: Conexão fechada anormalmente");
                        console.error("   Possíveis causas:");
                        console.error("   - Servidor não está rodando");
                        console.error("   - URL incorreta");
                        console.error("   - Token inválido causando erro no servidor");
                        console.error("   - Problema de rede/CORS");
                        break;
                    case 1008:
                        console.error("   ❌ ERRO 1008: Violação de política (token inválido)");
                        break;
                    case 1011:
                        console.error("   ❌ ERRO 1011: Erro interno do servidor");
                        break;
                }
                if(this.isInitialized){
                    this.scheduleReconnect()
                }
            };
            this.ws.onerror = (error) =>{
                console.error("WebSocket error: ", error)
            }
            this.ws.onmessage = (msg) =>{
                try{
                    const data = JSON.parse(msg.data);
                    console.log("Mensagem recebida: ", data);
                    this.listeners.forEach((cb) => cb(data));
                }catch(error){
                    console.error("Erro ao processar mensagem: ", error)
                    console.error("Dados Recebidos: ", msg.data)
                }
            };
        }catch(err){
            console.error("Erro ao criar WebSocket: ", err)
        }

    }
    private async scheduleReconnect(){
        if(this.isReconnecting || !this.isInitialized)return;

        if(this.reconnectAttempts >= this.maxReconnectAttempts){
            console.error(`❌ Máximo de ${this.maxReconnectAttempts} tentativas atingido`);
            console.error("   Verifique:");
            console.error("   1. Se o servidor WebSocket está rodando");
            console.error("   2. Se a URL está correta:", this.url);
            console.error("   3. Se o token é válido");
            return;
        }
        const storedToken = localStorage.getItem("token");
        if(storedToken && storedToken !== this.currentToken){
            console.warn("Detectada mudança de usuário (Token Storage != Token instância). Cancelando reconxão...")
            this.shutdown();
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;
        console.log(`Agendando reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
        
        try{
            console.log("Tentando renovar token...")

            const newToken = await refreshAuthToken()
            if(newToken) this.currentToken = newToken

            console.log("Token renovado com sucesso")
            console.log(`⏳ Aguardando ${this.reconnectInterval}ms antes de reconectar...`);

            await new Promise(resolve => setTimeout(resolve, this.reconnectInterval));
            this.isReconnecting = false;
            this.connect();
        }catch(error){
            console.error("Erro durante reconexão: ", error)
            this.isReconnecting = false;

            setTimeout(()=>{
                this.scheduleReconnect();
            }, this.reconnectInterval)
        }
    }

    subscribe(callback: MessageListener){
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback)
        }
    }

    disconnect(){
        if(this.ws){
            this.ws.onclose = null;
            this.ws.onerror = null;
            this.ws.onmessage = null;
            this.ws.close(1000, "Client disconnect");
            this.ws = null;
        }
    }

    isConnected(): boolean{
        return this.ws?.readyState === WebSocket.OPEN;
    }

    getConnectionState(): string {
        if(!this.ws)return "NULL";

        switch(this.ws.readyState){
            case WebSocket.CONNECTING: return "CONNECTING"
            case WebSocket.OPEN: return "OPEN"
            case WebSocket.CLOSING: return "CLOSING"
            case WebSocket.CLOSED: return "CLOSED"
            default: return "UNKNOWN"
        }
    }
}

export const webSocketClient = new WebSocketClient()
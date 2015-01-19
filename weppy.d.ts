interface WeppyNamespace {
    timer: WeppyNamespaceTimer;
    namespace(root:string, path?:string): WeppyNamespace;
    into(subpath:string): WeppyNamespace;
    count(name:string, value?:number, annotations?:WeppyContext): void;
    store(name:string, value?:number, annotations?:WeppyContext): void;
    setOptions(options:WeppySettings): void;
    sendPagePerformance(): boolean;
}

interface WeppyNamespaceTimer {
    send(name:string, duration:number, annotations?:WeppyContext): void;
    start(name:string, annotations?:WeppyContext): WeppyTimer;
    stop(name:string, annotations?:WeppyContext): void;
    annotate(name:string, annotations:WeppyContext): void;
    time(name:string, action:any, scope:any, args:any, annotations?:WeppyContext): any;
    timeSync(name:string, action:any, scope:any, args:any, annotations?:WeppyContext): any;
    wrap(name:string, action:any, scope:any, annotations?:WeppyContext): () => any;
    mark(name:string, annotations?:any): void;
}

interface WeppyTimer {
    stop(annotations?:WeppyContext): void;
    annotate(annotations:WeppyContext): void;
}

interface WeppyContext {
    [s:string]: any;
}

interface WeppySettings {
    host?: string;
    transport?: any;
    active?: boolean;
    sample?: number;
    aggregationInterval?: number;
    maxInterval?: number;
    decimalPrecision?: number;
    page?: string;
    context?: {};
}

interface Window {
    Weppy: WeppyNamespace;
}

declare var Weppy:WeppyNamespace;

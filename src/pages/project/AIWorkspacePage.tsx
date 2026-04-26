import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { aiAPI } from '../../lib/api';
import { Bot, Send, Plus, Database, Sparkles } from 'lucide-react';

type ChatMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
};

const GEMINI_MODELS = [
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite (barato)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (balanceado)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (compatible)' },
];

export default function AIWorkspacePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [conversationId, setConversationId] = useState<string | undefined>(undefined);
    const [sending, setSending] = useState(false);

    const [docTitle, setDocTitle] = useState('');
    const [docBody, setDocBody] = useState('');
    const [addingDoc, setAddingDoc] = useState(false);

    const [model, setModel] = useState('gemini-2.0-flash-lite');
    const [temperature, setTemperature] = useState(0.3);
    const [maxTokens, setMaxTokens] = useState(1024);
    const [savingSettings, setSavingSettings] = useState(false);

    const canSend = useMemo(() => Boolean(projectId && input.trim() && !sending), [projectId, input, sending]);

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectId || !input.trim()) return;

        const userText = input.trim();
        const localUserMsg: ChatMessage = {
            id: `u-${Date.now()}`,
            role: 'user',
            content: userText,
            createdAt: Date.now(),
        };

        setMessages((prev) => [...prev, localUserMsg]);
        setInput('');
        setSending(true);

        try {
            const res = await aiAPI.chat(projectId, {
                message: userText,
                conversation_id: conversationId,
            });
            const data = res.data?.data || {};
            if (data.conversation_id && !conversationId) setConversationId(data.conversation_id);
            setMessages((prev) => [
                ...prev,
                {
                    id: `a-${Date.now()}`,
                    role: 'assistant',
                    content: data.reply || 'No hubo respuesta del modelo.',
                    createdAt: Date.now(),
                },
            ]);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'No se pudo enviar el mensaje a AI');
        } finally {
            setSending(false);
        }
    };

    const handleAddContextDoc = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectId || !docTitle.trim() || !docBody.trim()) return;
        setAddingDoc(true);
        try {
            await aiAPI.createContextDoc(projectId, {
                source_type: 'manual',
                title: docTitle.trim(),
                body: docBody.trim(),
            });
            toast.success('Documento de contexto agregado');
            setDocTitle('');
            setDocBody('');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'No se pudo guardar el contexto');
        } finally {
            setAddingDoc(false);
        }
    };

    const handleSaveSettings = async (e: FormEvent) => {
        e.preventDefault();
        if (!projectId) return;
        setSavingSettings(true);
        try {
            await aiAPI.updateSettings(projectId, {
                model,
                temperature,
                max_output_tokens: maxTokens,
                enabled: true,
            });
            toast.success('Configuracion AI guardada');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'No se pudo guardar la configuracion');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div style={{ padding: 28, maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                }}>
                    <Sparkles size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>AI Workspace</h1>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                        Consulta datos de tu proyecto con Gemini y agrega contexto para respuestas mas utiles.
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }} className="ai-grid">
                <section style={{ border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}>
                        <Bot size={15} /> Chat del proyecto
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {messages.length === 0 ? (
                            <div style={{ border: '1px dashed var(--border)', borderRadius: 12, padding: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                                Escribe una consulta como: "resumeme tablas clave del proyecto y que apps deberia activar primero".
                            </div>
                        ) : messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '88%',
                                    border: '1px solid var(--border)',
                                    borderRadius: 12,
                                    padding: '10px 12px',
                                    background: msg.role === 'user' ? 'rgba(16,185,129,0.08)' : 'var(--bg-base)',
                                    fontSize: 13,
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleSend} style={{ borderTop: '1px solid var(--border)', padding: 12, display: 'flex', gap: 8 }}>
                        <input
                            className="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Preguntale a tu AI sobre este proyecto..."
                            style={{ flex: 1 }}
                        />
                        <button type="submit" className="btn btn-primary" disabled={!canSend || sending} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Send size={14} /> {sending ? 'Enviando...' : 'Enviar'}
                        </button>
                    </form>
                </section>

                <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
                    <section style={{ border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-surface)', padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={14} /> Configuracion Gemini
                        </div>
                        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: 8 }}>
                            <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                                Modelo
                                <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
                                    {GEMINI_MODELS.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </label>
                            <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                                Temperatura ({temperature.toFixed(2)})
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={temperature}
                                    onChange={(e) => setTemperature(Number(e.target.value))}
                                />
                            </label>
                            <label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                                Max tokens
                                <input
                                    className="input"
                                    type="number"
                                    min={128}
                                    max={4096}
                                    value={maxTokens}
                                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                                />
                            </label>
                            <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                                {savingSettings ? 'Guardando...' : 'Guardar configuracion'}
                            </button>
                        </form>
                    </section>

                    <section style={{ border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-surface)', padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <Database size={14} /> Contexto de negocio
                        </div>
                        <form onSubmit={handleAddContextDoc} style={{ display: 'grid', gap: 8 }}>
                            <input
                                className="input"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="Titulo (ej: Politica de atencion)"
                            />
                            <textarea
                                className="input"
                                value={docBody}
                                onChange={(e) => setDocBody(e.target.value)}
                                placeholder="Escribe reglas, procesos o conocimiento que AI deba usar..."
                                rows={6}
                                style={{ resize: 'vertical' }}
                            />
                            <button type="submit" className="btn btn-ghost" disabled={addingDoc} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                <Plus size={14} /> {addingDoc ? 'Guardando...' : 'Agregar contexto'}
                            </button>
                        </form>
                    </section>
                </div>
            </div>

            <style>{`
                @media (max-width: 980px) {
                    .ai-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

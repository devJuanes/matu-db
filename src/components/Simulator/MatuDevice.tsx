import { useMemo, useState } from 'react';
import { RotateCw, RefreshCcw, ExternalLink } from 'lucide-react';

type Orientation = 'portrait' | 'landscape';
type DeviceTheme = 'light' | 'dark';
type DevicePresetKey = 'iphone15promax' | 'pixel8pro' | 'galaxys24';

interface DevicePreset {
    key: DevicePresetKey;
    label: string;
    width: number;
    height: number;
    bezelColor: string;
    cornerRadius: number;
    screenRadius: number;
    hasIsland: boolean;
}

const DEVICE_PRESETS: DevicePreset[] = [
    {
        key: 'iphone15promax',
        label: 'iPhone 15 Pro Max',
        width: 430,
        height: 932,
        bezelColor: '#1c1c1f',
        cornerRadius: 52,
        screenRadius: 42,
        hasIsland: true,
    },
    {
        key: 'pixel8pro',
        label: 'Pixel 8 Pro',
        width: 448,
        height: 998,
        bezelColor: '#1a1a1a',
        cornerRadius: 46,
        screenRadius: 36,
        hasIsland: false,
    },
    {
        key: 'galaxys24',
        label: 'Galaxy S24',
        width: 432,
        height: 936,
        bezelColor: '#171717',
        cornerRadius: 44,
        screenRadius: 34,
        hasIsland: false,
    },
];

interface MatuDeviceProps {
    url?: string;
    theme?: DeviceTheme;
}

function normalizeUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return window.location.origin;

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    if (trimmed.startsWith('/')) {
        return `${window.location.origin}${trimmed}`;
    }

    if (trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1')) {
        return `http://${trimmed}`;
    }

    return `https://${trimmed}`;
}

export const MatuDevice = ({ url = `${window.location.origin}/`, theme = 'dark' }: MatuDeviceProps) => {
    const [currentUrl, setCurrentUrl] = useState(normalizeUrl(url));
    const [inputUrl, setInputUrl] = useState(normalizeUrl(url));
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [deviceTheme, setDeviceTheme] = useState<DeviceTheme>(theme);
    const [deviceKey, setDeviceKey] = useState<DevicePresetKey>('iphone15promax');
    const [refreshKey, setRefreshKey] = useState(0);

    const device = useMemo(
        () => DEVICE_PRESETS.find((preset) => preset.key === deviceKey) ?? DEVICE_PRESETS[0],
        [deviceKey]
    );

    const isPortrait = orientation === 'portrait';
    const frameWidth = isPortrait ? device.width : device.height;
    const frameHeight = isPortrait ? device.height : device.width;

    const handleNavigate = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUrl = normalizeUrl(inputUrl);
        setCurrentUrl(finalUrl);
        setInputUrl(finalUrl);
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
            <div
                style={{
                    width: '100%',
                    maxWidth: 1120,
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: '1.2fr 2fr auto auto auto auto',
                    alignItems: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 12,
                }}
            >
                <select
                    className="input"
                    value={deviceKey}
                    onChange={(e) => setDeviceKey(e.target.value as DevicePresetKey)}
                    style={{ height: 40 }}
                >
                    {DEVICE_PRESETS.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                            {preset.label}
                        </option>
                    ))}
                </select>

                <form onSubmit={handleNavigate} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        className="input"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="https://tuapp.com o /ruta"
                        style={{ height: 40, width: '100%' }}
                    />
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: 40 }}>
                        Cargar
                    </button>
                </form>

                <button
                    className="btn btn-ghost btn-sm"
                    title="Rotar dispositivo"
                    onClick={() => setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
                >
                    <RotateCw size={16} />
                </button>

                <button
                    className="btn btn-ghost btn-sm"
                    title="Recargar vista"
                    onClick={() => setRefreshKey((prev) => prev + 1)}
                >
                    <RefreshCcw size={16} />
                </button>

                <button
                    className="btn btn-ghost btn-sm"
                    title="Cambiar tema del dispositivo"
                    onClick={() => setDeviceTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                >
                    {deviceTheme === 'dark' ? '🌙' : '☀️'}
                </button>

                <a href={currentUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="Abrir en pestaña">
                    <ExternalLink size={16} />
                </a>
            </div>

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'auto', paddingBottom: 12 }}>
                <div
                    style={{
                        width: frameWidth,
                        height: frameHeight,
                        padding: 10,
                        borderRadius: device.cornerRadius,
                        background: device.bezelColor,
                        boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: device.screenRadius,
                            background: deviceTheme === 'dark' ? '#090909' : '#f3f3f3',
                            border: `1px solid ${deviceTheme === 'dark' ? '#303030' : '#dfdfdf'}`,
                        }}
                    >
                        {isPortrait && device.hasIsland && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 126,
                                    height: 30,
                                    borderRadius: 20,
                                    background: '#000',
                                    zIndex: 5,
                                }}
                            />
                        )}

                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 38,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '0 12px',
                                background: deviceTheme === 'dark' ? '#111' : '#fff',
                                borderBottom: `1px solid ${deviceTheme === 'dark' ? '#2a2a2a' : '#e5e5e5'}`,
                                zIndex: 4,
                            }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#ff605c' }} />
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#ffbd44' }} />
                            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#00ca4e' }} />
                            <div
                                style={{
                                    marginLeft: 8,
                                    flex: 1,
                                    height: 24,
                                    borderRadius: 999,
                                    background: deviceTheme === 'dark' ? '#1d1d1d' : '#f0f0f0',
                                    border: `1px solid ${deviceTheme === 'dark' ? '#2f2f2f' : '#dddddd'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 10px',
                                    fontSize: 11,
                                    color: 'var(--text-muted)',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {currentUrl}
                            </div>
                        </div>

                        <iframe
                            key={refreshKey}
                            src={currentUrl}
                            title="MatuSimulator"
                            style={{ width: '100%', height: '100%', border: 'none', marginTop: 38 }}
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatuDevice;

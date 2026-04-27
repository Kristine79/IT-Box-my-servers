import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e8edf5 0%, #d1d9e6 50%, #c3cfe2 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '60px',
            borderRadius: '32px',
            background: '#e0e5ec',
            boxShadow: '20px 20px 60px #bec3c9, -20px -20px 60px #ffffff',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: '-2px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            StackBox
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#64748b',
              marginTop: 16,
              textAlign: 'center',
              maxWidth: 600,
            }}
          >
            Управление серверами, сервисами и доступами
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginTop: 32,
              fontSize: 18,
              color: '#94a3b8',
            }}
          >
            <span>🔐 AES-256</span>
            <span>🖥️ Серверы</span>
            <span>🔑 Доступы</span>
            <span>👥 Команда</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

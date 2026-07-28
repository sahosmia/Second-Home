import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#10b981',
          borderRadius: '24%',
          fontWeight: 900,
          border: '1.5px solid #10b981',
        }}
      >
        🏠
      </div>
    ),
    {
      ...size,
    }
  );
}

function getNoticePalette(tone = 'info') {
  const palette = {
    error: {
      background: 'rgba(120, 12, 32, 0.96)',
      border: 'rgba(255, 84, 118, 0.42)',
      color: 'rgba(255, 240, 244, 0.96)',
    },
    warn: {
      background: 'rgba(76, 46, 6, 0.96)',
      border: 'rgba(240, 180, 41, 0.42)',
      color: 'rgba(255, 245, 214, 0.96)',
    },
    info: {
      background: 'rgba(6, 50, 44, 0.96)',
      border: 'rgba(0, 255, 204, 0.32)',
      color: 'rgba(225, 255, 248, 0.96)',
    },
  };
  return palette[tone] || palette.info;
}

export function buildNoticeStyle(tone = 'info') {
  const colors = getNoticePalette(tone);
  return `position:fixed;bottom:24px;right:24px;background:${colors.background};border:1px solid ${colors.border};color:${colors.color};padding:12px 20px;border-radius:10px;z-index:9999;font-family:'Share Tech Mono',monospace;font-size:12px;letter-spacing:0.04em;box-shadow:0 8px 24px rgba(0,0,0,0.38);`;
}

export function resolveStorageFailureText(payload = {}) {
  return `저장 공간이 부족해 현재 런을 유지합니다. ${payload.reason || 'Unknown error'}`;
}

import type { StoryPublic } from '$lib/room/protocol';
import { isPointEstimate } from '$lib/room/decks';
import { storyStatusLabel } from '$lib/i18n/labels';
import { t } from '$lib/i18n';

const BRAND = '#165d70';
const BRAND_DARK = '#0b5d70';
const TEXT = '#123840';
const MUTED = '#5a7a82';
const BG = '#f3f8fa';
const CARD = '#ffffff';
const LINE = 'rgba(22, 93, 112, 0.14)';
const DONE_BG = '#eef8f1';

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function downloadResultsImage(
  roomName: string,
  stories: StoryPublic[]
): Promise<void> {
  const width = 900;
  const pad = 40;
  const rowH = 78;
  const headerBandH = 148;
  const headerH = 196;
  const footerH = 48;
  const height = headerH + Math.max(stories.length, 1) * rowH + footerH + pad;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error(t('results.canvasError'));

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#e8f4f6');
  grad.addColorStop(1, '#d5e8ee');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = CARD;
  roundRect(ctx, 24, 24, width - 48, height - 48, 28);
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = BG;
  roundRect(ctx, 24, 24, width - 48, headerBandH, 28);
  ctx.fill();
  ctx.fillStyle = CARD;
  ctx.fillRect(24, 24 + headerBandH - 28, width - 48, 28);

  ctx.fillStyle = BRAND;
  ctx.font = '700 14px Montserrat, sans-serif';
  ctx.fillText('PLANNING POKER', 56, 58);

  ctx.fillStyle = BRAND_DARK;
  ctx.font = '400 42px Pattaya, Georgia, serif';
  ctx.fillText(roomName.slice(0, 42) || t('results.title'), 56, 112);

  const estimated = stories.filter((s) => s.estimates.overall).length;
  ctx.fillStyle = MUTED;
  ctx.font = '600 16px Montserrat, sans-serif';
  ctx.fillText(
    stories.length
      ? t('results.imageSubtitle', { estimated, total: stories.length })
      : t('results.noStoriesYet'),
    56,
    188
  );

  let y = headerH + 8;
  if (stories.length === 0) {
    ctx.fillStyle = BG;
    roundRect(ctx, 56, y, width - 112, 64, 16);
    ctx.fill();
    ctx.fillStyle = MUTED;
    ctx.font = '600 18px Montserrat, sans-serif';
    ctx.fillText(t('results.emptyCapture'), 80, y + 40);
  } else {
    for (const story of stories) {
      const done = Boolean(story.estimates.overall);
      ctx.fillStyle = done ? DONE_BG : BG;
      roundRect(ctx, 56, y, width - 112, rowH - 12, 16);
      ctx.fill();
      ctx.strokeStyle = done ? 'rgba(54, 168, 72, 0.28)' : LINE;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = TEXT;
      ctx.font = '700 20px Montserrat, sans-serif';
      const title = story.title.length > 48 ? `${story.title.slice(0, 47)}…` : story.title;
      ctx.fillText(title, 80, y + 34);

      ctx.fillStyle = MUTED;
      ctx.font = '600 13px Montserrat, sans-serif';
      ctx.fillText(storyStatusLabel(story.status), 80, y + 56);

      const value = story.estimates.overall ?? '—';
      const showPts = isPointEstimate(value);
      ctx.fillStyle = done ? BRAND_DARK : '#9ab0b6';
      ctx.font = '400 36px Pattaya, Georgia, serif';
      const valueWidth = ctx.measureText(value).width;
      let ptsWidth = 0;
      if (showPts) {
        ctx.font = '800 14px Montserrat, sans-serif';
        ptsWidth = ctx.measureText('pts').width + 4;
      }
      let x = width - 80 - valueWidth - ptsWidth;
      ctx.font = '400 36px Pattaya, Georgia, serif';
      ctx.fillText(value, x, y + 48);
      if (showPts) {
        ctx.font = '800 14px Montserrat, sans-serif';
        ctx.fillText('pts', x + valueWidth + 4, y + 48);
      }

      y += rowH;
    }
  }

  ctx.fillStyle = MUTED;
  ctx.font = '600 12px Montserrat, sans-serif';
  ctx.fillText('planning-poker-free', 56, height - 40);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );
  if (!blob) throw new Error(t('results.canvasError'));

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = roomName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  a.href = url;
  a.download = `${t('results.downloadPrefix')}-${safe || t('results.downloadFallback')}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

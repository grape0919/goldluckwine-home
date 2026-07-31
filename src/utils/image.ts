/** 업로드 전 클라이언트 리사이즈 — 대용량 원본이 Storage/사이트에 그대로 실리는 것을 방지 */

const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 0.85;

/**
 * 이미지를 최대 1600px(긴 변 기준)로 줄이고 WebP로 변환한다.
 * - 투명 배경(보틀 PNG) 유지 (WebP는 알파 지원)
 * - 변환 결과가 원본보다 크면 원본을 그대로 반환
 * - 이미지 디코딩 실패(SVG 등 특수 포맷) 시 원본 반환
 */
export async function optimizeImageFile(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  } catch {
    return file;
  }
}

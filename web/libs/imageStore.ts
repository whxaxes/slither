// get image of snake header
export function getSnakeHeader(
  width: number,
  height: number,
): HTMLCanvasElement {
  const img = document.createElement('canvas');
  const ctx = img.getContext('2d')!;
  const dis: number = 2;

  img.width = width + dis * 2;
  img.height = height + dis * 2;

  const eyeRadius: number = width * 0.2;

  function drawEye(eyeX: number, eyeY: number): void {
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // eyehole
    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.arc(eyeX, eyeY - eyeRadius / 2, eyeRadius / 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // left eye
  drawEye(
    img.width / 2 - width / 2 + eyeRadius,
    img.height / 2 - height / 2 + eyeRadius,
  );

  // right eye
  drawEye(
    img.width / 2 + width / 2 - eyeRadius,
    img.height / 2 - height / 2 + eyeRadius,
  );

  return img;
}

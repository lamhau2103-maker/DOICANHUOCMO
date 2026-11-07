/**
 * Thu nhỏ ảnh về tối đa 1024px cạnh dài (JPEG chất lượng 0.85) trước khi gửi
 */
export interface CompressedImageResult {
  pureBase64: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
}

export async function compressAndResizeImage(source: string): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;
      const maxDimension = 1024;

      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Không thể khởi tạo Canvas để nén ảnh.'));
      }

      // Nền trắng phòng trường hợp ảnh PNG có nền trong suốt
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Vẽ ảnh với kích thước tối đa 1024px
      ctx.drawImage(img, 0, 0, width, height);

      // Xuất định dạng JPEG chất lượng 0.85
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const pureBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');

      resolve({
        pureBase64,
        mimeType: 'image/jpeg',
        dataUrl,
        width,
        height,
      });
    };

    img.onerror = (err) => {
      reject(new Error('Không thể tải dữ liệu ảnh học sinh để xử lý. Vui lòng chọn ảnh khác.'));
    };

    img.src = source;
  });
}

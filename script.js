document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const controlPanel = document.getElementById('controlPanel');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;
    let compressedDataURL = null; // 新增：存储压缩后的图片数据

    // 处理拖放上传
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 拖放视觉反馈
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('highlight');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('highlight');
        });
    });

    // 处理文件拖放
    uploadArea.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // 处理点击上传
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // 处理文件上传
    function handleFile(file) {
        if (!file || !file.type.match(/image\/(jpeg|png)/)) {
            alert('请上传 PNG 或 JPG 格式的图片！');
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            previewContainer.style.display = 'grid';
            controlPanel.style.display = 'block';
            compressImage(e.target.result);
        };

        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(dataUrl) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 保持原始尺寸
            canvas.width = img.width;
            canvas.height = img.height;

            // 绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 压缩
            compressedDataURL = canvas.toDataURL('image/jpeg', quality.value / 100);
            compressedImage.src = compressedDataURL;

            // 计算压缩后文件大小
            const base64str = compressedDataURL.split(',')[1];
            const compressedBytes = atob(base64str).length;
            compressedSize.textContent = formatFileSize(compressedBytes);
        };
        img.src = dataUrl;
    }

    // 质量滑块控制
    quality.addEventListener('input', () => {
        qualityValue.textContent = `${quality.value}%`;
        if (originalImage.src) {
            compressImage(originalImage.src);
        }
    });

    // 下载压缩后的图片
    downloadBtn.addEventListener('click', () => {
        if (!compressedDataURL) {
            alert('请先上传图片！');
            return;
        }

        // 创建一个临时链接
        const link = document.createElement('a');
        link.href = compressedDataURL;
        
        // 设置文件名
        const extension = originalFile.type === 'image/png' ? '.png' : '.jpg';
        const fileName = originalFile.name.replace(/\.[^/.]+$/, '') || 'compressed';
        link.download = `${fileName}_compressed${extension}`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}); 

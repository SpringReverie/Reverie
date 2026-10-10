import { sitePath } from './sitePath';
const photoRecords = [
  {
    "id": "01",
    "title": "春日近观",
    "src": "/assets/photography/photography-01.webp",
    "thumb": "/assets/photography/photography-01-thumb.webp",
    "original": "摄影作品01.jpg"
  },
  {
    "id": "02",
    "title": "山风与云",
    "src": "/assets/photography/photography-02.webp",
    "thumb": "/assets/photography/photography-02-thumb.webp",
    "original": "摄影作品02.jpg"
  },
  {
    "id": "03",
    "title": "日落之前",
    "src": "/assets/photography/photography-03.webp",
    "thumb": "/assets/photography/photography-03-thumb.webp",
    "original": "摄影作品03.jpg"
  },
  {
    "id": "04",
    "title": "江畔夜色",
    "src": "/assets/photography/photography-04.webp",
    "thumb": "/assets/photography/photography-04-thumb.webp",
    "original": "摄影作品04.jpg"
  },
  {
    "id": "05",
    "title": "夜行光廊",
    "src": "/assets/photography/photography-05.webp",
    "thumb": "/assets/photography/photography-05-thumb.webp",
    "original": "摄影作品05.jpg"
  },
  {
    "id": "06",
    "title": "树与屋檐",
    "src": "/assets/photography/photography-06.webp",
    "thumb": "/assets/photography/photography-06-thumb.webp",
    "original": "摄影作品06.jpg"
  },
  {
    "id": "07",
    "title": "水上灯火",
    "src": "/assets/photography/photography-07.webp",
    "thumb": "/assets/photography/photography-07-thumb.webp",
    "original": "摄影作品07.jpg"
  },
  {
    "id": "08",
    "title": "月下海岸",
    "src": "/assets/photography/photography-08.webp",
    "thumb": "/assets/photography/photography-08-thumb.webp",
    "original": "摄影作品08.jpg"
  },
  {
    "id": "09",
    "title": "街巷深处",
    "src": "/assets/photography/photography-09.webp",
    "thumb": "/assets/photography/photography-09-thumb.webp",
    "original": "摄影作品09.jpg"
  }
];

const certificateRecords = [
  {
    "id": "01",
    "title": "ai训练师初级证书",
    "src": "/assets/certificates/certificate-01.webp",
    "thumb": "/assets/certificates/certificate-01-thumb.webp",
    "original": "ai训练师初级证书.png"
  },
  {
    "id": "02",
    "title": "ai训练师高级证书",
    "src": "/assets/certificates/certificate-02.webp",
    "thumb": "/assets/certificates/certificate-02-thumb.webp",
    "original": "ai训练师高级证书.png"
  },
  {
    "id": "03",
    "title": "阿里云大模型",
    "src": "/assets/certificates/certificate-03.webp",
    "thumb": "/assets/certificates/certificate-03-thumb.webp",
    "original": "阿里云大模型.jpg"
  },
  {
    "id": "04",
    "title": "阿里云RAG",
    "src": "/assets/certificates/certificate-04.webp",
    "thumb": "/assets/certificates/certificate-04-thumb.webp",
    "original": "阿里云RAG.jpg"
  },
  {
    "id": "05",
    "title": "阿里云Spring AI",
    "src": "/assets/certificates/certificate-05.webp",
    "thumb": "/assets/certificates/certificate-05-thumb.webp",
    "original": "阿里云Spring AI.jpg"
  },
  {
    "id": "06",
    "title": "阿里云Vision进阶",
    "src": "/assets/certificates/certificate-06.webp",
    "thumb": "/assets/certificates/certificate-06-thumb.webp",
    "original": "阿里云Vision进阶.jpg"
  },
  {
    "id": "07",
    "title": "基于百炼平台构建智能体应用",
    "src": "/assets/certificates/certificate-07.webp",
    "thumb": "/assets/certificates/certificate-07-thumb.webp",
    "original": "基于百炼平台构建智能体应用.jpg"
  },
  {
    "id": "08",
    "title": "基于通义灵码实现高效AI编码实践",
    "src": "/assets/certificates/certificate-08.webp",
    "thumb": "/assets/certificates/certificate-08-thumb.webp",
    "original": "基于通义灵码实现高效AI编码实践.jpg"
  },
  {
    "id": "09",
    "title": "基于PAI ArtLab的AIGC设计基础",
    "src": "/assets/certificates/certificate-09.webp",
    "thumb": "/assets/certificates/certificate-09-thumb.webp",
    "original": "基于PAI ArtLab的AIGC设计基础.jpg"
  },
  {
    "id": "10",
    "title": "VISION人工智能设计(入门)",
    "src": "/assets/certificates/certificate-10.webp",
    "thumb": "/assets/certificates/certificate-10-thumb.webp",
    "original": "VISION人工智能设计(入门).jpg"
  },
  {
    "id": "11",
    "title": "科大微调工程师",
    "src": "/assets/certificates/certificate-11.webp",
    "thumb": "/assets/certificates/certificate-11-thumb.webp",
    "original": "科大微调工程师.jpg"
  },
  {
    "id": "12",
    "title": "科大智能体工程师",
    "src": "/assets/certificates/certificate-12.webp",
    "thumb": "/assets/certificates/certificate-12-thumb.webp",
    "original": "科大智能体工程师.jpg"
  },
  {
    "id": "13",
    "title": "科大Prompt工程师",
    "src": "/assets/certificates/certificate-13.webp",
    "thumb": "/assets/certificates/certificate-13-thumb.webp",
    "original": "科大Prompt工程师.jpg"
  },
  {
    "id": "14",
    "title": "科大RAG工程师",
    "src": "/assets/certificates/certificate-14.webp",
    "thumb": "/assets/certificates/certificate-14-thumb.webp",
    "original": "科大RAG工程师.jpg"
  },
  {
    "id": "15",
    "title": "华为AI智能语音识别",
    "src": "/assets/certificates/certificate-15.webp",
    "thumb": "/assets/certificates/certificate-15-thumb.webp",
    "original": "华为AI智能语音识别.png"
  },
  {
    "id": "16",
    "title": "人工智能初识微认证",
    "src": "/assets/certificates/certificate-16.webp",
    "thumb": "/assets/certificates/certificate-16-thumb.webp",
    "original": "人工智能初识微认证.jpg"
  },
  {
    "id": "17",
    "title": "Bh Python",
    "src": "/assets/certificates/certificate-17.webp",
    "thumb": "/assets/certificates/certificate-17-thumb.webp",
    "original": "Bh Python.png"
  }
];

const withSitePaths = item => ({ ...item, src: sitePath(item.src), thumb: sitePath(item.thumb) });
export const photographs = photoRecords.map(withSitePaths);
export const certificates = certificateRecords.map(withSitePaths);

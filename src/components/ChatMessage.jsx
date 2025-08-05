import ChatbotIcon from './ChatbotIcon';
import TravelItineraryDisplay from './TravelItineraryDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef, useState } from 'react';

const ChatMessage = ({ chat }) => {
  // 判断是否为 AI 模型输出
  const isBot = chat.role === 'model';
  const messageRef = useRef();
  const [uploadLink, setUploadLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateAndUploadPDF = async () => {
    if (!messageRef.current) return;
    setLoading(true);
    setError(null);
    setUploadLink(null);

    try {
      // 1. 生成 canvas
      const canvas = await html2canvas(messageRef.current, {
        scale: 2,
        useCORS: true,
      });

      // 2. 生成图片数据
      const imgData = canvas.toDataURL('image/png');

      // 3. 生成 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('itinerary.pdf');
      // 4. 导出 PDF 到 Blob
      const pdfBlob = pdf.output('blob');

      // 5. 构造 FormData 上传 file.io
      const formData = new FormData();
      formData.append('file', pdfBlob, 'itinerary.pdf');

      // 6. 上传文件
      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!resp.ok) throw new Error('Upload failed');

      const json = await resp.json();
      if (!json.success) throw new Error(json.message || 'Upload failed');

      // 7. 设置分享链接
      setUploadLink(json.link);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    !chat.hideInChat && (
      <div
        className={`message ${isBot ? 'bot' : 'user'}-message ${
          chat.isError ? 'error' : ''
        }`}
      >
        {isBot && <ChatbotIcon />}

        <div className="message-text">
          {isBot ? (
            <>
              <div ref={messageRef}>
                <TravelItineraryDisplay rawApiResponseText={chat.text} />
              </div>

              <button
                onClick={handleGenerateAndUploadPDF}
                disabled={loading}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Uploading...' : '📄 Generate PDF & Get Share Link'}
              </button>

              {uploadLink && (
                <p
                  style={{ marginTop: '6px', fontSize: '12px', color: 'green' }}
                >
                  Upload success:{' '}
                  <a href={uploadLink} target="_blank" rel="noreferrer">
                    {uploadLink}
                  </a>
                </p>
              )}

              {error && (
                <p style={{ marginTop: '6px', fontSize: '12px', color: 'red' }}>
                  Error: {error}
                </p>
              )}
            </>
          ) : (
            <p>{chat.text}</p>
          )}
        </div>
      </div>
    )
  );
};

export default ChatMessage;

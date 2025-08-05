import { useMemo, useState } from 'react';
import jsPDF from 'jspdf';

function decodeNewLines(str) {
  console.log('decodeNewLines input:', str);
  const res = str.replace(/\\n/g, '\n');
  console.log('decodeNewLines output:', res);
  return res;
}

function splitTextAndJson(rawText) {
  console.log('splitTextAndJson input:', rawText);
  const jsonMatch = rawText.match(/```json([\s\S]*?)```/);
  let jsonStr = null;
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
    console.log(
      'Found JSON string:',
      jsonStr.slice(0, 200) + (jsonStr.length > 200 ? '...' : '')
    );
  } else {
    console.log('No JSON string found');
  }
  const plainText = rawText
    .replace(/```json[\s\S]*?```/, '')
    .replace(/^['"\[\]]+|['"\[\]]+$/g, '') // eslint-disable-line no-useless-escape
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/^\s*,+|,+\s*$/g, '')
    .trim();

  console.log(
    'Extracted plain text:',
    plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '')
  );
  return { plainText, jsonStr };
}
/**
 * 清理 JSON 字符串中多余的转义，修正格式方便 JSON.parse 解析
 * @param {string} str
 */
function fixEscapedJsonString(str) {
  console.log(
    'fixEscapedJsonString input:',
    str.slice(0, 200) + (str.length > 200 ? '...' : '')
  );
  let s = str.replace(/\\\\/g, '\\'); // 把双反斜杠 \\ 变单反斜杠 \
  s = s.replace(/\\"/g, '"'); // 把 \" 变成 "
  s = s.replace(/\\'/g, "'"); // 把 \' 变成 '
  s = s.trim();
  console.log(
    'fixEscapedJsonString output:',
    s.slice(0, 200) + (s.length > 200 ? '...' : '')
  );
  return s;
}

function Itinerary({ itinerary }) {
  // 先把对象转成数组：[{date: '2025-10-01', activities: [...]}, ...]
  const days = Object.entries(itinerary).map(([date, data]) => ({
    date,
    activities: data.activities,
  }));

  return (
    <div style={{ marginTop: 16 }}>
      {days.map(({ date, activities }) => (
        <div
          key={date}
          style={{
            marginBottom: 24,
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 6,
            backgroundColor: '#fafafa',
          }}
        >
          <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
            {date}
          </h3>
          {activities.map((act, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom:
                  idx === activities.length - 1 ? 'none' : '1px dashed #ddd',
              }}
            >
              <h4 style={{ margin: '4px 0', color: '#333' }}>
                {act.time} — {act.name}
              </h4>
              <p
                style={{ margin: '4px 0', fontStyle: 'italic', color: '#555' }}
              >
                {act.description}
              </p>
              <p style={{ margin: '4px 0' }}>
                <b>Address:</b> {act.address}
              </p>
              <p style={{ margin: '4px 0' }}>
                <b>Budget:</b> {act.budget}
              </p>
              <p style={{ margin: '4px 0', color: '#777' }}>
                <b>Tips:</b> {act.notes}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * TravelItineraryDisplay 组件
 * @param {string} rawApiResponseText - 传入 API 返回的原始文本，包含普通文本和包裹在 ```json``` 的 JSON 字符串
 */
export default function TravelItineraryDisplay({ rawApiResponseText }) {
  const [uploadLink, setUploadLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { plainText, jsonStr } = useMemo(() => {
    if (!rawApiResponseText) return { plainText: '', jsonStr: null };
    const decoded = decodeNewLines(rawApiResponseText);
    return splitTextAndJson(decoded);
  }, [rawApiResponseText]);

  let itineraryData = null;
  try {
    if (jsonStr) {
      const fixedJsonStr = fixEscapedJsonString(jsonStr);
      itineraryData = JSON.parse(fixedJsonStr);
      console.log('Parsed itinerary data:', itineraryData);
    }
  } catch (e) {
    console.error('JSON parse error:', e);
  }
  const handleGenerateAndUploadPDF = async () => {
    setLoading(true);
    setError(null);
    setUploadLink(null);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const lineHeight = 7;
      const maxLineWidth = pageWidth - margin * 2;

      // 写普通文本
      const plainLines = pdf.splitTextToSize(plainText, maxLineWidth);
      let cursorY = margin;
      plainLines.forEach((line) => {
        if (cursorY + lineHeight > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
        pdf.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      // 写行程 JSON
      if (itineraryData && itineraryData.itinerary) {
        pdf.addPage();
        pdf.setFontSize(16);
        pdf.text('Travel Plan:', margin, margin);
        pdf.setFontSize(12);
        cursorY = margin + 10;

        Object.entries(itineraryData.itinerary).forEach(([date, day]) => {
          if (cursorY + lineHeight * 2 > pageHeight - margin) {
            pdf.addPage();
            cursorY = margin;
          }
          pdf.text(`Date: ${date}`, margin, cursorY);
          cursorY += lineHeight;

          day.activities.forEach((act) => {
            const actText = `- ${act.time} ${act.name}: ${act.description} Address: ${act.address} Budget: ${act.budget} Tips: ${act.notes}`;
            const actLines = pdf.splitTextToSize(actText, maxLineWidth);
            actLines.forEach((l) => {
              if (cursorY + lineHeight > pageHeight - margin) {
                pdf.addPage();
                cursorY = margin;
              }
              pdf.text(l, margin + 5, cursorY);
              cursorY += lineHeight;
            });
          });
          cursorY += lineHeight / 2;
        });
      }

      // 保存 PDF（可选）
      pdf.save('itinerary.pdf');

      // 上传到 /api/upload
      const pdfBlob = pdf.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, 'itinerary.pdf');

      const resp = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) throw new Error('Upload failed');

      const json = await resp.json();
      if (!json.success) throw new Error(json.message || 'Upload failed');

      setUploadLink(json.link);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: 'auto',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        lineHeight: 1.6,
        color: '#222',
        padding: 20,
      }}
    >
      {/* 普通文本 */}
      {plainText.split('\n\n').map((para, i) => (
        <p
          key={i}
          style={{
            whiteSpace: 'pre-wrap',
            marginBottom: 20,
            fontSize: 16,
          }}
        >
          {para}
        </p>
      ))}

      {/* 行程 JSON 渲染 */}
      {itineraryData && itineraryData.itinerary && (
        <>
          <h2 style={{ borderBottom: '2px solid #333', paddingBottom: 8 }}>
            Travel Plan:
          </h2>
          <Itinerary itinerary={itineraryData.itinerary} />
        </>
      )}
      {/* 生成 PDF 按钮 */}
      <button
        onClick={handleGenerateAndUploadPDF}
        disabled={loading}
        style={{
          marginTop: 20,
          fontSize: 14,
          padding: '6px 14px',
          borderRadius: 5,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Uploading...' : '📄 Generate PDF & Get Share Link'}
      </button>

      {/* 分享链接 */}
      {uploadLink && (
        <p style={{ marginTop: 12, color: 'green', fontSize: 14 }}>
          Upload success:{' '}
          <a href={uploadLink} target="_blank" rel="noreferrer">
            {uploadLink}
          </a>
        </p>
      )}

      {/* 错误提示 */}
      {error && (
        <p style={{ marginTop: 12, color: 'red', fontSize: 14 }}>
          Error: {error}
        </p>
      )}
    </div>
  );
}

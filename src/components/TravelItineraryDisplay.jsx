import { useMemo } from 'react';

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
  console.log('it: ', itinerary);
  return (
    <div style={{ marginTop: 16 }}>
      {itinerary.map(({ date, activities }) => (
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
    </div>
  );
}

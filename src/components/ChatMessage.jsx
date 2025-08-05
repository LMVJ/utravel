import ChatbotIcon from "./ChatbotIcon";
import TravelItineraryDisplay from "./TravelItineraryDisplay";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

const ChatMessage = ({ chat }) => {
  // 判断是否为 AI 模型输出
  const isBot = chat.role === "model";
  const messageRef = useRef();

  const handleDownloadPDF = async () => {
    if (!messageRef.current) return;

    const canvas = await html2canvas(messageRef.current, {
      scale: 2, // 提高清晰度
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("itinerary.pdf");
  };

  return (
    !chat.hideInChat && (
      <div
        className={`message ${isBot ? "bot" : "user"}-message ${
          chat.isError ? "error" : ""
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
                onClick={handleDownloadPDF}
                style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                📄 Generate PDF
              </button>
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

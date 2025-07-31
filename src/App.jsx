import { useEffect, useRef, useState } from "react";
import { LoadScript, GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";





const mapContainerStyle = {
  width: "400px",
  height: "300px",
  margin: "10px auto",
};


const defaultCenter = { lat: 20.0, lng: 110.0 };

const App = () => {

  const [locations, setLocations] = useState([]);
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const [showMap, setShowMap] = useState(false);
  const [chatApiUrl, setChatApiUrl] = useState("");

  const exportLocationsAsJSON = () => {
    const json = JSON.stringify(locations, null, 2); // 格式化
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "travel_locations.json";
    link.click();

    URL.revokeObjectURL(url); // 清理内存
  };


  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text != "Thinking..."), { role: "model", text, isError }]);
    };

    // 只发送用户的最新一条消息
    const latestUserMessage = history.filter((msg) => msg.role === "user").slice(-1)[0];
    if (!latestUserMessage) {
      updateHistory("No user input to send.", true);
      return;
    }
 
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: latestUserMessage.text }),
    };

    try {
      if (!chatApiUrl) throw new Error("No session started yet.");
      const response = await fetch(chatApiUrl, requestOptions);
      const data = await response.json();
      console.log(data);
      if (!response.ok) throw new Error(data?.error?.message || "Something went wrong!");


      const text = data.message.content.trim();
      const locationsExtracted = [];
      const locationPattern = /"name":\s*"([^"]+)"[\s\S]*?"latitude":\s*([\d.]+)[\s\S]*?"longitude":\s*([\d.]+)/g;
      let match;
      let id = 1;

      while ((match = locationPattern.exec(text)) !== null) {
        const name = match[1];
        const lat = parseFloat(match[2]);
        const lng = parseFloat(match[3]);

        if (!locationsExtracted.some(loc => loc.name === name)) {
          locationsExtracted.push({ id: id++, name, lat, lng });
        }
      }

      console.log("locations:", locationsExtracted)
      setLocations(locationsExtracted);
      updateHistory(text);

    } catch (error) {
      updateHistory(error.message, true);
    }

  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "fixed",
        top: "calc(50% - 150px)", // 比按钮高一点
        left: "50%",
        transform: "translateX(-50%)"
      }}>
        <ChatbotIcon />
      </div>
      <button
        onClick={async () => {
            try {
              console.log("Sending start request to:", import.meta.env.VITE_START_API_URL);
              // 1. 发送 "start" 请求唤醒 agent
              const res = await fetch(import.meta.env.VITE_START_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "start" }),
              });
              console.log("Raw response:", res);
              if (!res.ok) throw new Error("Failed to start agent");

              const data = await res.json();
              console.log("Parsed response JSON:", data);
              // 2. 提取 session_id
              const sessionId = data.session_id;
              if (!sessionId) throw new Error("No session_id returned");
              console.log("Session ID:", sessionId);
              // 3. 拼接新 API URL，并存入环境变量替代方案
              const apiURL = `http://8.211.147.14:8000/api/v1/sessions/${sessionId}/send_message/`;
              setChatApiUrl(apiURL);  // <- 新增 useState 保存 API URL

              // // 4. 显示 Chatbot UI
              // setShowChatbot(true);
            } catch (error) {
              console.error("Failed to start agent:", error);
            }

          // 2. 显示 Chatbot UI
          setShowChatbot((prev) => !prev);


        }}
        id="chatbot-toggler"
      >
        Generate Your Travel Plan!
      </button>

      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">uTravel</h2>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)} className="material-symbols-rounded">
            keyboard_arrow_down
          </button>
        </div>

        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hello 👋 <br /> How can I help you with your travel?
            </p>
          </div>

          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        <div className="chat-footer">
          {/* 这里新增一个按钮，点击切换地图显示 */}
          <button onClick={() => setShowMap((prev) => !prev)} style={{ marginBottom: 10 }}>
            {showMap ? "Hide Map" : "Show Google Map"}
          </button>

          {/* 地图显示区域 */}
          <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            {showMap && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : defaultCenter}
                zoom={12}
              >
                {locations.map((loc) => (
                  <Marker key={loc.id} position={{ lat: loc.lat, lng: loc.lng }} title={loc.name} />
                ))}
                <Polyline
                  path={locations.map((loc) => ({ lat: loc.lat, lng: loc.lng }))}
                  options={{ strokeColor: "#0000FF", strokeWeight: 3 }}
                />
              </GoogleMap>
            )}
          </LoadScript>
          <button onClick={exportLocationsAsJSON} style={{ marginBottom: 10 }}>
            Export Locations as JSON
          </button>

          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;

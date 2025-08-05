import ChatbotIcon from './ChatbotIcon';
import TravelItineraryDisplay from './TravelItineraryDisplay';

const ChatMessage = ({ chat }) => {
  // 判断是否为 AI 模型输出
  const isBot = chat.role === 'model';

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
              <div>
                <TravelItineraryDisplay rawApiResponseText={chat.text} />
              </div>
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

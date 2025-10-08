import { useState, useRef, useEffect } from 'react'
import './ChatInterface.css'

const ChatInterface = ({ 
  chatMessages, 
  chatInput, 
  setChatInput, 
  onSendMessage, 
  onMicClick, 
  isRecording, 
  isLoading,
  responseWithAudio,
  setResponseWithAudio,
  selectedDoctor,
  selectedName,
  selectedSpecialty,
  questions,
  currentQuestion,
  onQuestionSelect
}) => {
  const chatLogRef = useRef(null)

  useEffect(() => {
    if (chatLogRef.current) {
      const chatBox = chatLogRef.current.parentElement
      chatBox.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  const downloadChatLog = () => {
    const chatText = chatMessages.map(msg => 
      `${msg.role === 'user' ? '用戶' : '助手'}: ${msg.text}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-log-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSpecialtyDisplayName = () => {
    const specialty = localStorage.getItem('selectedSpecialty')
    switch(specialty) {
      case 'gdm': return 'GDM: 妊娠糖尿病專家'
      case 'ckd': return 'CKD: 慢性腎臟病專家' 
      case 'ppd': return 'PPD: 產後憂鬱症專家'
      default: return '醫療諮詢專家'
    }
  }

  return (
    <main className="main-content">
      <div className="selected-character">
        <h2>目前選擇的醫事人員</h2>
        <img src={selectedDoctor} alt="選擇的醫生" className="selected-doctor-img" />
        <b>{selectedName}</b>
        <div className="selected-specialty">
          {getSpecialtyDisplayName()}
        </div>
      </div>

      <div className="chat-box">
        <h2>對話紀錄</h2>
        <div className="chat-log" ref={chatLogRef}>
          {chatMessages.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              {message.text}
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot loading">
              ⏳ 處理中...
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        <div className="chat-input-container">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="請輸入訊息..." 
            disabled={isLoading}
          />
          <button 
            onClick={onSendMessage}
            disabled={isLoading || !chatInput.trim()}
            className="send-btn"
          >
            📤 發送
          </button>
          <button 
            onClick={onMicClick}
            className={`mic-btn ${isRecording ? 'recording' : ''}`}
            disabled={isLoading}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
        </div>

        <div className="control-options">
          <label className="audio-option">
            <input 
              type="checkbox" 
              checked={responseWithAudio}
              onChange={(e) => setResponseWithAudio(e.target.checked)}
            />
            Response with audio
          </label>
          
          <button onClick={downloadChatLog} className="download-btn">
            Download ChatLog
          </button>
        </div>

        <div className="suggested-questions">
          <h3>💡 你可以問我：</h3>
          <div className="question-buttons">
            <button 
              className="suggest-btn"
              onClick={() => onQuestionSelect(currentQuestion)}
              disabled={isLoading}
            >
              {currentQuestion}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ChatInterface
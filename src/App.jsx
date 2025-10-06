import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  // Environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  const API_AUTHORIZATION = import.meta.env.VITE_API_AUTHORIZATION
  
  const [sidebarHidden, setSidebarHidden] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState('/static/images/male_doctor.jpg')
  const [selectedRole, setSelectedRole] = useState('doctor')
  const [selectedName, setSelectedName] = useState('藥劑師')
  const [chatMessages, setChatMessages] = useState([
    { role: 'bot', text: '您好！我可以為您提供什麼協助？' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [responseWithAudio, setResponseWithAudio] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('糖尿病是吃太多糖造成的？')

  const chatLogRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const questions = [
    "糖尿病是吃太多糖造成的？",
    "糖尿病患者應該少吃米飯（醣類）、多吃肉（蛋白質）？",
    "糖尿病患者不能吃甜食，若使用代糖就可以？",
    "喝糖尿病專用牛奶或奶粉可以降血糖？",
    "吃芭樂、番茄可以降血糖？",
    "黑糖、蜂蜜及果糖是好糖，不會影響血糖？",
    "喝秋葵水可降血糖？",
    "吃燕麥片可以降血糖？",
    "抗性澱粉比較不會讓血糖升高，應選擇抗性澱粉食物（例如冷飯）？",
    "吃太多糖會得糖尿病？",
    "糖尿病飲食的規矩很多？",
    "碳水化合物對糖尿病不好？",
    "對糖尿病來說，蛋白質比碳水化合物好？",
    "不管吃什麼，都能用藥物來調整？",
    "罹患糖尿病後，得放棄所有的甜點？",
    "人工甜味劑對糖尿病患者很危險？",
    "需要吃特別的糖尿病餐？",
    "減重食物是糖尿病最佳的選擇？",
    "患者的家族史是奶奶和父親都有第2型糖尿病，患者非常擔心自己產後也會從妊娠糖尿病變成第2型糖尿病，怎麼辦？",
    "為了要避免罹患2型糖尿病，患者在飲食上要特別注意什麼？",
    "有第2型糖尿病家族史的妊娠糖尿病患者應該要為此而特殊用藥物來控制血糖嗎？",
    "妊娠糖尿病患者的營養治療目標和一般正常的孕婦在飲食上有什麼要特別注意的地方？",
    "對於這種有家族史的妊娠糖尿病患者營養治療目標如何訂定？",
    "有家族史的妊娠糖尿病患者營養治療目標和沒有家族史的妊娠糖尿病患者的營養治療目標有什麼不同？",
    "從患者目前的飲食型態，應該建議患者做哪些需要具體改變的重點地方？"
  ]

  useEffect(() => {
    const savedDoctor = localStorage.getItem("selectedDoctor")
    const savedRole = localStorage.getItem("selectedRole")
    
    if (savedDoctor && savedRole) {
      setSelectedDoctor(savedDoctor)
      setSelectedRole(savedRole)
      setSelectedName(savedDoctor.includes("/male_doctor") ? "藥劑師" : "營養師")
    } else {
      selectCharacter('/static/images/male_doctor.jpg')
    }
  }, [])

  useEffect(() => {
    if (chatLogRef.current) {
      const chatBox = chatLogRef.current.parentElement
      chatBox.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [chatMessages])

  const selectCharacter = (src) => {
    let role = "unknown"
    let name = ""
    
    if (src.includes("/male_doctor")) {
      role = "doctor"
      name = "藥劑師"
    } else if (src.includes("/female_doctor")) {
      role = "nutritionist"
      name = "營養師"
    }
    
    setSelectedDoctor(src)
    setSelectedRole(role)
    setSelectedName(name)
    localStorage.setItem("selectedDoctor", src)
    localStorage.setItem("selectedRole", role)
    setSidebarHidden(true)
  }

  const appendChatMessage = (role, text) => {
    setChatMessages(prev => [...prev, { role, text }])
  }

  const sendMessage = async () => {
    const text = chatInput.trim()
    
    if (text) {
      setIsLoading(true)
      appendChatMessage("user", text)
      setChatInput("")
      
      const formData = new FormData()
      formData.append("question", text)
      formData.append("role", selectedRole)
      formData.append("responseWithAudio", responseWithAudio)
      
      try {
        const response = await fetch(`${API_BASE_URL}/ask`, {
          method: "POST",
          headers: {
            'Authorization': API_AUTHORIZATION
          },
          body: formData
        })

        const result = await response.json()
        appendChatMessage("bot", result.answer)
        
        if ("audio_base64" in result) {
          playRemoteMP3(result.audio_base64)
        }
      } catch (error) {
        appendChatMessage("bot", "❌ 錯誤：無法取得回應")
      }
      
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const formData = new FormData()
        formData.append("audio", audioBlob, "recording.wav")

        try {
          const response = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            headers: {
              'Authorization': API_AUTHORIZATION
            },
            body: formData
          })

          const result = await response.text()
          setChatInput(result)
        } catch (error) {
          appendChatMessage("bot", "❌ 錯誤：無法辨識音訊")
        }
        
        setIsLoading(false)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleMicClick = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const playRemoteMP3 = (audioBase64) => {
    const audioBlob = new Blob([new Uint8Array(atob(audioBase64).split('').map(char => char.charCodeAt(0)))], { type: 'audio/mp3' })
    const audioURL = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioURL)
    audio.play()
  }

  const changeQuestions = () => {
    const filtered = questions.filter(q => q.trim() !== currentQuestion.trim())
    if (filtered.length === 0) return
    
    const newQuestion = filtered[Math.floor(Math.random() * filtered.length)]
    setCurrentQuestion(newQuestion)
  }

  const handleSuggestClick = () => {
    setChatInput(currentQuestion)
    sendMessage()
    changeQuestions()
  }

  const downloadChatLog = () => {
    const messages = chatMessages
      .map(msg => {
        const role = msg.role === "bot" ? "Bot" : "User"
        return `${role}: ${msg.text}`
      })
      .join("\n")

    const blob = new Blob([messages], { type: "text/plain" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "chatlog.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="container">
      <button 
        id="toggleSidebarBtn" 
        className="toggle-sidebar"
        onClick={() => setSidebarHidden(!sidebarHidden)}
      >
        選擇諮商人員
      </button>

      <aside className={`sidebar ${sidebarHidden ? 'hidden' : ''}`}>
        <h2>選擇要諮商的虛擬醫事人員</h2>
        <div className="character-list">
          <img 
            src="/static/images/male_doctor.jpg" 
            alt="醫生 1" 
            className="thumbnail" 
            onClick={() => selectCharacter('/static/images/male_doctor.jpg')}
          />
          <b>藥劑師</b>
          <img 
            src="/static/images/female_doctor.jpg" 
            alt="醫生 2" 
            className="thumbnail" 
            onClick={() => selectCharacter('/static/images/female_doctor.jpg')}
          />
          <b>營養師</b>
        </div>
      </aside>

      <main className="main-content">
        <div className="selected-character">
          <h2>目前選擇的醫事人員</h2>
          <img id="selectedImg" src={selectedDoctor} alt="選擇的醫生" />
          <b id="selectedName">{selectedName}</b>
        </div>

        <div className="chat-box">
          <h2>對話紀錄</h2>
          <div id="chatLog" className="chat-log" ref={chatLogRef}>
            {chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.role}`}>
                {message.text}
              </div>
            ))}
          </div>
        </div>

        <div className="controls">
          <div className="chat-input-container">
            <input 
              type="text" 
              id="chatInput" 
              placeholder="請輸入訊息..." 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button id="sendBtn" onClick={sendMessage}>📤 發送</button>
            <button id="micBtn" onClick={handleMicClick}>
              {isRecording ? '🛑' : '🎤'}
            </button>
          </div>
          
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <label style={{display: 'flex', alignItems: 'center'}}>
              <input 
                type="checkbox" 
                id="responseWithAudio" 
                style={{marginRight: '0.4rem'}}
                checked={responseWithAudio}
                onChange={(e) => setResponseWithAudio(e.target.checked)}
              />
              Response with audio
            </label>
          
            <button id="downloadBtn" onClick={downloadChatLog}>
              Download ChatLog
            </button>
          </div>
          
          <div id="suggestedQuestions" style={{marginTop: '20px'}}>
            <h3>💡 你可以問我：</h3>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
              <button className="suggest-btn" onClick={handleSuggestClick}>
                {currentQuestion}
              </button>
            </div>
          </div>
        </div>
      </main>

      {isLoading && (
        <div 
          id="loadingDialog" 
          style={{
            display: 'flex',
            position: 'fixed',
            top: 0, 
            left: 0,
            width: '100%', 
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem',
            color: 'white',
            fontWeight: 'bold'
          }}
        >
          ⏳ Processing...
        </div>
      )}
    </div>
  )
}

export default App

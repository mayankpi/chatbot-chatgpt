import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from '@chatscope/chat-ui-kit-react'

const CHATGPT_API_KEY = import.meta.env.VITE_CHATGPT_API_KEY

function App() {
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    {
      message: "Hello",
      sender: "ChatGPT"
    }
  ])

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }
    const newMessages = [...messages, newMessage]
    setMessages(newMessages);

    setTyping(true)

    await processMessageToChatGPT(newMessages)
  }

  async function processMessageToChatGPT(chatMessages) {
    // chatMessages {message: "Hello", sender: "ChatGPT" or "user"}
    // apiMessage {content: "Hello", roke: "assistant" or "user", direction: "incoming" or "outgoing"}

    // role :"user" -> a message from the user, "assistant" -> a message from the chatGPT
    // role: "system" -> generally one initial message defining HOW we want chatgpt to talk

    const systemMessage = {
      role: "system",
      content: "Explain all concepts in a detailed way."
    }

    let apiMessages = chatMessages.map((chatMessage) => {
        let role = ""
        if (chatMessage.sender === "ChatGPT") {
          role = "assistant"
        } else {
          role = "user"
        }
        return {role: role, content: chatMessage.message}
      })
      const apiRequestBody = {
        "model": "gpt-3.5-turbo",
        "messages": [ systemMessage, ...apiMessages ]
      }
      console.log("apiRequestBody>> ", JSON.stringify(apiRequestBody))
      await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHATGPT_API_KEY}`,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data)
        console.log(data.choices[0].message.content)
        setMessages([
          ...chatMessages, {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          }
        ])
        setTyping(false)
      })
  }
  return (
      <div className='App'>
        <div style={{position: "relative", height: "800px", width: "700px"}}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior='smooth'
                typingIndicator={typing ? <TypingIndicator content='ChatGPT is typing...' /> : null}
              >
                {messages.map((message, i) => {
                  return <Message key={i} model={message} />
                  })}
              </MessageList>
              <MessageInput placeholder='Type Message Here' onSend={handleSend} />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
  )
}

export default App

import "./App.css";
import Chat from "./components/Chat";
import TmChat from "tm-chat";
import moment from "moment";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shopSlug, setShopSlug] = useState("");

  // chat
  const [uuid, setUUID] = useState(window.localStorage.getItem('uuid'));
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [chat, setChat] = useState(new TmChat({
    url: "http://localhost:5678",
    uuid: uuid,
    saver: window
  }));
  useEffect(() => {
    setChat(new TmChat({
      url: "http://localhost:5678",
      uuid: uuid,
      saver: window
    }))
  }, [])



  function initChat(id) {
    console.log("initChat", chat.socketId);
    chat
      .initChat({
        socket_id: chat.socketId,
        username: username,
        password: password,
        shop_slug: shopSlug,
        phone_number: phone,
        email: email,
        firstname: firstName,
        lastname: lastName,
        uuid: uuid
      })
      .then((result) => {
        setConnected(true);
        setUUID(result.body.user.uuid);
        window.localStorage.setItem('uuid', result.body.user.uuid);
        console.log(chat.user.image)
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    setUUID(window.localStorage.getItem('uuid'));
  }, [])

  function startChat() {
    chat.connect({
      onConnect: (id) => {
        initChat(id);
      },
      onDisconnect: (id) => {
      },
      onNewMessage: (args) => {
        console.log("onNewMessage", messages, args);
        setMessages([...chat.chats, args]);
      },
      onChatRoomCreated: (room) => {
        if (room !== null) {
          console.log("onChatRoomCreated", room);
          setRooms([room, ...chat.rooms]);
        } else {
          setRooms([...chat.rooms]);
        }
      },
      onMarkAsRead: (ids) => {
        console.log("onMarkAsRead", ids);
      },
      onInviteToRoom: (args) => {
        console.log("onInviteToRoom", args);
      }
    });
  }

  function onSendClick(msg) {
    if (activeRoom !== null) {
      chat.sendMessageToRoom(activeRoom, msg, window.location.pathname)
        .then(response => {
          console.log('sent message', response);
        })
        .catch(err => {
          console.log('error sending message', err);
          // alert(err);
        })
    } else {
      chat.sendMessage(msg, window.location.pathname)
        .then(response => {
          console.log('sent message', response);
        })
        .catch(err => {
          console.log('error sending message', err);
          // alert(err);
        })
    }
  }

  function onFileSelected(file) {
    if (activeRoom !== null) {
      chat.sendImageToRoom(activeRoom, file, window.location.pathname)
        .then(response => {
          console.log('sent image message', response);
        })
        .catch(err => {
          alert(err);
        })
    } else {
      chat.sendImageMessage(file, window.location.pathname)
        .then(response => {
          console.log('sent image message', response);
        })
        .catch(err => {
          alert(err);
        })
    }

  }

  function onEnter(event) {
    console.log(event)
    if (event.key === 'Enter') {
      onSendClick(message);
    }
  }

  function checkNUll(value, key) {
    try {
      return value[key];
    } catch (err) {
      return "";
    }
  }

  useEffect(() => {
    chat.getChatRoomMessages(activeRoom)
      .then(response => {
        setMessages(response);
      })
  }, [activeRoom])
  return (
    <div>
      {
        connected ?
          <div className="chat-container">
            <div id="rooms">
              <h3 style={{ padding: '12px' }}>Chat rooms</h3>
              {
                rooms.map((room, i) => {
                  return (
                    <div className="room-item" key={`room-${i}`} onClick={() => setActiveRoom(room.uuid)}>
                      <img src={`data:image/svg+xml;utf8,${checkNUll(room, 'image')}`} alt="room" />
                      <h4>{checkNUll(room, 'title')}</h4>
                      <label className="badge">{messages.filter(it => it.chat_room_uuid === room.uuid).length}</label>
                    </div>
                  )
                })
              }
            </div>
            <div id="chat-content">
              <div id="chats">
                {
                  messages.filter(it => it.chat_room_uuid === activeRoom).map((item, i) => {
                    return (
                      <div className={item.user_id == chat.user.id ? "message-row-left" : "message-row-right"} key={`msg-${i}`}>
                        <div className="chat-item">
                          <div className="info">
                            <img src={`data:image/svg+xml;utf8,${item.avatar}`} />
                            <p>{moment(item.created_at).format('DD:MM:YYYY HH:mm')}</p>
                          </div>
                          <div className="message">
                            {
                              item.mime_type === 'plaintext/*' ?
                                <label>{item.message}</label>
                                :
                                <img src={chat.getImageFullUrl(item.message)} alt={item.message} />
                            }
                            <p className="username">{item.username}</p>
                          </div>

                        </div>
                      </div>
                    )
                  })
                }
              </div>
              <div className="chat-input">
                <label htmlFor="file-input">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5zm-1 13h-2v-2h2v2zm0-4h-2v-6h2v6z" />
                  </svg>
                  <span>Attach Image</span>
                </label>
                <input type="file" onChange={e => onFileSelected(e.target.files[0])} id="file-input" accept="image/*" />
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={onEnter} placeholder="Type your message..." />
              </div>
            </div>
          </div>
          :
          <Stack spacing={2} sx={{ width: '100%', p: 2 }} direction={'column'} alignItems={'center'}>
            <TextField label={"First name"} value={firstName} onChange={e => setFirstName(e.target.value)} />
            <TextField label={"Last name"} value={lastName} onChange={e => setLastName(e.target.value)} />
            <TextField label={"Username"} value={username} onChange={e => setUsername(e.target.value)} />
            <TextField label={"Password"} value={password} onChange={e => setPassword(e.target.value)} />
            <TextField label={"Email"} value={email} onChange={e => setEmail(e.target.value)} />
            <TextField label={"Phone"} value={phone} onChange={e => setPhone(e.target.value)} />
            <TextField label={"Shop slug"} value={shopSlug} onChange={e => setShopSlug(e.target.value)} />
            <TextField label={"UUID"} value={uuid} onChange={e => setUUID(e.target.value)} />
            <Button variant="contained" onClick={() => startChat()}>Start chat</Button>
          </Stack>
      }


    </div>
  );
}

export default App;

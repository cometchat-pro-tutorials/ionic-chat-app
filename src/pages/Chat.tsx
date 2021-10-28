import React, { useState, useEffect, useContext, useRef } from 'react';

import { IonToolbar, IonHeader, IonButtons, IonBackButton, IonButton, IonIcon, IonActionSheet } from '@ionic/react';
import { Chooser } from '@ionic-native/chooser'
import { ImagePicker } from '@ionic-native/image-picker';
import { settings, callOutline, videocamOutline } from 'ionicons/icons'

import { useHistory } from 'react-router';
import { v4 as uuidv4 } from "uuid";

import Message from '../components/Message';

import Context from '../context';

import imageIcon from '../images/image.png';

const Chat: React.FC = () => {
  const history = useHistory();

  const { cometChat, user, selectedConversation, setCallType } = useContext(Context);

  const [messages, setMessages] = useState<any>([]);
  const [isUserOnline, setIsUserOnline] = useState<any>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isActionSheetShown, setIsActionSheetShown] = useState<any>(false);

  const messageRef = useRef<any>(null);
  const messageBottomRef = useRef<any>(null);
  const userOnlineListenerId = useRef<any>(uuidv4());
  const typingRef = useRef<any>(null);

  useEffect(() => {
    if (selectedConversation) {
      initUserOnlineStatus(selectedConversation.status);
      // get list of messages.
      getMessages();
      // listen for messages.
      listenForMessages();
      if (selectedConversation.contactType === 0) {
        // listen for online/offline user.
        listenForOnlineUsers();
      }
    }
    return () => {
      if (selectedConversation) {
        cometChat.removeMessageListener(selectedConversation.uid);
        if (selectedConversation.contactType === 0) {
          cometChat.removeUserListener(userOnlineListenerId);
        }
        setMessages(() => []);
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (messages && messages.length !== 0) {
      // scroll to bottom.
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (selectedFile) {
      sendMediaMessage();
    }
  }, [selectedFile]);

  const scrollToBottom = () => {
    if (messageBottomRef && messageBottomRef.current) {
      messageBottomRef.current.parentNode.scrollTop = messageBottomRef.current.offsetTop;
    }
  }

  const updateDeliveredAt = (messageReceipt: any) => {
    setMessages((prevMessages: any) => {
      return prevMessages.map((message: any) => {
        if (!message.deliveredAt && messageReceipt.sender.uid === selectedConversation.uid) {
          message.deliveredAt = messageReceipt.deliveredAt;
          return message;
        }
        return message;
      });
    })
  }

  const updateReadAt = (messageReceipt: any) => {
    setMessages((prevMessages: any) => {
      return prevMessages.map((message: any) => {
        if (!message.readAt && messageReceipt.sender.uid === selectedConversation.uid) {
          message.readAt = messageReceipt.readAt;
          return message;
        }
        return message;
      });
    })
  }

  const initUserOnlineStatus = (status: any) => {
    if (!status) {
      setIsUserOnline(null);
      return;
    }
    if (status === 'online') {
      setIsUserOnline(true);
      return;
    }
    setIsUserOnline(false);
  }

  const isTypingStatusChanged = (typingIndicator: any) => {
    if (typingIndicator.receiverType === 'user' && typingIndicator.sender.uid === selectedConversation.uid) {
      return true;
    }
    if (typingIndicator.receiverType === 'group' && typingIndicator.receiverId === selectedConversation.guid) {
      return true;
    }
    return false;
  }

  const shouldRenderMessage = (message: any) => {
    if (message.receiverType === 'user' && message.sender.uid === selectedConversation.uid) {
      return true;
    }
    if (message.receiverType === 'group' && message.receiverId === selectedConversation.guid) {
      return true;
    }
    return false;
  }

  const listenForMessages = () => {
    cometChat.addMessageListener(
      selectedConversation.uid,
      new cometChat.MessageListener({
        onTextMessageReceived: (message: any) => {
          if (shouldRenderMessage(message)) {
            // set state.
            setMessages((prevMessages: any) => [...prevMessages, message]);
            sendReadBulkReceipts([message]);
            scrollToBottom();
          }
        },
        onMediaMessageReceived: (mediaMessage: any) => {
          // Handle media message
          if (shouldRenderMessage(mediaMessage)) {
            const messageContent = getContentMessage(mediaMessage);
            setMessages((prevMessages: any) => [...prevMessages, {
              id: mediaMessage.id,
              text: messageContent,
              receiverId: mediaMessage.receiverId,
              sender: {
                uid: mediaMessage.sender.uid,
                avatar: mediaMessage.sender.avatar ? mediaMessage.sender.avatar : user.avatar
              },
              type: mediaMessage.type,
              deliveredAt: mediaMessage.deliveredAt,
              readAt: mediaMessage.readAt
            }]);
            sendReadBulkReceipts([mediaMessage]);
            scrollToBottom();
          }
        },
        onTypingStarted: (typingIndicator: any) => {
          if (isTypingStatusChanged(typingIndicator)) {
            typingRef.current.classList.remove('hide');
            typingRef.current.classList.add('show');
            typingRef.current.innerHTML = `${typingIndicator.sender.name} is typing...`;
          }
        },
        onTypingEnded: (typingIndicator: any) => {
          if (isTypingStatusChanged(typingIndicator)) {
            typingRef.current.classList.remove('show');
            typingRef.current.classList.add('hide');
          }
        },
        onMessagesDelivered: (messageReceipt: any) => {
          if (selectedConversation.contactType === 0) {
            updateDeliveredAt(messageReceipt);
          }
        },
        onMessagesRead: (messageReceipt: any) => {
          if (selectedConversation.contactType === 0) {
            updateReadAt(messageReceipt);
          }
        }
      })
    );
  }

  const listenForOnlineUsers = () => {
    cometChat.addUserListener(
      userOnlineListenerId,
      new cometChat.UserListener({
        onUserOnline: (onlineUser: any) => {
          if (onlineUser && onlineUser.uid === selectedConversation.uid) {
            setIsUserOnline(() => true);
          }
        },
        onUserOffline: (offlineUser: any) => {
          if (offlineUser && offlineUser.uid === selectedConversation.uid) {
            setIsUserOnline(() => false);
          }
        }
      })
    );
  };

  const getContentMessage = (message: any) => {
    if (message) {
      return message.text ? message.text : message.data && message.data.url ? message.data.url : null;
    }
    return null;
  };

  const transformMessages = (messages: any) => {
    if (messages && messages.length !== 0) {
      const transformedMessages = [];
      for (const message of messages) {
        const messageContent = getContentMessage(message);
        if (messageContent) {
          transformedMessages.push({
            id: message.id,
            text: messageContent,
            receiverId: message.receiverId,
            sender: {
              uid: message.sender.uid,
              avatar: message.sender.avatar ? message.sender.avatar : user.avatar
            },
            type: message.type,
            deliveredAt: message.deliveredAt,
            readAt: message.readAt
          });
        }
      }
      return transformedMessages;
    }
    return messages;
  };

  const getReceiverIdForMarkingAsRead = (message: any) => {
    if (message.receiverType === cometChat.RECEIVER_TYPE.USER) {
      return message.sender.uid;
    }
    return message.receiverId;
  };

  const sendReadBulkReceipts = (messages: any) => {
    if (messages && messages.length !== 0) {
      // get the last message.
      const lastMessage = messages[messages.length - 1];
      const receiverId = getReceiverIdForMarkingAsRead(lastMessage);
      cometChat.markAsRead(lastMessage.id, receiverId, lastMessage.receiverType, lastMessage.sender.uid).then();
    }
  };

  const getMessages = () => {
    const limit = 50;
    const messageRequestBuilder = new cometChat.MessagesRequestBuilder()
      .setCategories(["message"])
      .setLimit(limit)
    if (selectedConversation.contactType === 1) {
      messageRequestBuilder.setGUID(selectedConversation.guid);
    } else if (selectedConversation.contactType === 0) {
      messageRequestBuilder.setUID(selectedConversation.uid);
    }

    const messagesRequest = messageRequestBuilder.build();

    messagesRequest
      .fetchPrevious()
      .then((messages: any) => {
        setMessages(() => transformMessages(messages));
        sendReadBulkReceipts(messages);
        scrollToBottom();
      })
      .catch((error: any) => { });
  }

  const getReceiverId = () => {
    if (selectedConversation && selectedConversation.guid) {
      return selectedConversation.guid;
    }
    if (selectedConversation && selectedConversation.uid) {
      return selectedConversation.uid;
    }
    return null;
  };

  const getReceiverType = () => {
    if (selectedConversation && selectedConversation.guid) {
      return cometChat.RECEIVER_TYPE.GROUP;
    }
    return cometChat.RECEIVER_TYPE.USER;
  };

  const sendMediaMessage = () => {
    const receiverId = getReceiverId();
    const receiverType = getReceiverType();
    let messageType = cometChat.MESSAGE_TYPE.IMAGE;
    if (selectedFile.type.split('/')[0] === 'image') {
      messageType = cometChat.MESSAGE_TYPE.IMAGE;
    } else if (selectedFile.type.split('/')[0] === 'video') {
      messageType = cometChat.MESSAGE_TYPE.VIDEO;
    } else {
      messageType = cometChat.MESSAGE_TYPE.FILE;
    }
    const mediaMessage = new cometChat.MediaMessage(receiverId, selectedFile.file, messageType, receiverType);
    cometChat.sendMessage(mediaMessage).then((message: any) => {
      // append the new message to "messages" state.
      setMessages((prevMessages: any) => [...prevMessages, {
        id: uuidv4(),
        text: message.data.url,
        sender: {
          uid: user.uid,
          avatar: user.avatar
        },
        isRight: true,
        type: message.type
      }]);
      // scroll to bottom.
      scrollToBottom();
    }, (error: any) => {
    }
    );
  };

  const sendMessage = (e: any, shouldSendMessage = false) => {
    if (e.key === 'Enter' || shouldSendMessage) {
      // get the value from input.
      const message = messageRef.current.value;
      // reset input box.
      messageRef.current.value = '';
      if (message) {
        // call cometchat api to send the message.
        const textMessage = new cometChat.TextMessage(
          selectedConversation.contactType === 0 ? selectedConversation.uid : selectedConversation.guid,
          message,
          selectedConversation.contactType === 0 ? cometChat.RECEIVER_TYPE.USER : cometChat.RECEIVER_TYPE.GROUP
        );

        cometChat.sendMessage(textMessage).then(
          (msg: any) => {
            // append the new message to "messages" state.
            setMessages((prevMessages: any) => [...prevMessages, {
              id: uuidv4(),
              text: message,
              receiverId: getReceiverId(),
              sender: {
                uid: user.uid,
                avatar: user.avatar
              },
              isRight: true
            }]);
            // scroll to bottom.
            scrollToBottom();
            // send end typing notification.
            sendEndTypingNotification();
          },
          (error: any) => {
            alert('Cannot send you message, please try later');
          }
        );
      }
    }
  }

  const isRight = (message: any) => {
    if (message.isRight !== null && message.isRight !== undefined) {
      return message.isRight;
    }
    return message.sender.uid === user.uid;
  }

  const goToManageGroup = () => {
    history.push('/manage-group');
  };

  if (!selectedConversation) {
    history.push('/');
  }

  const dataURItoBlob = (dataURI: any) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const bb = new Blob([ab], { type: mimeString });
    return bb;
  }

  const selectDocument = () => {
    Chooser.getFile('all')
      .then((response: any) => {
        const blob_nw = dataURItoBlob(response.dataURI);

        const file = {
          file: blob_nw,
          type: response.mediaType,
          name: response.name
        };
        setSelectedFile(() => file);
      })
      .catch((error: any) => console.error(error));
  };

  const selectImage = () => {
    const options = {
      outputType: 1
    };
    ImagePicker.getPictures(options)
      .then((results: any) => {
        results[0] = 'data:image/jpeg;base64,' + results[0];
        const blob_nw = dataURItoBlob(results[0]);
        const date = new Date();
        const file = {
          file: blob_nw,
          type: 'image/jpeg',
          name: 'temp_img' + date.getTime()
        };
        setSelectedFile(() => file);
      }, (err) => {
      });
  };

  const toggleActionsSheet = (isActionsSheetShown: any) => () => {
    setIsActionSheetShown(() => isActionsSheetShown);
  }

  const sendEndTypingNotification = () => {
    const receiverId = getReceiverId();
    const receiverType = getReceiverType();

    const typingNotification = new cometChat.TypingIndicator(receiverId, receiverType);
    cometChat.endTyping(typingNotification);
  };

  const onInputBlured = () => {
    sendEndTypingNotification();
  };

  const sendStartTypingNotification = () => {
    const receiverId = getReceiverId();
    const receiverType = getReceiverType();

    const typingNotification = new cometChat.TypingIndicator(receiverId, receiverType);
    cometChat.startTyping(typingNotification);
  };

  const onInputChanged = (e: any) => {
    sendStartTypingNotification();
  };

  const startAudioCall = () => {
    if (cometChat && selectedConversation) {
      setCallType(cometChat.CALL_TYPE.AUDIO);
    }
  };

  const startVideoCall = () => {
    if (cometChat && selectedConversation) {
      setCallType(cometChat.CALL_TYPE.VIDEO);
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={startAudioCall}>
              <IonIcon slot="icon-only" icon={callOutline} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={startVideoCall}>
              <IonIcon slot="icon-only" icon={videocamOutline} />
            </IonButton>
          </IonButtons>
          {selectedConversation && selectedConversation.contactType === 1 && <IonButtons slot="end">
            <IonButton onClick={goToManageGroup} >
              <IonIcon slot="icon-only" icon={settings} />
            </IonButton>
          </IonButtons>}
          <div className='chatbox__title'>
            <div className='chatbox__title-avatar-container'>
              <img src={selectedConversation?.avatar ? selectedConversation?.avatar : selectedConversation?.icon ? selectedConversation?.icon : ''} alt={selectedConversation?.name} />
              {selectedConversation && selectedConversation.contactType === 0 && <span className={`chatbox__title-status ${isUserOnline ? 'chatbox__title-status--online' : 'chatbox__title-status--offline'}`}></span>}
            </div>
            <span>{selectedConversation?.name}</span>
          </div>
        </IonToolbar>
      </IonHeader>
      <div className="chatbox">
        <div className="message__container">
          {messages && messages.length !== 0 && messages.map((message: any) => (
            <Message key={message.id} message={message.text} messageType={message.type} deliveredAt={message.deliveredAt} readAt={message.readAt} senderId={message.sender.uid} avatar={message.sender.avatar} isRight={isRight(message)} />
          ))}
          <div ref={messageBottomRef} id="message-bottom"></div>
        </div>
        <div className="chatbox__input">
          <span ref={typingRef} className='hide'>Someone is typing...</span>
          <div>
            <img src={imageIcon} alt='file-chooser' className='chatbox__file-chooser' onClick={toggleActionsSheet(true)} />
            <input type="url" placeholder="Message..." onKeyDown={sendMessage} ref={messageRef} onChange={onInputChanged} onBlur={onInputBlured} />
            <svg onClick={(e) => sendMessage(e, true)} fill="#2563EB" className="crt8y2ji" width="20px" height="20px" viewBox="0 0 24 24"><path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.8132856,11.0605983 22.3423792,10.4322088 21.714504,10.118014 L4.13399899,1.16346272 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.8376543,3.0486314 1.15159189,3.99121575 L3.03521743,10.4322088 C3.03521743,10.5893061 3.34915502,10.7464035 3.50612381,10.7464035 L16.6915026,11.5318905 C16.6915026,11.5318905 17.1624089,11.5318905 17.1624089,12.0031827 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" fillRule="evenodd" stroke="none"></path></svg>
          </div>
        </div>
      </div>
      <IonActionSheet
        isOpen={isActionSheetShown}
        onDidDismiss={toggleActionsSheet(false)}
        buttons={[{
          text: 'Select Image',
          handler: () => {
            selectImage();
          }
        }, {
          text: 'Select Document',
          handler: () => {
            selectDocument();
          }
        }]}
      >
      </IonActionSheet>
    </>
  );
};

export default Chat;
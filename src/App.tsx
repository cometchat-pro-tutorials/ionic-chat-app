import React, { useState, useEffect, useRef } from 'react';
import { Route } from 'react-router-dom';
import { IonLoading, IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AndroidPermissions } from '@ionic-native/android-permissions'
import { v4 as uuidv4 } from "uuid";

import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chat from './pages/Chat';
import CreateGroup from './pages/CreateGroup';
import ManageGroup from './pages/ManageGroup';
import AddGroupMembers from './pages/AddGroupMembers';
import RemoveGroupMembers from './pages/RemoveGroupMembers';

import PrivateRoute from './components/PrivateRoute';

import Context from './context';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './theme/App.css';

const App: React.FC<any> = () => {
  const callListenerId = useRef(uuidv4());
  const groupListenerId = useRef(uuidv4());

  const [isLoading, setIsLoading] = useState(false);
  const [cometChat, setCometChat] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const [callType, setCallType] = useState<any>(null);
  const [callSettings, setCallSettings] = useState<any>(null);
  const [call, setCall] = useState<any>(null);
  const [isSomeoneCalling, setIsSomeoneCalling] = useState<any>(false);

  useEffect(() => {
    initCometChat();
    initAuthenticatedUser();
    getPermissions();
    return () => {
      setCallType(null);
      setCall(null);
      setCallSettings(null);
      setIsSomeoneCalling(false);
      if (cometChat) {
        cometChat.removeCallListener(callListenerId);
        cometChat.removeGroupListener(groupListenerId);
      }
    }
  }, []);

  useEffect(() => {
    if (cometChat) {
      listenForCall();
      listenForGroupChanges();
    }
  }, [cometChat]);

  useEffect(() => {
    if (callType && selectedConversation) {
      initialCall();
    }
  }, [callType]);

  useEffect(() => {
    if (callSettings) {
      console.log('call settings: ');
      console.log(callSettings);
      cometChat.startCall(callSettings);
    }
  }, [callSettings]);

  const listenForGroupChanges = () => {
    cometChat.addGroupListener(
      groupListenerId,
      new cometChat.GroupListener({
        onMemberAddedToGroup: (message: any, userAdded: any, userAddedBy: any, userAddedIn: any) => {
          alert(`${userAdded.name} was added to ${userAddedIn.name} by ${userAddedBy.name}`);
        },
        onGroupMemberKicked: (message: any, kickedUser: any, kickedBy: any, kickedFrom: any) => {
          alert(`${kickedUser.name} was removed from ${kickedFrom.name}`);
        },
        onGroupMemberLeft: (message: any, leavingUser: any, group: any) => {
          alert(`${leavingUser.name} has left the group ${group.name}`);
        },
        onGroupMemberJoined: (message: any, joinedUser: any, joinedGroup: any) => {
          alert(`${joinedUser.name} has joined the group ${joinedGroup.name}`);
        }
      })
    );
  };

  const rejectCall = (status: any, call: any) => {
    if (status && call) {
      cometChat.rejectCall(call.sessionId, status).then(
        (call: any) => {
          console.log("Call rejected successfully", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(false);
        },
        (error: any) => {
          console.log("Call rejection failed with error:", error);
        }
      );
    }
  };

  const startCall = (call: any) => {
    const sessionId = call.sessionId;
    const callType = call.type;
    const callListener = new cometChat.OngoingCallListener({
      onUserJoined: (user: any) => {
        /* Notification received here if another user joins the call. */
        console.log("User joined call:", user);
        /* this method can be use to display message or perform any actions if someone joining the call */
      },
      onUserLeft: (user: any) => {
        /* Notification received here if another user left the call. */
        console.log("User left call:", user);
        /* this method can be use to display message or perform any actions if someone leaving the call */
      },
      onUserListUpdated: (userList: any) => {
        console.log("user list:", userList);
      },
      onCallEnded: (call: any) => {
        /* Notification received here if current ongoing call is ended. */
        console.log("Call ended:", call);
        /* hiding/closing the call screen can be done here. */
        const status = cometChat.CALL_STATUS.CANCELLED;
        rejectCall(status, call.sessionId);
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onError: (error: any) => {
        console.log("Error :", error);
        /* hiding/closing the call screen can be done here. */
        setCallSettings(null);
        setCallType(null);
        setCall(null);
        setIsSomeoneCalling(false);
      },
      onAudioModesUpdated: (audioModes: any) => {
        console.log("audio modes:", audioModes);
      },
    });
    const callSettings = new cometChat.CallSettingsBuilder()
      .setSessionID(sessionId)
      .enableDefaultLayout(true)
      .setIsAudioOnlyCall(callType == cometChat.CALL_TYPE.AUDIO ? true : false)
      .setCallEventListener(callListener)
      .build();
    setCallSettings(() => callSettings);
  };

  const acceptCall = (call: any) => {
    if (call) {
      cometChat.acceptCall(call.sessionId).then(
        (call: any) => {
          console.log("Call accepted successfully:", call);
          // start the call using the startCall() method
          startCall(call);
          setIsSomeoneCalling(false);
        },
        (error: any) => {
          console.log("Call acceptance failed with error", error);
          // handle exception
        }
      );
    }
  };

  const confirmCall = (call: any) => {
    if (call) {
      setIsSomeoneCalling(true);
    }
  };

  const listenForCall = () => {
    cometChat.addCallListener(
      callListenerId,
      new cometChat.CallListener({
        onIncomingCallReceived(call: any) {
          console.log("Incoming call:", call);
          const callInitiatorUid = call.callInitiator.uid;
          const authenticatedUser: any = localStorage.getItem('auth');
          const parsedAuthenticatedUser = JSON.parse(authenticatedUser);
          if (callInitiatorUid && callInitiatorUid !== parsedAuthenticatedUser.uid) {
            setCall(call);
            confirmCall(call);
          }
        },
        onOutgoingCallAccepted(call: any) {
          console.log("Outgoing call accepted:", call);
          startCall(call);
        },
        onOutgoingCallRejected(call: any) {
          console.log("Outgoing call rejected:", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(null);
        },
        onIncomingCallCancelled(call: any) {
          console.log("Incoming call calcelled:", call);
          setCallSettings(null);
          setCallType(null);
          setCall(null);
          setIsSomeoneCalling(null);
        }
      })
    );
  };

  const isGroup = () => {
    return selectedConversation && selectedConversation.guid;
  };

  const initialCall = () => {
    const receiverID = isGroup() ? selectedConversation.guid : selectedConversation.uid;
    const receiverType = isGroup() ? cometChat.RECEIVER_TYPE.GROUP : cometChat.RECEIVER_TYPE.USER;

    const call = new cometChat.Call(receiverID, callType, receiverType);

    cometChat.initiateCall(call).then(
      (outGoingCall: any) => {
        console.log("Call initiated successfully:", outGoingCall);
        setCall(outGoingCall);
        // perform action on success. Like show your calling screen.
      },
      (error: any) => {
        console.log("Call initialization failed with exception:", error);
      }
    );
  };

  const cancelCall = () => {
    const status = cometChat.CALL_STATUS.CANCELLED;
    rejectCall(status, call);
  };

  const handleRejectCall = () => {
    const status = cometChat.CALL_STATUS.REJECTED;
    rejectCall(status, call);
  };

  const handleAcceptCall = () => {
    acceptCall(call);
  };

  const initCometChat = async () => {
    const { CometChat } = await import('@cometchat-pro/cordova-ionic-chat');
    const appID = `${process.env.REACT_APP_COMETCHAT_APP_ID}`;
    const region = `${process.env.REACT_APP_COMETCHAT_REGION}`;
    const appSetting = new CometChat.AppSettingsBuilder().subscribePresenceForAllUsers().setRegion(region).build();
    CometChat.init(appID, appSetting).then(
      () => {
        console.log('CometChat was initialized successfully');
        setCometChat(() => CometChat);
      },
      error => {
      }
    );
  };

  const initAuthenticatedUser = async () => {
    const authenticatedUser = await localStorage.getItem('auth');
    setUser(() => authenticatedUser ? JSON.parse(authenticatedUser) : null);
  };

  const getPermissions = () => {
    AndroidPermissions.requestPermissions([AndroidPermissions.PERMISSION.CAMERA, AndroidPermissions.PERMISSION.RECORD_AUDIO, AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE, AndroidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);
  };

  if (callType && selectedConversation && !callSettings) {
    return (
      <div className='calling__container'>
        <p>Calling {selectedConversation?.name}...</p>
        <div>
          <img src={selectedConversation?.avatar} />
        </div>
        <div className='calling__cancel-btn' onClick={cancelCall}>Cancel Call</div>
      </div>
    );
  }

  if (isSomeoneCalling) {
    return (
      <div className='calling__container'>
        <p>You are having a call from {call?.sender.name}</p>
        <div>
          <img src={call?.sender.avatar} />
        </div>
        <div className='calling__accept-btn' onClick={handleAcceptCall}>Accept Call</div>
        <div className='calling__cancel-btn' onClick={handleRejectCall}>Reject Call</div>
      </div>
    );
  }

  return (
    <Context.Provider value={{ cometChat, user, setUser, isLoading, setIsLoading, selectedConversation, setSelectedConversation, setCallType }}>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            <PrivateRoute exact path="/" component={Home} />
            <PrivateRoute exact path="/chat" component={Chat} />
            <PrivateRoute exact path="/create-group" component={CreateGroup} />
            <PrivateRoute exact path="/manage-group" component={ManageGroup} />
            <PrivateRoute exact path="/add-group-members" component={AddGroupMembers} />
            <PrivateRoute exact path="/remove-group-members" component={RemoveGroupMembers} />
            {/* Login Route */}
            <Route exact path="/login" component={Login} />
            {/* End Login Route */}
            {/* Sign Up Route */}
            <Route exact path="/signup" component={SignUp} />
            {/* End Sign Up Route */}
          </IonRouterOutlet>
        </IonReactRouter>
        <IonLoading
          isOpen={isLoading}
          message={'Please wait...'}
        />
      </IonApp>
    </Context.Provider>
  );
};

export default App;

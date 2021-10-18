import React, { useRef, useContext } from 'react';

import { IonToolbar, IonTitle, IonHeader, IonButtons, IonBackButton } from '@ionic/react';

import validator from "validator";
import { v4 as uuidv4 } from "uuid";

import Context from '../context';

const CreateGroup: React.FC = () => {
  // get shared data from context.
  const { cometChat, setIsLoading } = useContext(Context);

  const groupNameRef = useRef<any>(null);

  const isGroupValid = (groupName: any) => {
    if (validator.isEmpty(groupName)) {
      alert('Please input your group name');
      return false;
    }
    return true;
  };

  const generateAvatar = () => {
    const avatars= [
      'https://data-us.cometchat.io/assets/images/avatars/captainamerica.png',
      'https://data-us.cometchat.io/assets/images/avatars/cyclops.png',
      'https://data-us.cometchat.io/assets/images/avatars/ironman.png',
      'https://data-us.cometchat.io/assets/images/avatars/spiderman.png',
      'https://data-us.cometchat.io/assets/images/avatars/wolverine.png'
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  }

  const createGroup = () => {
    const groupName = groupNameRef.current.value;
    if (isGroupValid(groupName)) {
      setIsLoading(true);
      const GUID = uuidv4();
      const groupType = cometChat.GROUP_TYPE.PUBLIC;
      const groupIcon = generateAvatar();
      const password = "";

      const group = new cometChat.Group(GUID, groupName, groupType, password);
      group.setIcon(groupIcon);

      cometChat.createGroup(group).then(
        (group: any) => {
          setIsLoading(false);
          alert(`${groupName} was created successfully`)
        },
        (error: any) => {
          setIsLoading(false);
          alert('Cannot create your group. Please try again later')
        }
      );
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Create Group</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='creategroup__container'>
        <div>
          <input type="url" placeholder="Group Name..." ref={groupNameRef} />
          <button className='creategroup__submit-btn' onClick={createGroup}>Create Group</button>
        </div>
      </div>
    </>
  );
};

export default CreateGroup;

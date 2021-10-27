import React, { useContext, useEffect } from 'react';

import { IonToolbar, IonTitle, IonHeader, IonButtons, IonBackButton, IonButton, IonIcon } from '@ionic/react';
import { trash, addCircle, removeCircle, exit } from 'ionicons/icons'
import { useHistory } from 'react-router';

import Context from '../context';

const ManageGroup: React.FC = () => {

  const history = useHistory();

  const { user, cometChat, setIsLoading, selectedConversation } = useContext(Context);

  const handleDeleteGroup = () => {
    if (selectedConversation && selectedConversation.name && selectedConversation.guid) {
      setIsLoading(true);
      cometChat.deleteGroup(selectedConversation.guid).then(
        (response: any) => {
          setIsLoading(false);
          alert(`${selectedConversation.name} was deleted successfully`);
          history.push('/');
        },
        (error: any) => {
          setIsLoading(false);
          alert(`Failure to delete ${selectedConversation.name}`)
        }
      );
    }
  };

  const deleteGroup = () => {
    const shouldDeleteGroup = window.confirm(`Do you want to delete group ${selectedConversation.name}`);
    if (shouldDeleteGroup) {
      handleDeleteGroup();
    }
  };

  if (!selectedConversation) {
    history.push('/');
  }

  const goToAddGroupMembers = () => {
    history.push('/add-group-members');
  };

  const goToRemoveGroupMembers = () => {
    history.push('/remove-group-members');
  };

  const handleLeaveGroup = () => {
    if (selectedConversation && selectedConversation.guid && selectedConversation.name) {
      setIsLoading(true);
      cometChat.leaveGroup(selectedConversation.guid).then(
        (hasLeft: any) => {
          setIsLoading(false);
          alert(`${user.name} has left the group ${selectedConversation.name}`);
          history.push('/');
        }, (error: any) => {
        }
      );
    }
  };

  const leaveGroup = () => {
    const shouldLeaveGroup = window.confirm(`Do you want to leave group ${selectedConversation.name}`);
    if (shouldLeaveGroup) {
      handleLeaveGroup();
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/chat' />
          </IonButtons>
          <IonTitle>Manage Group</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='managegroup__container'>
        {user && selectedConversation && user.uid && selectedConversation.owner && user.uid === selectedConversation.owner &&
          <>
            <div className='managegroup__data-item' onClick={deleteGroup}>
              <IonIcon slot="icon-only" icon={trash} />
              <span>Delete Group</span>
            </div>
            <div className='managegroup__data-item' onClick={goToAddGroupMembers}>
              <IonIcon slot="icon-only" icon={addCircle} />
              <span>Add Members</span>
            </div>
            <div className='managegroup__data-item' onClick={goToRemoveGroupMembers}>
              <IonIcon slot="icon-only" icon={removeCircle} />
              <span>Remove Members</span>
            </div>
          </>}
        {user && selectedConversation && user.uid && selectedConversation.owner && user.uid !== selectedConversation.owner && <div className='managegroup__data-item' onClick={leaveGroup}>
          <IonIcon slot="icon-only" icon={exit} />
          <span>Leave Group</span>
        </div>}
      </div>
    </>
  );
};

export default ManageGroup;
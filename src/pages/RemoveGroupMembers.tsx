import React, { useState, useEffect, useContext } from 'react';

import { IonToolbar, IonTitle, IonHeader, IonButtons, IonBackButton } from '@ionic/react';
import { useHistory } from 'react-router';
import { v4 as uuidv4 } from "uuid";

import Context from '../context';

const RemoveGroupMembers: React.FC = () => {

  const history = useHistory();

  const { user, cometChat, setIsLoading, selectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState<any>('');
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    searchGroupMembers();
  }, [cometChat, keyword]);

  const transformGroupMembers = (groupMembers: any) => {
    if (groupMembers && groupMembers.length !== 0) {
      return groupMembers.filter((member: any) => member && member.uid !== user.uid);
    }
    return groupMembers;
  };

  const searchGroupMembers = () => {
    const GUID = selectedConversation.guid;
    const limit = 30;
    const groupMemberRequestBuilder = new cometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
    const groupMemberRequest = keyword ? groupMemberRequestBuilder.setSearchKeyword(keyword).build() : groupMemberRequestBuilder.build();
    groupMemberRequest.fetchNext().then(
      (groupMembers: any) => {
        setData(() => transformGroupMembers(groupMembers));
      },
      (error: any) => {
      }
    );
  };

  const onKeywordChanged = (e: any) => {
    setKeyword(() => e.target.value.trim());
  };

  const shouldRemoveMember = (selectedUser: any) => {
    return selectedUser && selectedUser.uid && selectedConversation && selectedConversation.guid;
  };

  const handleRemoveMember = (selectedUser: any) => {
    if (shouldRemoveMember(selectedUser)) {
      setIsLoading(true);
      const GUID = selectedUser.guid;
      const UID = selectedUser.uid;

      cometChat.kickGroupMember(GUID, UID).then(
        (response: any) => {
          setIsLoading(false);
          alert(`${selectedUser.name} was removed from the group successfully`)
          searchGroupMembers();
        },
        (error: any) => {
        }
      );
    }
  };

  const selectItem = (item: any) => () => {
    // logic adding a new member to the selected group will be handled in here.
    const shouldRemoveMember = window.confirm(`Do you want remove ${item.name} from the group?`);
    if (shouldRemoveMember) { 
      handleRemoveMember(item)
    }
  };

  if (!selectedConversation) {
    history.push('/');
  }

  const renderDataItem = (dataItem: any) => {
    if (dataItem) { 
      return (
        <div className='removegroupmembers__data-item' onClick={selectItem(dataItem)} key={dataItem.uid ? dataItem.uid : dataItem.guid ? dataItem.guid : uuidv4()}>
          <img src={dataItem.avatar ? dataItem.avatar : dataItem.icon ? dataItem.icon : ''} alt={dataItem.name} />
          <span>{dataItem.name}</span>
        </div>
      );
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/manage-group' />
          </IonButtons>
          <IonTitle>Remove Group Members</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='removegroupmembers__container'>
        <input type="url" placeholder="Search..." onChange={onKeywordChanged} />
        <div className='removegroupmembers__data'>
          {data && data.length !== 0 && data.map((dataItem: any) => { 
            if (dataItem) {
              return renderDataItem(dataItem);
            }
          })}
        </div>
      </div>
    </>
  );
};

export default RemoveGroupMembers;
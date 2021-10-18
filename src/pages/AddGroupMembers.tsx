import React, { useState, useEffect, useContext } from 'react';

import { IonToolbar, IonTitle, IonHeader, IonButtons, IonBackButton } from '@ionic/react';

import { useHistory } from 'react-router';
import { v4 as uuidv4 } from "uuid";

import Context from '../context';

const AddGroupMembers: React.FC = () => {

  const history = useHistory();

  const { cometChat, setIsLoading, selectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState('');
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState([]);

  useEffect(() => {
    searchUsers();
  }, [cometChat, keyword]);

  const shouldTransform = (groupMembers: any, userList: any) => {
    return groupMembers && groupMembers.length !== 0 && userList && userList.length !== 0;
  };

  const isGroupMember = (user: any, groupMembers: any) => {
    if (user && user.uid && groupMembers && groupMembers.length !== 0) {
      for (const member of groupMembers) {
        if (member && member.uid && member.uid === user.uid) {
          return true;
        }
      }
      return false;
    }
    return false;
  };

  const transformUsers = (groupMembers: any, userList: any) => {
    if (shouldTransform(groupMembers, userList)) {
      const transformedUsers = [];
      for (const user of userList) {
        if (!isGroupMember(user, groupMembers)) {
          transformedUsers.push(user);
        }
      }
      return transformedUsers;
    }
    return userList;
  };

  const searchGroupMembers = (userList: any) => {
    const GUID = selectedConversation.guid;
    const limit = 30;
    const groupMemberRequest = new cometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
      .build();

    groupMemberRequest.fetchNext().then(
      (groupMembers: any) => {
        setData(() => transformUsers(groupMembers, userList));
      },
      (error: any) => {
      }
    );
  };

  const searchUsers = () => {
    if (cometChat) {
      const limit = 30;
      const usersRequestBuilder = new cometChat.UsersRequestBuilder().setLimit(limit);
      const usersRequest = keyword ? usersRequestBuilder.setSearchKeyword(keyword).build() : usersRequestBuilder.build();
      usersRequest.fetchNext().then(
        (userList: any) => {
          /* userList will be the list of User class. */
          /* retrived list can be used to display contact list. */
          searchGroupMembers(userList);
        },
        (error: any) => {
        }
      );
    }
  };

  const onKeywordChanged = (e: any) => {
    setKeyword(() => e.target.value.trim());
  };

  const shouldAddMember = (selectedUser: any) => {
    return selectedUser && selectedUser.uid && selectedConversation && selectedConversation.guid
  };

  const handleAddMember = (selectedUser: any) => {
    if (shouldAddMember(selectedUser)) {
      setIsLoading(true);
      const GUID = selectedConversation.guid;
      const membersList = [
        new cometChat.GroupMember(selectedUser.uid, cometChat.GROUP_MEMBER_SCOPE.PARTICIPANT),
      ];
      cometChat.addMembersToGroup(GUID, membersList, []).then(
        (response: any) => {
          setIsLoading(false);
          alert(`${selectedUser.name} was added to the group successfully`);
          searchUsers();
        },
        (error: any) => {
        }
      );
    }
  };

  const selectItem = (item: any) => () => {
    // logic adding a new member to the selected group will be handled in here.
    const shouldAddMember = window.confirm(`Do you want add ${item.name} to the group?`);
    if (shouldAddMember) { 
      handleAddMember(item);
    }
  };

  if (!selectedConversation) {
    history.push('/');
  }

  const renderDataItem = (dataItem: any) => {
    if (dataItem) { 
      return (
        <div className='addgroupmembers__data-item' onClick={selectItem(dataItem)} key={dataItem.uid ? dataItem.uid : dataItem.guid ? dataItem.guid : uuidv4()}>
          <img src={dataItem.avatar ? dataItem.avatar : dataItem.icon ? dataItem.icon : ''} alt={dataItem.name} />
          <span>{dataItem.name}</span>
        </div>
      );
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/manage-group' />
          </IonButtons>
          <IonTitle>Add Group Members</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='addgroupmembers__container'>
        <input type="url" placeholder="Search..." onChange={onKeywordChanged} />
        <div className='addgroupmembers__data'>
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

export default AddGroupMembers;
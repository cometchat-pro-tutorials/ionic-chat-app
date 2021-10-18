import React, { useRef, useContext, useState, useEffect } from 'react';

import { IonToolbar, IonTitle, IonHeader, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { add, exit } from 'ionicons/icons';

import { useHistory } from 'react-router';
import { v4 as uuidv4 } from "uuid";

import Context from '../context';

const Home: React.FC = () => {

  const history = useHistory();

  const { cometChat, setIsLoading, setUser, setSelectedConversation } = useContext(Context);

  const [keyword, setKeyword] = useState<any>('');
  // 0 is user, 1 is group.
  const [selectedType, setSelectedType] = useState<any>(0);
  // data that will be shown on the list, data could be the list of users, or the list of groups.
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (selectedType === 0) {
      searchUsers();
    } else {
      searchGroups();
    }
  }, [cometChat, selectedType, keyword]);

  const getUnreadMessageCountForAllUsers = (userList: any) => {
    cometChat.getUnreadMessageCountForAllUsers().then((array: any) => {
      const unread = Object.keys(array);
      if (unread.length > 0) {
        unread.map(uid => {
          const index = userList.findIndex((user: any) => user.uid === uid);
          if (index !== -1) {
            userList[index].unreadCount = array[uid];
          }
        });
        setData(() => userList);
      } else {
        setData(() => userList);
      }
    });
  };

  const searchUsers = () => {
    if (cometChat) {
      const limit = 30;
      const usersRequestBuilder = new cometChat.UsersRequestBuilder().setLimit(limit);
      const usersRequest = keyword ? usersRequestBuilder.setSearchKeyword(keyword).build() : usersRequestBuilder.build();
      usersRequest.fetchNext().then(
        (userList: any) => {
          getUnreadMessageCountForAllUsers(userList);
        },
        (error: any) => {
        }
      );
    }
  };

  const getUnreadMessageCountForAllGroups = (groupList: any) => {
    if (groupList && groupList.length !== 0) {
      cometChat.getUnreadMessageCountForAllGroups().then((array: any) => {
        const unread = Object.keys(array);
        if (unread.length > 0) {
          unread.map(guid => {
            const index = groupList.findIndex((user: any) => user.guid === guid);
            if (index !== -1) {
              groupList[index].unreadCount = array[guid];
            }
          });
          setData(() => groupList);
        } else {
          setData(() => groupList);
        }
      });
    }
  };

  const searchGroups = () => {
    const limit = 30;
    const groupRequestBuilder = new cometChat.GroupsRequestBuilder().setLimit(limit);
    const groupsRequest = keyword ? groupRequestBuilder.setSearchKeyword(keyword).build() : groupRequestBuilder.build();
    groupsRequest.fetchNext().then(
      (groupList: any) => {
        getUnreadMessageCountForAllGroups(groupList);
      },
      (error: any) => {
      }
    );
  };

  const onKeywordChanged = (e: any) => {
    setKeyword(() => e.target.value.trim());
  };

  const updateSelectedType = (selectedType: any) => () => {
    setSelectedType(() => selectedType);
  };

  const joinGroup = (item: any) => {
    if (item && item.guid && !item.hasJoined) {
      setIsLoading(true);
      const GUID = item.guid;
      const password = "";
      const groupType = cometChat.GROUP_TYPE.PUBLIC;

      cometChat.joinGroup(GUID, groupType, password).then(
        (group: any) => {
          setIsLoading(false);
        },
        (error: any) => {
          setIsLoading(false);
        }
      );
    }
  };

  const selectItem = (item: any) => () => {
    // if item is a group. Join the group if the user has not joined before. 
    if (item && item.guid && !item.hasJoined) {
      joinGroup(item);
    }
    setSelectedConversation({ ...item, contactType: selectedType });
    history.push('/chat');
  };

  const goToCreateGroupPage = () => {
    history.push('/create-group');
  };

  const logout = () => {
    const shouldLogout = window.confirm('Do you want to logout');
    if (shouldLogout) {
      setIsLoading(true);
      cometChat.logout().then(
        () => {
          setUser(null);
          setSelectedConversation(null);
          localStorage.removeItem('auth');
          setIsLoading(false);
        }, (error: any) => {
          alert('Cannot log out. Please try again');
        }
      );
    }
  };

  const renderDataItem = (dataItem: any) => {
    if (dataItem) {
      return (
        <div className='home__data-item' onClick={selectItem(dataItem)} key={dataItem.uid ? dataItem.uid : dataItem.guid ? dataItem.guid : uuidv4()}>
          <img src={dataItem.avatar ? dataItem.avatar : dataItem.icon ? dataItem.icon : ''} alt={dataItem.name} />
          <span>{dataItem.name}</span>
          <span className={`${dataItem.unreadCount ? 'home__unread-count-message' : ''}`}>{dataItem.unreadCount ? dataItem.unreadCount : ''}</span>
        </div>
      );
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={goToCreateGroupPage} >
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="start">
            <IonButton onClick={logout} >
              <IonIcon slot="icon-only" icon={exit} />
            </IonButton>
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='home__container'>
        <input type="url" placeholder="Search..." onChange={onKeywordChanged} />
        <div className='home__actions'>
          <div className={`${selectedType === 0 ? 'home__action--active' : ''}`} onClick={updateSelectedType(0)}>User</div>
          <div className={`${selectedType === 1 ? 'home__action--active' : ''}`} onClick={updateSelectedType(1)}>Group</div>
        </div>
        <div className='home__data'>
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

export default Home;

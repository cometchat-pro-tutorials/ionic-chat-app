import React, { useContext } from 'react';

import Context from '../context';

import deliveredAtIcon from '../images/deliveredAt.png';
import readAtIcon from '../images/readAt.png';

const Message: React.FC<any> = (props) => {
  const { message, messageType, deliveredAt, readAt, senderId, avatar, isRight } = props;

  const { selectedConversation } = useContext(Context);

  if (!message || !avatar) {
    return <></>
  }

  const renderMessageContent = (message: any, messageType: any) => {
    switch (messageType) {
      case 'image':
        return <img className='message__image' src={message} />;
      case 'video':
        return (
          <video className='message__video' controls>
            <source src={message} type="video/mp4" />
          </video>
        );
    }
    return <p>{message}</p>
  }

  const renderTicks = (deliveredAt: any, readAt: any) => {
    if (readAt || readAt > 0) {
      return <img className='message__tick' src={readAtIcon} alt='read-at' />
    }
    if (deliveredAt || deliveredAt > 0) {
      return <img className='message__tick' src={deliveredAtIcon} alt='delivered-at' />
    }
    return <img className='message__tick' src='https://2.bp.blogspot.com/-XItmlQeH_-4/Vj9iojIcOHI/AAAAAAAA-f8/mU7SLoGV8Lk/s320/Single%2BTick%2BCheck%2BMark%2BPHOTO.jpg' />;
  };

  if (isRight) {
    return (
      <div className="message__right">
        <div>
          <div className="message__content message__content--right">
            {renderMessageContent(message, messageType)}
          </div>
          <div className='message__tick-container'>
            {selectedConversation && selectedConversation.contactType === 0 && selectedConversation.uid !== senderId && renderTicks(deliveredAt, readAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="message__left">
      <div className="message__content message__content--left">
        {renderMessageContent(message, messageType)}
      </div>
    </div>
  );
};

export default Message;
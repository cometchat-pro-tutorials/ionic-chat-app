import React, { useRef, useContext } from 'react';

import { IonToolbar, IonTitle, IonButtons, IonBackButton, IonHeader } from '@ionic/react';

import validator from "validator";

import { auth } from '../firebase';
import Context from '../context';

const SignUp: React.FC<any> = () => {
  const { cometChat, setIsLoading } = useContext(Context);

  const fullnameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const generateAvatar = () => {
    // hardcode list of user's avatars for the demo purpose.
    const avatars = [
      'https://data-us.cometchat.io/assets/images/avatars/captainamerica.png',
      'https://data-us.cometchat.io/assets/images/avatars/cyclops.png',
      'https://data-us.cometchat.io/assets/images/avatars/ironman.png',
      'https://data-us.cometchat.io/assets/images/avatars/spiderman.png',
      'https://data-us.cometchat.io/assets/images/avatars/wolverine.png'
    ];
    const avatarPosition = Math.floor(Math.random() * avatars.length);
    return avatars[avatarPosition];
  }

  const isSignupValid = ({ fullname, email, password, confirmPassword }: any) => {
    if (validator.isEmpty(fullname)) {
      alert('Please input your fullname');
      return false;
    }
    if (validator.isEmpty(email) || !validator.isEmail(email)) {
      alert('Please input your email');
      return false;
    }
    if (validator.isEmpty(password)) {
      alert('Please input your password')
      return false;
    }
    if (validator.isEmpty(confirmPassword)) {
      alert('Please input your confirm password');
      return false;
    }
    if (password !== confirmPassword) {
      alert('Your confirm password must be matched with your password');
      return false;
    }
    return true;
  };

  const register = () => {
    const fullname = fullnameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    if (isSignupValid({ fullname, email, password, confirmPassword })) {
      setIsLoading(true);
      // generate user's avatar.
      const userAvatar = generateAvatar();
      // call firebase to to register a new account.
      auth.createUserWithEmailAndPassword(email, password).then((userCrendentials: any) => {
        if (userCrendentials) {
          const firebaseUid = userCrendentials && userCrendentials.user && userCrendentials.user.uid ? userCrendentials.user.uid : null;
          if (firebaseUid) {
            // cometchat auth key
            const authKey = `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`;
            // call cometchat service to register a new account.
            const user = new cometChat.User(firebaseUid);
            user.setName(fullname);
            user.setAvatar(userAvatar);

            cometChat.createUser(user, authKey).then(
              (user: any) => {
                alert(`${userCrendentials.user.email} was created successfully! Please sign in with your created account`);
                setIsLoading(false);
              }, (error: any) => {
                setIsLoading(false);
              }
            )
          } else {
            setIsLoading(false);
            alert('Fail to create your account. Please try again');
          }
        }
      }).catch((error: any) => {
        setIsLoading(false);
        alert('Fail to create your account. Please try again');
      });
    }
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Sign Up</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className='signup__container'>
        <div>
          <input type="url" placeholder="Fullname..." ref={fullnameRef} />
          <input type="url" placeholder="Email..." ref={emailRef} />
          <input type="password" placeholder="Password..." ref={passwordRef} />
          <input type="password" placeholder="Confirm Password..." ref={confirmPasswordRef} />
          <button className='signup__submit-btn' onClick={register}>Register</button>
        </div>
      </div>
    </>
  )
};

export default SignUp;
import React, { useRef, useContext } from 'react';

import { useHistory } from 'react-router';
import validator from "validator";

import { auth } from "../firebase";
import Context from '../context';

const Login: React.FC = () => {
  // get shared data from context.
  const { setUser, setIsLoading, cometChat } = useContext(Context);
  // create ref to get user's email and user's password.
  const emailRef: any = useRef(null);
  const passwordRef: any = useRef(null);

  const history = useHistory();

  const isUserCredentialsValid = (email: string, password: string) => {
    return validator.isEmail(email) && password;
  };

  /**
   * login
   */
  const login = () => {
    // show loading indicator.
    setIsLoading(true);
    // get the user's creadentials.
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (isUserCredentialsValid(email, password)) {
      // if the user's credentials are valid, call Firebase authentication service.
      auth.signInWithEmailAndPassword(email, password).then((userCredential: any) => {
        const firebaseUid = userCredential.user.uid;
        // login cometchat.
        cometChat.login(firebaseUid, `${process.env.REACT_APP_COMETCHAT_AUTH_KEY}`).then(
          (User: any) => {
            // User loged in successfully.
            // save authenticated user to local storage.
            localStorage.setItem('auth', JSON.stringify(User));
            // save authenticated user to context.
            setUser(User);
            // hide loading.
            setIsLoading(false);
            // redirect to home page.
            history.push('/');
          }, (error: any) => {
            console.log(error);
            // User login failed, check error and take appropriate action.
            setIsLoading(false);
            alert(`Your user's name or password is not correct`);
          }
        );
      }).catch((error: any) => {
        console.log(error);
        // hide loading indicator.
        setIsLoading(false);
        alert(`Your user's name or password is not correct`);
      });
    } else {
      // hide loading indicator.
      setIsLoading(false);
      alert(`Your user's name or password is not correct`);
    }
  };

  const goToSignUp = () => {
    history.push('/signup');
  };

  return (
    <div className='login__container'>
      <div>
        <h3 className='login__title'>Ionic Chat App</h3>
        <input type="url" placeholder="Email..." ref={emailRef} />
        <input type="password" placeholder="Password..." ref={passwordRef} />
        <button className='login__submit-btn' onClick={login}>Login</button>
        <p className='login__register-label' onClick={goToSignUp}>Register</p>
      </div>
    </div>
  );
};

export default Login;
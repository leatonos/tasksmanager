//Next.js imports
import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
//Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth,signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup  } from "firebase/auth";
import { firebaseConfig } from '@/firebase-config'
//React imports
import { useState } from 'react';
//Redux imports
import { useAppDispatch } from '@/redux/hooks'
import { goToCreateAccount } from '@/redux/loginSlice'

//Image imports
import Image from 'next/image'
import googleIcon from '../../public/google_icon.png'

export default function LoginComponent() {

    const [message,setMessage] = useState<string>('')
    const dispatch = useAppDispatch()
    const googleLoginProvider = new GoogleAuthProvider();
    


    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

  const loginAction = (e:any) =>{

    const userEmail:string = (document.getElementById('email') as HTMLInputElement).value
    const userPassword:string = (document.getElementById('password') as HTMLInputElement).value
    
    const auth = getAuth(app);
    e.preventDefault()

    signInWithEmailAndPassword(auth, userEmail, userPassword)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode == 'auth/user-not-found'){
        setMessage('User does not exist or incorrect password')
      }
    });
  }

  const googleLogin = () =>{
    signInWithPopup(auth, googleLoginProvider)
  .then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
  }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    setMessage(errorMessage)
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
  }
    return (
      <>
        <Head>
          <title>Tasks - Dashboard</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.homeContainer}>
          <form className={styles.formContainer} onSubmit={loginAction}>
            <h1 className={styles.homeTitle}>Welcome to Task</h1>
            <div className={styles.formFieldContainer}>
              <label htmlFor="email" className="form-label">Email address</label>
              <input type="email" required className={styles.accountForm} id="email" placeholder="name@example.com"/>
            </div>
            <div className={styles.formFieldContainer}>
              <label htmlFor="password" className="form-label">Password</label>
              <input type="password" required className={styles.accountForm} id="password"/>
            </div>
            <div className={styles.buttonsContainer}>
              <p className={styles.messageLog}>{message}</p>
              <button className={styles.loginBtn} type="submit">Login</button>
              <button onClick={()=>dispatch(goToCreateAccount())} className={styles.signUpBtn} type="button">Create Account</button>
              <button onClick={googleLogin} className={styles.googleLogin} type="button">
                <Image style={{marginRight:'10px'}} src={googleIcon} alt={'Login with google'} width={20}/>
                Login with Google
              </button>
            </div>
          </form>
        </main>
      </>
    )
  
}

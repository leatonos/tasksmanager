import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'


import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth,createUserWithEmailAndPassword, onAuthStateChanged,signInWithEmailAndPassword } from "firebase/auth";

import { firebaseConfig } from '@/firebase-config'
import { getDoc, getFirestore } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';

export default function Home() {

const [windowState,setWindowState] = useState('login')
const [userEmail,setUserEmail] = useState('')
const [userPassword,setUserPassword] = useState('')
const [newUserEmail,setNewUserEmail] = useState('')
const [newUserPassword,setnewUserPassword] = useState('')

const router = useRouter()



// Initialize Firebase
const app = initializeApp(firebaseConfig);


useEffect(()=>{
  //here we check if the user is logged or not
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      console.log(user)
      router.push('/dashboard')
      // ...
    } else {
      // User is signed out
      // ...
    }
  });

},[app,router])


const loginAction = (e:any) =>{
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
    console.log(errorCode)
    console.log(errorMessage)
  });
}
const createAccountAction = (e:any) =>{
  const auth = getAuth(app);
  e.preventDefault()
  createUserWithEmailAndPassword(auth, newUserEmail, newUserPassword)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log(userCredential)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

  setWindowState('login')


}
  if(windowState == 'login'){
    return (
      <>
        <Head>
          <title>Tasks - Login</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.homeContainer}>
          <form className={styles.formContainer} onSubmit={loginAction}>
            <h1 className={styles.homeTitle}>Welcome to Task</h1>
            <div className={styles.formFieldContainer}>
              <label htmlFor="email" className="form-label">Email address</label>
              <input onChange={(e)=>setUserEmail(e.target.value)} type="email" required className={styles.accountForm} id="email" placeholder="name@example.com"/>
            </div>
            <div className={styles.formFieldContainer}>
              <label htmlFor="password" className="form-label">Password</label>
              <input onChange={(e)=>setUserPassword(e.target.value)} type="password" required className={styles.accountForm} id="password"/>
            </div>
            <div className={styles.buttonsContainer}>
              <button className={styles.loginBtn} type="submit">Login</button>
              <button onClick={()=>setWindowState('accountCreation')} className={styles.signUpBtn} type="button">Create Account</button>
              <button className={styles.loginBtn} type="button">Login with Google</button>
            </div>
          </form>
        </main>
      </>
    )
  }else{
    return (
      <>
        <Head>
          <title>Tasks - Create Account</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className={styles.homeContainer}>
          <form className={styles.formContainer} onSubmit={loginAction}>
            <h1 className={styles.homeTitle}>Create your account</h1>
            <div className={styles.formFieldContainer}>
              <label htmlFor="newemail" className="form-label">Email address</label>
              <input onChange={(e)=>setNewUserEmail(e.target.value)} type="email" required className={styles.accountForm} id="newemail" placeholder="name@example.com"/>
            </div>
            <div className={styles.formFieldContainer}>
              <label htmlFor="newpassword" className="form-label">Password</label>
              <input onChange={(e)=>setnewUserPassword(e.target.value)} type="password" required className={styles.accountForm} id="newpassword"/>
            </div>
            <div className={styles.buttonsContainer}>
              <button onClick={createAccountAction} className={styles.loginBtn} type="submit">Create Account</button>
              <button onClick={()=>setWindowState('login')} className={styles.signUpBtn} type="button">Go Back</button>
            </div>
          </form>
        </main>
      </>
    )
  }
  
}

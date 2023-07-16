import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'

//Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseConfig } from '@/firebase-config'

//React imports
import { useEffect, useState } from 'react';

//Redux imports
import { useAppDispatch, useAppSelector } from '@/redux/hooks'

//Components imports
import LoginComponent from '@/components/loginComponent'
import CreateAccountComponent from '@/components/createAccountComponent'

export default function Home() {

  const windowState = useAppSelector((state)=>state.login.screen)

  const router = useRouter()


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  useEffect(()=>{
    //here we check if the user is logged or not
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log(user)
        router.push('/dashboard')
      } else {
        // User is signed out
      }
    });

  },[app,router])

  if(windowState == 'login'){
    return (
      <LoginComponent/>
    )
  }else{
    return (
     <CreateAccountComponent/>
    )
  }
  
}

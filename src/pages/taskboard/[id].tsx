import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from '@/firebase-config';
import { getDoc, getFirestore } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';


import { useRouter } from 'next/router'



const inter = Inter({ subsets: ['latin'] })



export default function Home() {


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

  const [dataResult,setData] = useState('data')

  useEffect(()=>{
    const unsub = onSnapshot(doc(db, "TaskBoards", "NBKt3TVqdRKbVtz8ycvD"), (doc) => {
      console.log("Current data: ", doc.data());
      setData(JSON.stringify(doc.data()))
    });
  },[db])
    

  return (
    <>
      <Head>
        <title>Tasks</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Create account</h1>
        <p>{JSON.stringify(dataResult)}</p>
      </main>
    </>
  )
}

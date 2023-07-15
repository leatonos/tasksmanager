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

//Types Imports
import { TaskBoard } from '@/interfaces/interfaces';



const inter = Inter({ subsets: ['latin'] })

export default function TaskComponent() {


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
    

  return (
    <div>
        <h3>Task Name</h3>
    </div>
  )
}

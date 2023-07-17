import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot, collection, addDoc } from "firebase/firestore";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseConfig } from '@/firebase-config';

//Types Imports
import { Task, TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';
import { runTransaction } from 'firebase/firestore';

//Image imports
import Image from 'next/image'
import addImage from '../../public/add-icon-white.svg'

//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail,setUserTaskBoards } from '@/redux/userSlice';

export default function TaskCardComponent(taskCardInfo:Task) {

    
    //Redux Selectors
    const userId = useAppSelector((state) => state.user.userId)
    const userName = useAppSelector((state) => state.user.userName)
    const userEmail = useAppSelector((state) => state.user.userEmail)
    const dispatch = useAppDispatch()

    //Router
    const router = useRouter()

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

  

 

  return (
  
      <div className={styles.taskCard}>
        <h3>CardName</h3>
        <p>Task Description</p>
        <label htmlFor={`duedate-${taskCardInfo.index}`}>Due date:</label>
        <p>{}</p>
        <input type='datetime-local' id={`duedate-${taskCardInfo.index}`}/>
      </div>
  
  )
}

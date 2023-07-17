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
    const taskBoardId = useAppSelector((state) => state.task.taskboardId)
    const dispatch = useAppDispatch()

    //Router
    const router = useRouter()

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    function convertDateToString(date:Date){
        
        const originalDuedate = date
        const year = originalDuedate.getFullYear()
        const monthNum = originalDuedate.getMonth().toString()
        const dayNum = originalDuedate.getDate().toString()
        let hours = originalDuedate.getHours().toString()
        let minutes = originalDuedate.getMinutes().toString()
        if(hours.length<2){hours='0'+hours}
        let monthStr=monthNum
        let dayStr=dayNum
        if(monthNum.length<2){monthStr = '0'+monthStr}
        if(dayNum.length<2){dayStr = '0'+dayNum} 


        //example
        //2018-06-12T19:30 
        return `${year}-${monthStr}-${dayStr}T${hours}:${minutes}`
    }


    const collectionIndex = taskCardInfo.collectionIndex as number
    const cardIndex = taskCardInfo.index as number

    const saveCardTitleChange = async (newTitle: string) => {
        const sfDocRef = doc(db, "TaskBoards", taskBoardId);

        try {
            await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const taskBoardData = sfDoc.data() as TaskBoard
            let taskCollectionsList = [...taskBoardData.taskCollections]
            taskCollectionsList[collectionIndex].tasks[cardIndex].taskName = newTitle

            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
    }

    const saveNewDescription =async (newDescription:string) => {
        const sfDocRef = doc(db, "TaskBoards", taskBoardId);

        try {
            await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const taskBoardData = sfDoc.data() as TaskBoard
            let taskCollectionsList = [...taskBoardData.taskCollections]
            taskCollectionsList[collectionIndex].tasks[cardIndex].taskDescription = newDescription

            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
    }

    const saveNewDate=async (date:string) => {
        const sfDocRef = doc(db, "TaskBoards", taskBoardId);

        try {
            await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const taskBoardData = sfDoc.data() as TaskBoard
            let taskCollectionsList = [...taskBoardData.taskCollections]
            taskCollectionsList[collectionIndex].tasks[cardIndex].taskDueDate = new Date(date)

            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
    }

  return (
  
      <div className={styles.taskCard}>
        <h3 contentEditable onBlur={(e) => saveCardTitleChange(e.target.innerText)} className={styles.editableText}>{taskCardInfo.taskName}</h3>
        <textarea onBlur={(e) => saveNewDescription(e.target.value)}  defaultValue={taskCardInfo.taskDescription}></textarea>
        <label htmlFor={`duedate-${taskCardInfo.index}`}>Due date:</label>
        <input onBlur={(e) => saveNewDate(e.target.value)} type='datetime-local' id={`duedate-${taskCardInfo.index}`} defaultValue={convertDateToString(taskCardInfo.taskDueDate as Date)}/>
      </div>
  
  )
}

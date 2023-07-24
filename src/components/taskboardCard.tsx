import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot, collection, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseConfig } from '@/firebase-config';

//Types Imports
import { TaskBoard, User, UserTaskBoard } from '@/interfaces/interfaces';
import { runTransaction } from 'firebase/firestore';

//Image imports
import Image from 'next/image'
import deleteImage from '../../public/delete-icon-white.svg'

//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail,setUserTaskBoards } from '@/redux/userSlice';
import Link from 'next/link';

export default function TaskBoardCardComponent(taskCardInfo:UserTaskBoard) {

    //Redux Selectors
    const userId = useAppSelector((state) => state.user.userId)
    const userName = useAppSelector((state) => state.user.userName)
    const userEmail = useAppSelector((state) => state.user.userEmail)
    const taskBoardId = taskCardInfo.taskBoardId
    const taskBoardIndex = taskCardInfo.taskboardIndex as number
    const dispatch = useAppDispatch()

    //Router
    const router = useRouter()

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    const openTaskBoard = () =>{
        router.push(`/taskboard/${taskBoardId}`)
    }

    const deleteTaskboard = async () => {

      //Here we need to delete the taskboard in two places
      //The first is the users's taskboards
      const userDocRef = doc(db, "Users", userId);
      try {
          await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(userDocRef);
          if (!sfDoc.exists()) {
              throw "Document does not exist!";
          }
          const userData = sfDoc.data() as User
          const userTaskBoards = [...userData.taskBoards]

          userTaskBoards.splice(taskBoardIndex,1)
          

          transaction.update(userDocRef, { taskBoards: userTaskBoards });
          });
          console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }

          //Now we delete from the Taskboards Collection
          const taskboardDocRef = doc(db, "TaskBoards", taskBoardId);
          await deleteDoc(taskboardDocRef);

          //Force refresh page
          router.reload()
      }
     
    const updateTaskboardTitle = async(newTitle:string) => {

      const userDocRef = doc(db, "Users", userId);
      //Update on user Profile
      try {
        await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(userDocRef);
        if (!sfDoc.exists()) {
            throw "Document does not exist!";
        }
        const userData = sfDoc.data() as User
        const userTaskBoards = [...userData.taskBoards]

        userTaskBoards[taskBoardIndex].boardName = newTitle
      
        transaction.update(userDocRef, { taskBoards: userTaskBoards });
        });
        console.log("Transaction successfully committed!");
      } catch (e) {
          console.log("Transaction failed: ", e);
      }

      //Update on Taskboard
      const taskboardDocRef = doc(db, "TaskBoards", taskBoardId);
      await updateDoc(taskboardDocRef,{
        boardName:newTitle
      });


    }

  return (
  
      <div className={styles.taskboardCard}>
        <div className={styles.taskboardCardHeader}>
          <Image onClick={deleteTaskboard} className={styles.deleteTaskboard} src={deleteImage} alt={'Delete this Taskboard'}/>
        </div>
        <input onChange={(e) => updateTaskboardTitle(e.target.value)} defaultValue={taskCardInfo.boardName} className={styles.editableText} 
          style={{
                  marginTop:'calc(10vh - 40px)',
                  marginBottom:'10px',
                  width:'90%',
                  fontSize:'20px',
                }}
        />
        <Link style={{color:'white'}} href={`/taskboard/${taskBoardId}`}>Open taskboard</Link>
      </div>
  
  )
}

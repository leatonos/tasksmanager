import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from '@/firebase-config';
import { Timestamp, getDoc, getFirestore, runTransaction } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';


//Images Imports
import Image from 'next/image';
import whiteAddIcon from '../../public/add-icon-white.svg'
import deleteIcon from '../../public/delete-icon-white.svg'


//Types Imports
import { Task, TaskBoard, TaskCollection } from '@/interfaces/interfaces';
import TaskCardComponent from './taskCard';
import { useAppSelector } from '@/redux/hooks';

const inter = Inter({ subsets: ['latin'] })

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export default function TaskCollectionComponent(props:TaskCollection) {

const taskBoardId = useAppSelector((state) => state.task.taskboardId)
const collectionPosition = props.index as number

const saveCollectionTitleChange = async(newCollectionTitle:string)=>{
  
  const sfDocRef = doc(db, "TaskBoards", taskBoardId);

  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }
      const taskBoardData = sfDoc.data() as TaskBoard
      let taskCollectionsList = [...taskBoardData.taskCollections]
      taskCollectionsList[collectionPosition].collectionTitle = newCollectionTitle


      transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }

}

const createNewTaskCard = async(boardId:string,position:number)=>{
  const sfDocRef = doc(db, "TaskBoards", boardId);
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }
      const taskBoardData = sfDoc.data()
      let taskCollectionsList = [...taskBoardData.taskCollections]
      const newTask:Task = {
        taskName: 'New Task',
        taskDescription: 'Task Description',
        taskDueDate: Timestamp.fromDate(new Date)
      }
      taskCollectionsList[position].tasks.push(newTask)

      transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

const deleteCollection =async (boardId:string,position:number) => {
  const sfDocRef = doc(db, "TaskBoards", boardId);
  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(sfDocRef);
      if (!sfDoc.exists()) {
        throw "Document does not exist!";
      }
      const taskBoardData = sfDoc.data()
      let taskCollectionsList = [...taskBoardData.taskCollections]
      taskCollectionsList.splice(position,1)

      transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
    });
    console.log("Transaction successfully committed!");
  } catch (e) {
    console.log("Transaction failed: ", e);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

  return (
    <>
      <div onDragEnter={()=>console.log('Collection number: '+collectionPosition)} className={styles.taskCollectionContainer}>
        <Image onClick={()=>deleteCollection(taskBoardId,collectionPosition)} className={styles.deleteCollectionBtn} src={deleteIcon} alt={'Delete this colletion'} title='Delete this collection'/>
        <input defaultValue={props.collectionTitle} onBlur={(e)=>saveCollectionTitleChange(e.target.value)} className={styles.editableCollectionName} id={`collectionTitle-${props.index}`}></input>
        <div onClick={()=>createNewTaskCard(taskBoardId,collectionPosition)} className={styles.taskCreatorButton}>
          <Image className={styles.iconCreateTaskCard} src={whiteAddIcon} alt={'Click to add a new taskCard'}/>
          <h5>Add task card</h5>
        </div>
        {props.tasks.map((task,index)=>{
          return <TaskCardComponent key={index+task.taskName} collectionIndex={collectionPosition} index={index} taskName={task.taskName} taskDescription={task.taskDescription} taskDueDate={task.taskDueDate}/>
          })
        }
      </div>
    </>
  )
}

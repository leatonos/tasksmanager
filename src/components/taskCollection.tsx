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
import dragIcon from '../../public/move-white.svg'


//Types Imports
import { Task, TaskBoard, TaskCollection } from '@/interfaces/interfaces';
import TaskCardComponent from './taskCard';
import { useAppSelector } from '@/redux/hooks';

const inter = Inter({ subsets: ['latin'] })

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export default function TaskCollectionComponent(props:TaskCollection) {

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  //Collection CSS State
  const [floatingDisplay,setFloatingDisplay]= useState('none')
  const [fixedDisplay,setFixedDisplay] = useState('')
  const [selectable,setSelectable] = useState<any>('') 
  const [fixedCollectionOpacity,setFixedCollectionOpacity] = useState(1)
    
  //Collection Info
  const taskBoardId = useAppSelector((state) => state.task.taskboardId)
  const collectionPosition = props.index as number

  //Redux Mouse
  const mousePositionX = useAppSelector((state)=>state.mouse.mouseX)
  const mousePositionY = useAppSelector((state)=>state.mouse.mouseY)
  const selectedCollection = useAppSelector((state)=>state.mouse.mouseCollectionPosition)

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

    const startDraggingCollection =()=>{
      //Fixed Collection CSS changes
      setFixedCollectionOpacity(0.4)
      setSelectable('none')
      //Floating Collection CSS changes
      setFloatingDisplay('flex')
    }

    const stopDraging = async() =>{

      setFloatingDisplay('none')

      //If the user does not drag the card away from the collection nothing happens
      if(collectionPosition == selectedCollection){
          setFixedCollectionOpacity(1)
          setSelectable('')
          return
      }

      //Changes the collection position in the array 
      const sfDocRef = doc(db, "TaskBoards", taskBoardId);
      
      try {
          await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(sfDocRef);
          if (!sfDoc.exists()) {
              throw "Document does not exist!";
          }
          const taskBoardData = sfDoc.data() as TaskBoard

          //Makes a copy of the current Taskboard so we can make changes
          let taskCollectionsList = [...taskBoardData.taskCollections]
          
          //This represents the collection you are dragging
          const collectionToBeCopied = taskCollectionsList[collectionPosition]
          
          taskCollectionsList.splice(collectionPosition,1)
          taskCollectionsList.splice(selectedCollection,0,collectionToBeCopied)
          

          transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
          });
          console.log("Transaction successfully committed!");
      } catch (e) {
          console.log("Transaction failed: ", e);
      }
      
      setFixedCollectionOpacity(1)
      
    
  }


    const fixedCollectionStyle:React.CSSProperties = {
      opacity:fixedCollectionOpacity,
      userSelect:selectable
    }
    const floatingColletionStyle:React.CSSProperties = {
      display:floatingDisplay,
      position:"absolute",
      top:mousePositionY -35,
      left:mousePositionX -30,
      width:'calc(20% - 5px)',
      height: 'calc(100vh - 120px)',
      minWidth:'200px',
      zIndex:99999
    }


  return (
    <>
     <div onMouseUp={stopDraging} style={floatingColletionStyle} className={styles.taskCollectionContainerFloating}>
        <div className={styles.taskCollectionHeader}>
          <Image draggable='false' className={styles.dragCollectionBtn} src={dragIcon} alt={'Move this colletion'} title='Move this collection'/>
          <Image draggable='false' onClick={()=>deleteCollection(taskBoardId,collectionPosition)} className={styles.deleteCollectionBtn} src={deleteIcon} alt={'Delete this colletion'} title='Delete this collection'/>
        </div>
        <input defaultValue={props.collectionTitle} onBlur={(e)=>saveCollectionTitleChange(e.target.value)} className={styles.editableCollectionName} id={`collectionTitle-${props.index}`}></input>
        <div onClick={()=>createNewTaskCard(taskBoardId,collectionPosition)} className={styles.taskCreatorButton}>
          <Image className={styles.iconCreateTaskCard} src={whiteAddIcon} alt={'Click to add a new taskCard'}/>
          <h5>Add task card</h5>
        </div>
        {props.tasks.map((task,index)=>{
          return <TaskCardComponent key={index+task.taskName+task.taskDescription} collectionIndex={collectionPosition} index={index} taskName={task.taskName} taskDescription={task.taskDescription} taskDueDate={task.taskDueDate}/>
          })
        }
      </div>
      <div style={fixedCollectionStyle} className={styles.taskCollectionContainer} id={`taskCollection-n${collectionPosition}`}>
        <div className={styles.taskCollectionHeader}>
          <Image onMouseDown={startDraggingCollection} draggable='false' className={styles.dragCollectionBtn} src={dragIcon} alt={'Move this colletion'} title='Move this collection'/>
          <Image draggable='false' onClick={()=>deleteCollection(taskBoardId,collectionPosition)} className={styles.deleteCollectionBtn} src={deleteIcon} alt={'Delete this colletion'} title='Delete this collection'/>
        </div>
        <input defaultValue={props.collectionTitle} onBlur={(e)=>saveCollectionTitleChange(e.target.value)} className={styles.editableCollectionName} id={`collectionTitle-${props.index}`}></input>
        <div onClick={()=>createNewTaskCard(taskBoardId,collectionPosition)} className={styles.taskCreatorButton}>
          <Image className={styles.iconCreateTaskCard} src={whiteAddIcon} alt={'Click to add a new taskCard'}/>
          <h5>Add task card</h5>
        </div>
        {props.tasks.map((task,index)=>{
          return <TaskCardComponent key={index+task.taskName+task.taskDescription} collectionIndex={collectionPosition} index={index} taskName={task.taskName} taskDescription={task.taskDescription} taskDueDate={task.taskDueDate}/>
          })
        }
      </div>
     
    </>
  )
}

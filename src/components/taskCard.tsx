import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot, collection, addDoc, Timestamp } from "firebase/firestore";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseConfig } from '@/firebase-config';

//Types Imports
import { Task, TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';
import { runTransaction } from 'firebase/firestore';

//Image imports
import Image from 'next/image'
import addImage from '../../public/add-icon-white.svg'
import deleteIcon from '../../public/delete-icon-white.svg'
import moveButton from '../../public/move-white.svg'


//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail,setUserTaskBoards } from '@/redux/userSlice';
import { setDraggingStatus } from '@/redux/mouseSlice';


export default function TaskCardComponent(taskCardInfo:Task) {
    
    //CSS static card state
    const [fixedCardOpacity,setFixedCardOpacity] = useState<number>(1) 
    const [selectable,setSelectable] = useState<any>('')   

    //FloatingCard
    //Floatin CSS State
    const [floatingCardDisplay,setFloatingCardDisplay] = useState('none')
    const [floatingCardCSSPosition,setFloatingCardCSSPosition] = useState<any>('static')
    const [floatingCardTransform,setFloatingCardTransform] = useState<any>('none')


    //Redux Selectors
    const userId = useAppSelector((state) => state.user.userId)
    const userName = useAppSelector((state) => state.user.userName)
    const userEmail = useAppSelector((state) => state.user.userEmail)
    const taskBoardId = useAppSelector((state) => state.task.taskboardId)
    const selectedCollection = useAppSelector((state)=>state.mouse.mouseCollectionPosition)
    const selectedCardPosition = useAppSelector((state)=>state.mouse.mouseCardPosition)
    const dispatch = useAppDispatch()

    //Router
    const router = useRouter()

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    // Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(app);

    const mousePositionX = useAppSelector((state)=>state.mouse.mouseX)
    const mousePositionY = useAppSelector((state)=>state.mouse.mouseY)

    //Card Information
    const collectionIndex = taskCardInfo.collectionIndex as number
    const cardIndex = taskCardInfo.index as number
    const currentDate:any = taskCardInfo.taskDueDate.toDate()
    const stringDate:any = convertDateToString(currentDate)
    const test:any = taskCardInfo.taskDueDate.toMillis()


    function convertDateToString(newDate:Date){
        const year = newDate.getFullYear()
        const monthNum = (newDate.getMonth()+1).toString()
        const dayNum = newDate.getDate().toString()
        let hours = newDate.getHours().toString()
        let minutes = newDate.getMinutes().toString()
        if(hours.length<2){hours='0'+hours}
        if(minutes.length<2){minutes='0'+minutes}
        let monthStr=monthNum
        let dayStr=dayNum
        if(monthNum.length<2){monthStr = '0'+monthStr}
        if(dayNum.length<2){dayStr = '0'+dayNum} 

        //example
        //2018-06-12T19:30 
        return `${year}-${monthStr}-${dayStr}T${hours}:${minutes}`
    }

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
        console.log(date)
        try {
            await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const taskBoardData = sfDoc.data() as TaskBoard
            const newDateDue = new Date(date)
            console.log(date)
            let taskCollectionsList = [...taskBoardData.taskCollections]
            taskCollectionsList[collectionIndex].tasks[cardIndex].taskDueDate = Timestamp.fromDate(newDateDue)
            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
    }

    const deleteTaskCard = async () => {
        const sfDocRef = doc(db, "TaskBoards", taskBoardId);

        try {
            await runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }
            const taskBoardData = sfDoc.data() as TaskBoard
            let taskCollectionsList = [...taskBoardData.taskCollections]
            taskCollectionsList[collectionIndex].tasks.splice(cardIndex,1)

            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
    }

    const startDraging = ()=>{
        //Fixed Card CSS changes
        setFixedCardOpacity(0.3)
        setSelectable('none')
        //Floating Card CSS
        setFloatingCardDisplay('block')
    }

    const stopDraging = async() =>{

        setFloatingCardDisplay('none')

        //If the user does not drag the card away from the collection nothing happens
        if(collectionIndex == selectedCollection && cardIndex == selectedCardPosition){
            setFixedCardOpacity(1)
            setSelectable('')
            return
        }

        //Transfer the card from one Collection to another and from 
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
            
            //This represents the card you are dragging
            const cardToBeCopied = taskCollectionsList[collectionIndex].tasks[cardIndex]
            
            taskCollectionsList[collectionIndex].tasks.splice(cardIndex,1)
            console.log(selectedCollection)
            taskCollectionsList[selectedCollection].tasks.splice(selectedCardPosition,0,cardToBeCopied)

            transaction.update(sfDocRef, { taskCollections: taskCollectionsList });
            });
            console.log("Transaction successfully committed!");
        } catch (e) {
            console.log("Transaction failed: ", e);
        }
        
        setFixedCardOpacity(1)
        
      
    }

    const cardStyle:React.CSSProperties = {
        opacity:fixedCardOpacity,
        userSelect:selectable
    }

    const floatingCardStyle:React.CSSProperties = {
       
        display:floatingCardDisplay,
        position:"absolute",
        top:mousePositionY -35,
        left:mousePositionX -30,
        width:'calc(20% - 5px)',
        minWidth:'200px',
        zIndex:99999

    }

  return (
    <>
        <div onMouseUp={stopDraging} className={styles.taskCardFloating} style={floatingCardStyle}>
            <div className={styles.cardHeader}>
                <Image draggable={false}  className={styles.moveCardBtn} src={moveButton} alt={'Move this task card'}/>
                <input type='text' style={{margin:'10px 0px'}} defaultValue={taskCardInfo.taskName} className={styles.editableText}></input>
                <Image className={styles.deleteCardBtn} src={deleteIcon} alt={'Delete this task card'}/>
            </div>
            <textarea defaultValue={taskCardInfo.taskDescription}></textarea>
            <div >
                <label htmlFor={`duedate-${taskCardInfo.index}`}>Due date:</label>
                <input type='datetime-local' id={`duedate-${taskCardInfo.index}`} defaultValue={stringDate}/>
            </div>
        </div>
        <div className={styles.taskCard} style={cardStyle}>
            <div className={styles.cardHeader}>
                <Image draggable={false} onMouseDown={startDraging} className={styles.moveCardBtn} src={moveButton} alt={'Move this task card'}/>
                <input type='text' style={{margin:'10px 0px'}} onBlur={(e) => saveCardTitleChange(e.target.value)} defaultValue={taskCardInfo.taskName} className={styles.editableText}></input>
                <Image onClick={deleteTaskCard} className={styles.deleteCardBtn} src={deleteIcon} alt={'Delete this task card'}/>
            </div>
            <textarea onBlur={(e) => saveNewDescription(e.target.value)}  defaultValue={taskCardInfo.taskDescription}></textarea>
            <div className={styles.dateContainer}>
                <label htmlFor={`duedate-${taskCardInfo.index}`}>Due date:</label>
                <input onBlur={(e) => saveNewDate(e.target.value)} type='datetime-local' id={`duedate-${taskCardInfo.index}`} defaultValue={stringDate}/>
            </div>
        </div>
    </>
   
  
  )
}

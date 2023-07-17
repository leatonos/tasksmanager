import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot, collection, addDoc } from "firebase/firestore";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { firebaseConfig } from '@/firebase-config';

//Types Imports
import { TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';
import { runTransaction } from 'firebase/firestore';

//Image imports
import Image from 'next/image'
import addImage from '../../public/add-icon-white.svg'

//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail,setUserTaskBoards } from '@/redux/userSlice';

export default function TaskBoardCardComponent(taskCardInfo:UserTaskBoard) {

    
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

    const [showTaskboardCreator,setShowTaskBoardCreator] = useState<boolean>(false)

    const createTaskBoardAction = async (e:any) => {
        e.preventDefault()
        const newTaskboardName = (document.getElementById('taskboardname') as HTMLInputElement).value   
        //First we create the new Taskboard into the Taskboard Collection
        const docRef = await addDoc(collection(db, "TaskBoards"), {
            boardName:newTaskboardName,
            taskCollections:[],
            boardMembers:[userId],
            onwerId:userId
        });
        console.log("Document written with ID: ", docRef.id);
        
        //Now we get the generated Id for this Taskboard and register into the user Information
        //This way it will be easier to retrieve all the taskboards from this user

        const sfDocRef = doc(db, "Users", userId);

        try {
            await runTransaction(db, async (transaction) => {
              const sfDoc = await transaction.get(sfDocRef);
              if (!sfDoc.exists()) {
                throw "Document does not exist!";
              }
          
              let taskBoardList:UserTaskBoard[] = sfDoc.data().taskBoards
              taskBoardList.push({
                taskBoardId:docRef.id,
                boardMembers:[userId],
                onwerId:userId,
                onwerName:userName,
                boardName:newTaskboardName,
              })
              dispatch(setUserTaskBoards(taskBoardList))
              transaction.update(sfDocRef, { taskBoards: taskBoardList });
            });
            console.log("Transaction successfully committed!");
            setShowTaskBoardCreator(false)
          } catch (e) {
            console.log("Transaction failed: ", e);
          }

          

    }

    const openTaskBoard = () =>{
        router.push(`/taskboard/${taskCardInfo.taskBoardId}`)
    }

    //Taskboard Creator
    function TaskBoardCreator(){
        if(showTaskboardCreator){
            return(
            <div className='fullScreenContainer'>
                <form className={styles.formContainer} onSubmit={createTaskBoardAction}>
                    <h1 className={styles.homeTitle}>Create a taskboard</h1>
                    <div className={styles.formFieldContainer}>
                        <label htmlFor="taskboardname" className="form-label">Taskboard name</label>
                        <input type="text" required className={styles.accountForm} id="taskboardname"/>
                    </div>
                    <div className={styles.buttonsContainer}>
                        <button className={styles.loginBtn} type="submit">Create taskboard</button>
                        <button onClick={()=>{setShowTaskBoardCreator(false)}} className={styles.signUpBtn} type="button">Cancel</button>
                    </div>
                </form>
            </div>
            )
        }
    }
 


  //This will only appear the first Taskboard card, it represents the taskboard Creator
  if(taskCardInfo.taskBoardId==''){
    return(
        <>
            <TaskBoardCreator/>
            <div onClick={()=>{setShowTaskBoardCreator(true)}} className={styles.taskboardCard}>
                <h2>Create Taskboard</h2>
                <Image src={addImage} alt={''} className={styles.addTaskBoardIcon} />
            </div>
        </>
    )
  }

  return (
  
      <div onClick={openTaskBoard} className={styles.taskboardCard}>
        <h2>{taskCardInfo.boardName}</h2>
      </div>
  
  )
}

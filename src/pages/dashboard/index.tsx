import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

//Image Imports
import Image from 'next/image'
import addImage from '../../../public/add-icon-white.svg'
//Firebase imports
import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot, runTransaction, addDoc, collection } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseConfig } from '@/firebase-config';

//Next / React imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
//Compnentes imports
import { TaskBoard, User, UserTaskBoard } from '@/interfaces/interfaces';
import TaskBoardCardComponent from '@/components/taskboardCard';

const inter = Inter({ subsets: ['latin'] })

//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail, setUserTaskBoards } from '@/redux/userSlice';

export default function Dashboard() {
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const router = useRouter()
  
  //Dashboard State
  const [userRegistred, setUserRegistred] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [showTaskboardCreator,setShowTaskBoardCreator] = useState<boolean>(false)

  //Redux Selectors
  const userId = useAppSelector((state) => state.user.userId)
  const userName = useAppSelector((state) => state.user.userName)
  const userEmail = useAppSelector((state) => state.user.userEmail)
  const userTaskBoards = useAppSelector((state) => state.user.userTaskBoards)
  const dispatch = useAppDispatch()


  useEffect(() => {
    
    //Here we check if the user is logged in or not
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        dispatch(setUserId(user.uid))
        dispatch(setUserEmail(user.email as string))
        checkUser(user.uid)
        // ...
      } else {
        // User is signed out we sent the user back to home screen
        router.push('/')
      }
    });

  }, [router])

  /**
   * Checks if the user is the the Users's Collection if not,
   * we ask for a username and register in the database
   * @param id - userId
   */
  const checkUser = async(id:string) =>{
    const docRef = doc(db, "Users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      //It means that this user exists in the database, so we save the information into the Redux Store
      console.log("Document data:", docSnap.data());
      const databaseResult = docSnap.data() as User
      dispatch(setUserEmail(databaseResult.userEmail))
      dispatch(setUserId(databaseResult.userId))
      dispatch(setUserName(databaseResult.userName))
      dispatch(setUserTaskBoards(databaseResult.taskBoards))
      setUserRegistred(true)
    } else {
      /*
        It means that problably this is the user's first login, so we need to register
        in the Users collection to attach a taskboard to this user later. Then we just
        alert the application that the user is not registred it will show a form to the user choose a username.
      */
      setUserRegistred(false)
    }
  }

  /**
   * Logoff the user from the section
   */
  const userSignOut = () =>{
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      // An error happened.
    });
  }

  /**
   * Registers the user in the database
   */
  const registerUser= async(e:any)=>{
    e.preventDefault()
    const newUserName = (document.getElementById('newUserName') as HTMLInputElement).value 

    // Add a new user in collection "Users"
    await setDoc(doc(db, "Users", userId), {
      userName: newUserName,
      userId:userId,
      userEmail:userEmail,
      taskBoards:[]
    })
    //Then we check again if the user is registred
    await checkUser(userId)

  }



   //Taskboard Creator
   function TaskBoardCreator(){

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

  if(userRegistred){
    return(
      <>
      <Head>
        <title>Tasks - Dashboard</title>
        <meta name="description" content="Created by Pedro Fernando" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Dashboard</h1>
        <div className={styles.buttonsContainer}>
          <button className={styles.signUpBtn} onClick={userSignOut} type="button">Sign Out</button>
        </div>
        <div className={styles.taskBoardCardsContainer}>
              <TaskBoardCreator/>
              <div onClick={()=>{setShowTaskBoardCreator(true)}} className={styles.taskboardCard}>
                  <h2>Create Taskboard</h2>
                  <Image src={addImage} alt={''} className={styles.addTaskBoardIcon} />
              </div>
          {userTaskBoards.map((taskBoard:UserTaskBoard,index)=>{
            return (
            <TaskBoardCardComponent
                key={index}
                taskboardIndex = {index}
                taskBoardId={taskBoard.taskBoardId}
                boardName={taskBoard.boardName}
                boardMembers={taskBoard.boardMembers} 
                onwerId={taskBoard.onwerId} 
                onwerName={taskBoard.onwerName}            
                />
            )
          })}
        </div>
      </main>
    </>
    )
  }
  return (
    <>
      <Head>
        <title>Tasks - Dashboard</title>
        <meta name="description" content="Created by Pedro Fernando" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Dashboard</h1>
        <form className={styles.formContainer} onSubmit={registerUser}>
            <h1 className={styles.homeTitle}>Register User</h1>
            <p>It looks this is your first time here, we just need to create a user name for you so we can start</p>
            <div className={styles.formFieldContainer}>
              <label htmlFor="newUserName" className="form-label">User Name</label>
              <input type="text" required className={styles.accountForm} id="newUserName" placeholder="your name"/>
            </div>
            <div className={styles.buttonsContainer}>
              <p className={styles.messageLog}>{message}</p>
              <button className={styles.loginBtn} type="submit">Register</button>
              <button className={styles.signUpBtn} onClick={userSignOut} type="button">Sign Out</button>
            </div>
        </form>
      </main>
    </>
  )
}

import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';

//Image imports
import Image from 'next/image'
import blackAddIcon from '../../../public/add-icon-black.svg'
import whiteAddIcon from '../../../public/add-icon-white.svg'
import moveButton from '../../../public/move-white.svg'

//Firebase Imports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from '@/firebase-config';
import { getDoc, getFirestore, runTransaction } from "firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

//Redux imports
import { useAppDispatch } from '@/redux/hooks';
import { useAppSelector } from '@/redux/hooks';
import { setUserName,setUserId,setUserEmail, setUserTaskBoards } from '@/redux/userSlice';
import {setMouseXLocation,setMouseYLocation,setCardMousePosition,setCollectionMousePosition} from '@/redux/mouseSlice'

//Types imports
import { CardCoordinates, TaskBoard, TaskCollection, User } from '@/interfaces/interfaces';

//Components imports
import TaskCollectionComponent from '@/components/taskCollection'
import TaskCardComponent from '@/components/taskCard'
import { closeWindow, openTaskCollectionCreator, setTaskBoardId } from '@/redux/taskSlice';

export default function Taskboard() {
  
  const router = useRouter()

  //Component States
  const [taskBoardInfo,setTaskBoardInfo] = useState<null|TaskBoard>(null)
  const [collectionsPositions,setCollectionsPositions] = useState<number[]>([])
  const [cardLocations,setCardLocations] = useState<CardCoordinates[]>([])
  const taskboardId = (router.query.id) as string


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  //Redux Selectors
  //User
  const userId = useAppSelector((state) => state.user.userId)
  const userName = useAppSelector((state) => state.user.userName)
  const userEmail = useAppSelector((state) => state.user.userEmail)
  const userTaskBoards = useAppSelector((state) => state.user.userTaskBoards)
  //Task Window
  const taskWindowState = useAppSelector((state)=>state.task.windowState)
  //Mouse 
  const mousePositionX = useAppSelector((state)=>state.mouse.mouseX)
  const mousePositionY = useAppSelector((state)=>state.mouse.mouseY)
  const selectedCollection = useAppSelector((state)=>state.mouse.mouseCollectionPosition)
  const selectedCardPosition = useAppSelector((state)=>state.mouse.mouseCardPosition)

  const dispatch = useAppDispatch()

  //Makes all the updates in realtime
  useEffect(()=>{
    //It can take sometime to the router been processed so, we wait until the value is valid
    if(!taskboardId){
      return
    }else{
      //Once is valid. it saves the taskboard id into the redux store, now it is acessible for all components
      dispatch(setTaskBoardId(taskboardId))
    }
    const unsub = onSnapshot(doc(db, "TaskBoards",taskboardId), (doc) => {

      //If this document does not exist the user is pushed back to the dashboard page
      if(!doc.exists()){
        router.push('/dashboard')
      }

      console.log("Current data: ", doc.data());
      const databaseResult = doc.data() as TaskBoard
      setTaskBoardInfo(databaseResult)
    });
  },[router])

  //Gets user info
  useEffect(() => {
    
    //Here we check if the user is logged in or not
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        dispatch(setUserId(user.uid))
        dispatch(setUserEmail(user.email as string))
        getUserInfo(user.uid)
        // ...
      } else {
        // User is signed out we sent the user back to home screen
        router.push('/')
      }
    });

  }, [router])


  //Checks if this user have access to this Taskboard
  useEffect(() => {
    
    if(!taskBoardInfo || userId == ''){
      return
    }

    if(taskBoardInfo.boardMembers.includes(userId)){
      //console.log('User authorized')
    }else{
      console.log('User not a member')
      router.push('/dashboard')
    }

  }, [taskBoardInfo,userId])

  //Every time we move the mouse the system makes some calculations to see where is every collection and the cards
  const getMousePosition = (e:any) =>{
      
    //Select all the task collection elements on the page and create an array
      const collectionElements = document.getElementsByClassName(styles.taskCollectionContainer) as HTMLCollectionOf<HTMLElement>
      const collectionElementsArr = Array.from(collectionElements)
      
    //Convert this array into an array with the axis location in the page of each Task Collection
      const arrayOfCollectionPositions = collectionElementsArr.map((element)=>{
        return element.offsetLeft
      })
    
      //Save these collections into the store
      setCollectionsPositions(arrayOfCollectionPositions)
      
      //Updating Mouse position relative to the scroll of the the collections
      const collections = document.getElementById('taskCollections') as HTMLElement
      dispatch(setMouseXLocation(e.pageX + Math.floor(collections.scrollLeft)))
      dispatch(setMouseYLocation(e.pageY))

      //Setting what task collection the user is hovering with the mouse
      dispatch(setCollectionMousePosition(getSelectedTaskCollection()))
      
      //Getting cards from that collection
      const gettingCardsCSSQuery = `#taskCollection-n${getSelectedTaskCollection()} > .${styles.taskCard}`
      const selectedCollectionHTML = document.querySelectorAll(gettingCardsCSSQuery) as NodeListOf<HTMLElement>
      const arrayOfCardElements = Array.from(selectedCollectionHTML)
      const arrayOfCardCoordinates = arrayOfCardElements.map((card)=>{
        return {
          cardTop:card.getBoundingClientRect().top,
          cardBottom:card.getBoundingClientRect().bottom  
        }
      })
      setCardLocations(arrayOfCardCoordinates)
      dispatch(setCardMousePosition(getSelectedCardLocation()))

  }


  //Returns with collection the user is hovering with the mouse
  const getSelectedTaskCollection = ()=>{

    let selected = 0

    for (let i = 0; i < collectionsPositions.length; i++) {
      if(mousePositionX >= collectionsPositions[i]){
        selected = i
      }
      
    }


    return selected;
  }

  /**
   * Returns what position the card you are dragging will be
   */
  const getSelectedCardLocation= () =>{
    
    let cardYLocation = 0

    for (let i = 0; i < cardLocations.length; i++) {
      if(mousePositionY >= cardLocations[i].cardBottom){
        cardYLocation = i+1
        break;
      }
    }
    return cardYLocation
  }

  /**
   * Returs User information
   * @param id 
   */
  const getUserInfo = async(id:string) =>{
    const docRef = doc(db, "Users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      //It means that this user exists in the database, so we save the information into the Redux Store
      const databaseResult = docSnap.data() as User
      dispatch(setUserEmail(databaseResult.userEmail))
      dispatch(setUserId(databaseResult.userId))
      dispatch(setUserName(databaseResult.userName))
      dispatch(setUserTaskBoards(databaseResult.taskBoards))
      
    } else {
      //User not registred redirect to dashboard page
      router.push('/dashboard')
    }
  }
  
  //Creates a new Task collection (a column)
  const createNewCollection = async(e:any) =>{

    e.preventDefault()
    const newCollectionName = (document.getElementById('task-collection-name') as HTMLInputElement).value
    const sfDocRef = doc(db, "TaskBoards", taskboardId);

    try {
      await runTransaction(db, async (transaction) => {
        const sfDoc = await transaction.get(sfDocRef);
        if (!sfDoc.exists()) {
          throw "Document does not exist!";
        }
        
        const taskBoardData = sfDoc.data() as TaskBoard
        let taskCollectionList = [...taskBoardData.taskCollections]
        const newTaskCollection:TaskCollection = {
          collectionTitle: newCollectionName,
          tasks: []
        }
        taskCollectionList.push(newTaskCollection)
        transaction.update(sfDocRef, { taskCollections: taskCollectionList });
      });
      console.log("Transaction successfully committed!");
      dispatch(closeWindow())
    } catch (e) {
      console.log("Transaction failed: ", e);
    }

  }

  function TaskCollectionCreator(){
    if(taskWindowState == 'TaskCollectionCreator'){
      return(
      <div className='fullScreenContainer'>
          <form className={styles.formContainer} onSubmit={createNewCollection}>
              <h1 className={styles.homeTitle}>Create a task collection</h1>
              <div className={styles.formFieldContainer}>
                  <label htmlFor="task-collection-name" className="form-label">Task collection name</label>
                  <input type="text" required className={styles.accountForm} id="task-collection-name"/>
              </div>
              <div className={styles.buttonsContainer}>
                  <button className={styles.loginBtn} type="submit">Create Collection</button>
                  <button onClick={()=>dispatch(closeWindow())} className={styles.signUpBtn} type="button">Cancel</button>
              </div>
          </form>
      </div>
      )
  }
  }
  

  return (
    <>
      <Head>
        <title>Tasks - Taskboad - {taskBoardInfo?.boardName}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TaskCollectionCreator/>
      <main className={styles.main}>
        <h1>{taskBoardInfo?.boardName}</h1>
        <div onMouseMove={(e) => getMousePosition(e)} id='taskCollections' className={styles.taskCollectionsContainer}>
          <div onClick={()=>dispatch(openTaskCollectionCreator())} className={styles.taskCollectionContainerCreator}>
            <h3>Create Task Collection</h3>
            
            <Image className={styles.addCollectionIcon} src={blackAddIcon} alt={'Add Icon'}/>
          </div>
          {taskBoardInfo?.taskCollections.map((taskCollection, index)=>{
            return <TaskCollectionComponent key={index+taskCollection.collectionTitle} index={index} collectionTitle={taskCollection.collectionTitle} tasks={taskCollection.tasks}/>
          })}
        </div>
      </main>
    </>
  )
}

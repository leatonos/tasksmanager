import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

import { initializeApp } from "firebase/app";
import { getDoc, getFirestore,setDoc,doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/router';
import { firebaseConfig } from '@/firebase-config';
import { User } from '@/interfaces/interfaces';
import TaskBoardCardComponent from '@/components/taskboardCard';

const inter = Inter({ subsets: ['latin'] })

export default function Dashboard() {
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const router = useRouter()

  const [userRegistred, setUserRegistred] = useState<boolean>(true)
  const [message, setMessage] = useState<string>('')
  const [userId,setUserId] = useState<string>('')
  const [userEmail,setUserEmail] = useState<string | null>('')
  const [userInfo, setUserInfo] = useState<User | null>(null)



  useEffect(() => {
    
    //Here we check if the user is logged in or not
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        setUserId(user.uid)
        setUserEmail(user.email)
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
      //It means that problably is the user's first login
      console.log("Document data:", docSnap.data());
      const databaseResult = (docSnap.data() as User)
      setUserInfo(databaseResult)
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

    // Add a new document in collection "cities"
    await setDoc(doc(db, "Users", userId), {
      userName: newUserName,
      userId:userId,
      userEmail:userEmail,
      taskBoards:[]
    })
    //Then we check again if the user is registred
    await checkUser(userId)

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
        <div className={styles.taskBoardCardsContainer}>
          <TaskBoardCardComponent taskboardId={''} boardName={''} taskCollections={[]} boardMembers={[]}/>
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
              <p className={styles.messageLog}>{userId}</p>
              <button className={styles.loginBtn} type="submit">Register</button>
              <button className={styles.signUpBtn} onClick={userSignOut} type="button">Sign Out</button>
            </div>
        </form>
      </main>
    </>
  )
}

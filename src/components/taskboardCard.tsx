import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

//Types Imports
import { TaskBoard } from '@/interfaces/interfaces';


//Image imports
import Image from 'next/image'
import addImage from '../../public/add-icon-white.svg'

export default function TaskBoardCardComponent(taskCardInfo:TaskBoard) {

  if(taskCardInfo.taskboardId==''){
    return(
        <div className={styles.taskboardCard}>
            <h2>Create Taskboard</h2>
            <Image src={addImage} alt={''} className={styles.addTaskBoardIcon} />
        </div>
    )
  }

  return (
  
      <div className={styles.taskboardCard}>
        <h2>Task Board Name</h2>
      </div>
  
  )
}

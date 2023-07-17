import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';



export interface TaskSlice {
   windowState:string,
   taskboardId:string,
   taskboardInfo:TaskBoard|null
}

const initialState: TaskSlice = {
    windowState:'Taskboard',
    taskboardId:'',
    taskboardInfo:null
}

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    openTaskCollectionCreator: (state) => {
        state.windowState = 'TaskCollectionCreator'
    },
    openTaskCreator: (state) => {
        state.windowState = 'TaskCreator'
    },
    closeWindow: (state) => {
        state.windowState = 'Taskboard'
    },
    saveTaskboardInfo: (state,action: PayloadAction<TaskBoard>) => {
        state.taskboardInfo = action.payload
    },
    setTaskBoardId: (state,action: PayloadAction<string>) => {
        state.taskboardId = action.payload
    }
   
  }
})

export const { openTaskCollectionCreator, openTaskCreator, closeWindow,setTaskBoardId,saveTaskboardInfo} = taskSlice.actions



export default taskSlice.reducer
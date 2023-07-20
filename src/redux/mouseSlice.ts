import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';



export interface MouseSlice {
    mouseX:number,
    mouseY:number,
    mouseCollectionPosition:number,
    mouseCardPosition:number,
    draggingStatus:boolean
}

const initialState: MouseSlice = {
    mouseX:0,
    mouseY:0,
    mouseCollectionPosition:0,
    mouseCardPosition:0,
    draggingStatus:false
}

export const mouseSlice = createSlice({
  name: 'mouse',
  initialState,
  reducers: {
    setMouseXLocation: (state,action: PayloadAction<number>) => {
        state.mouseX = action.payload
    },
    setMouseYLocation: (state,action: PayloadAction<number>) => {
        state.mouseY = action.payload
    },
    setCollectionMousePosition: (state,action: PayloadAction<number>) => {
      state.mouseCollectionPosition = action.payload
    },
    setCardMousePosition: (state,action: PayloadAction<number>) => {
      state.mouseCardPosition = action.payload
    },
    setDraggingStatus: (state,action: PayloadAction<boolean>) => {
      state.draggingStatus = action.payload
    },
  }
})

export const { setMouseXLocation,setMouseYLocation,
  setCollectionMousePosition,setCardMousePosition,setDraggingStatus} = mouseSlice.actions



export default mouseSlice.reducer
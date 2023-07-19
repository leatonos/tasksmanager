import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from './store'
import { TaskBoard, UserTaskBoard } from '@/interfaces/interfaces';



export interface MouseSlice {
    mouseX:number,
    mouseY:number,
    mouseCollectionPosition:string,
    mouseCardPosition:string
}

const initialState: MouseSlice = {
    mouseX:0,
    mouseY:0,
    mouseCollectionPosition:'',
    mouseCardPosition:''
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
  }
})

export const { setMouseXLocation,setMouseYLocation} = mouseSlice.actions



export default mouseSlice.reducer
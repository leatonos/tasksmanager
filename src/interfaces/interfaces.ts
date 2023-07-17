

export interface UserTaskBoard {
    boardMembers:string[],
    onwerId:string,
    onwerName:string,
    taskBoardId:string
    boardName:string
   }

export interface User{
    userName:string;
    userId:string;
    userEmail:string;
    taskBoards:UserTaskBoard[]
}

export interface TaskBoard{
    boardName:string;
    taskCollections:TaskCollection[];
    boardMembers: string[]
}

export interface TaskCollection{
    index?: number;
    collectionTitle:string;
    tasks:Task[];
}

export interface Task{
    index?: number;
    taskName:string;
    taskDescription:string;
    taskDueDate:Date | undefined
}
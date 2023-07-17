

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
    boardMembers: User[]
}

export interface TaskCollection{
    collectionTitle:string;
    tasks:Task[];
}

export interface Task{
    taskName:string;
    taskDescription:string;
    taskDueDate:Date
}
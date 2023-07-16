export interface User{
    userName:string;
    userId:string;
    userEmail:string;
    taskBoards:string[]
}

export interface TaskBoard{
    taskboardId:string;
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
export interface User{
    userName:string;
    userId:string;
    userEmail:string;
    taskBoards:TaskBoard[]
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
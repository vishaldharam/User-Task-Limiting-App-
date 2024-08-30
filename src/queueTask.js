import logTaskCompletion from './logger.js';
const TASK_QUEUE = 'task_queue';
import { redis } from './server.js';

//here initialzing the queue processing on each instance
const initializeQueue = () => {
  processQueue();
};


//here we addding the the exceeded request in the queue.
const addToQueue = (userId, firstRequestTimeStamp, timeLimit) => {
  redis.lpush(TASK_QUEUE, JSON.stringify({ userId, firstRequestTimeStamp, timeLimit }));
};


//this function will run when the server application is running on process of os
const processQueue = async () => {
  while (true) {
    const taskToPerform = await redis.rpop(TASK_QUEUE); // Get the last task in the queue
    if (taskToPerform) {
      const { userId, firstRequestTimeStamp, timeLimit } = JSON.parse(taskToPerform);
      const canProcess = await canProcessTask(userId, firstRequestTimeStamp, timeLimit);
      if (canProcess) {
        task(userId); // Process the task if the rate limit is reset
      } else {
        console.log(`Time Limit is not fullfilled yet for req of user: ${userId}`);
        redis.lpush(TASK_QUEUE, taskToPerform); // Re-queue the task 
      }
    }
    await delay(3000); // Here we are setting the delay for how long the queue should pop the next request to process
  }
};



const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


//check the time limit is fullfilled for the req or not..
const canProcessTask = async (userId, firstRequestTimeStamp, timeLimit) => {
  try {
    const userJson = await redis.get(`user:${userId}`);

    if (!userJson) {
      return false; // If no user found in redis it will return false
    }

    const user = JSON.parse(userJson);
    const updatedFirstRequestTimeStamp = user.firstRequestTimeStamp || firstRequestTimeStamp;

    // Checks the request timelimit is fullfilled till 60sec/1min
    if (Date.now() - updatedFirstRequestTimeStamp > timeLimit) {
      // Update the user's state in Redis
      const isQueueEmpty = await redis.llen(TASK_QUEUE); // Correctly get the length of the list
      if(isQueueEmpty === 0){
        const updatedUser = {
          userId: userId,
          count: timeLimit === 1000 ? user.count : 1,
          firstRequestTimeStamp: Date.now(),
          isReset: true
        };
        await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
        return true; // Task can be processed
      }
      else {
        const updatedUser = {
          userId: userId,
          count: timeLimit === 1000 ? user.count : 1,
          firstRequestTimeStamp: firstRequestTimeStamp,
          isReset: false
        };
        await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
        return true; // Task can be processed
      }
    }
    return false; // Task cannot be processed yet
  } catch (error) {
    console.log(error)
  }
};


//you provided this function which will write the request processed logs in file task-completion.log
const task = async (userId) => {
  try {
    const userJSON = await redis.get(`user:${userId}`)
    if (userJSON) {
      const user = JSON.parse(userJSON)
      console.log(user)
    }
    const now = Date.now()
    logTaskCompletion(userId, now);
    console.log(`${userId}-task completed at-${now}`);
  } catch (error) {
    console.log(error)
  }
}

export { initializeQueue, addToQueue, task };



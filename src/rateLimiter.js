import { addToQueue, task } from "./queueTask.js";
import { redis } from "./server.js";

const rateLimiter = async (userId) => {

  // Check the request with same userId is exits or not.
  const userJson = await redis.get(`user:${userId}`);
  const now = Date.now();
  // when user is requesting first time..
  if (!userJson) {
    const newUser = {
      userId,
      firstRequestTimeStamp: now,
      count: 1,
      isReset: false
    };
    await redis.set(`user:${userId}`, JSON.stringify(newUser));
    task(userId);
    return true;
  }

  const user = JSON.parse(userJson);

  //check wheather the userID is reset in the queue or not so we can initialize the firstRequestTimeStamp equal to now.
  if(user.isReset && user.count === 1){
    const newUser = {
      userId,
      firstRequestTimeStamp: now,
      count: 2,
      isReset: false
    };
    await redis.set(`user:${userId}`, JSON.stringify(newUser));
    task(userId);
    return true;
  }

// Check if 1 second has passed for the first request
  if (now - user.firstRequestTimeStamp < 1000) {
    addToQueue(userId, user.firstRequestTimeStamp, 1000);
    return false;
  }


  // Check if 60 seconds have passed and count exceeds 20
  if (now - user.firstRequestTimeStamp > 60000) {
    // In that if the count is greater than the LIMIT_PER_MIN then user will be updated in the redis
    //  with count 1 and firstRequestTimeStamp = Date.now()
    if (user.count > 20) {
      const updatedUser = {
        userId,
        firstRequestTimeStamp: now,
        count: 1,
        isReset: false

      };
      await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
      task(userId);
      return true;
    } else {
      //here if it exceeds the LIMIT_PER_MIN then user will be updated with count and firstRequesttimeStamp will be the timeStamp of
      //last request.
      const updatedUser = {
        userId,
        firstRequestTimeStamp: user.firstRequestTimeStamp,
        count: user.count + 1,
        isReset: false
      };
      await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
      task(userId);
      return true;
    }
  }

  // If the user has  exceeded the LIMIT_PER_MIN it will be added to redis queue
  if (user.count >= 20) {
    addToQueue(userId, user.firstRequestTimeStamp, 60000);
    return false;
  }

  // If the user has not exceeded the LIMIT_PER_MIN 

  const updatedUser = {
    userId,
    firstRequestTimeStamp: user.firstRequestTimeStamp,
    count: user.count + 1,
    isReset: false
  };
  await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
  task(userId);
  return true;
};

export default rateLimiter;

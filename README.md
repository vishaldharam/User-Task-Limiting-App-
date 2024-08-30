********Node.js API Cluster with Rate Limiting and Queueing System********




**Overview**

This project sets up a Node.js API with clustering and rate-limiting functionality.   
It uses Redis to manage a task queue and enforce rate limits for user tasks. The server is configured to  
handle multiple requests using a cluster of worker processes,  
each managing tasks with a rate limit of 1 request per second and 20 requests per minute per user ID.


**Features**

Node.js Cluster Setup: Utilizes the Node.js cluster module to create a primary process and multiple worker processes.  
Rate Limiting: Enforces a rate limit of 1 task per second and 20 tasks per minute for each user ID.  
Queueing System: Uses Redis to queue tasks that exceed the rate limits and processes them asynchronously.  
Logging: Logs task completion information to a file.

**Requirements**

Node.js (v16 or higher)  
Redis runing on default port 6379  
In windows docker will needed for redis  
dotenv for environment variable management  
ioredis for Redis client  
express for the API framework


**Setup**

**1. Clone the Repository:**
   
   git clone https://github.com/vishaldharam/User-Task-Limiting-App-.git  
   cd your-local-repository

**2. Install Dependencies:**
 
   npm install

**3. Configure Environment Variables**

Create a .env file in the root directory with the following variables:

PORT=3001  
PER_MIN_RATE_LIMIT=20  
DELAY_IN_PROCESSSING_THE_QUEUE=3000  
NO_OF_REPLICA_IN_CLUSTER=2

Adjust these values as needed:  
PORT: The port on which the server will listen.  
PER_MIN_RATE_LIMIT: Maximum number of tasks allowed per user per minute.  
DELAY_IN_PROCESSSING_THE_QUEUE: Delay between processing tasks in the queue (in milliseconds).  
NO_OF_REPLICA_IN_CLUSTER: Number of worker processes (replicas) to spawn.

**4. Start the docker container**

Run following commands to run the redis image on docker container    
1. Creating a Redis Container
   docker run -p 6379:6379 --name my-redis -d redis
3. Accessing Redis
   docker exec -it my-redis redis-cli


**5. Start the Server**
   
Run the following command to start the server with clustering:  
node src/primary.js  
This will start the primary process and the specified number of worker processes.  
and will run same image of server.js on both the worker process

**6. API Endpoint**

POST /task  
Description: Accepts tasks and enforces rate limits based on user ID.

**7. Send the continious request to api end point **

Request Body : json  
{  
  "userId": "user123"  // The ID of the user submitting the task  
}

**8. Response when the rate limit is not exceeded for specific userID**  

Success: { "status": "ok", "message": "Your request is executed" } 

**9. Response when the rate limit is  exceeded for specific userID**  

Rate Limit Exceeded: { "status": "ok", "message": "You have exceeded the request limit; it might take some time for processing" }

****Queueing and Rate Limiting****

Queueing: Tasks that exceed the rate limit are pushed to a Redis queue.  
Rate Limiting: The rate limiter ensures that users do not exceed the defined rate limits. If a task is added to the queue, it will be processed when the rate limit allows.  

Logging  
Task Completion Logs: Logs are written to task-completion.log in the root directory, indicating the completion of tasks along with the timestamp.  

Additional Notes  
Ensure Redis is running locally or provide the appropriate configuration in your environment variables if using a remote Redis instance.  
Adjust the number of worker processes according to your server’s capability and load requirements.

Troubleshooting  
Redis Connection Issues: Verify that Redis is running and accessible.  
Rate Limiting Issues: Check the rate limiter logic and ensure that the environment variables are correctly set.

import express from "express";
import rateLimiter from "./rateLimiter.js";
import { initializeQueue } from "./queueTask.js";
import { Redis } from 'ioredis';

const app = express();
app.use(express.json());


const port = process.env.PORT || 3001;
const redis = new Redis(); // creating the instance of redis which will process the information to default localhost:6379

//Initialize  the queue
initializeQueue()


//an route which will take care of processing the task of the user.
app.post('/task', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send('userId is required');
  }

  try {
    const isAllowed = await rateLimiter(userId);
    if (isAllowed) {
      return res.json({ status: "ok", message: `Your request is executed` });
    } else {
      return res.json({ status: "ok", message: `You have exceeded the request limit; it might take some time for processing` });
    }
  } catch (error) {
    console.error('Error in rate limiter:', error);
    return res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
    console.log(`App in running on process:${process.pid} | listening on port ${port}`);
  });


  export { redis }
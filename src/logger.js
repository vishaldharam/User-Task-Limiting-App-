import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, 'task-completion.log');

//function to add logs of request which has been completed
function logTaskCompletion(userId, timestamp) {
    const logMessage = `${userId}-task completed at-${timestamp}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        } else {
            console.log(`Log entry added for user ${userId}`);
        }
    });
}

export default logTaskCompletion;

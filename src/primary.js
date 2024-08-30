import cluster from "cluster";
import os from 'os'
import {dirname} from "path";
import { fileURLToPath } from "url";



// refered from the DigitalOcean Platform primary.js
const __dirname = dirname(fileURLToPath(import.meta.url))

const cpuCount = os.cpus().length;


console.log(`The total no of CPU's is ${cpuCount}`)
console.log(`Primary pid=${process.pid}`)

//Following that, you reference the index.js file using the setupPrimary() method of the cluster module
// so that it will be executed in each worker process spawned.
cluster.setupPrimary({
    exec: __dirname + '/server.js',
})

//creates two instances/replica set in cluster
for(let i = 0; i < 2; i++){
    //initialized them here.
    cluster.fork()
}

cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} has been killed`);
    console.log("Starting another worker");
    cluster.fork();
  });




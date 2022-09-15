export default class Logger {
   
    constructor(worker) {
      this.worker = worker;
    }

    log(id, type, data) {
        this.worker.postMessage([id, type, data]);
    }
}
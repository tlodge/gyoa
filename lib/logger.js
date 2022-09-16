export default class Logger {
   
    constructor(worker) {
      
      if (Logger._instance) {
        return Logger._instance
      }
      this.worker = worker;
      Logger._instance = this;
    }

    log(id, type, data) {
        this.worker.postMessage([id, type, data]);
    }
}
import request from 'superagent';


const _log = (id,type,data)=>{
    return new Promise((resolve, reject)=>{
        request.get('/api/log').query({id,type,data}).then(()=>{
            console.log("done!!");
            resolve();
        })
    });
}

export default async function logit(id, type, data){
    console.log("calling request get", id, type, data);
    await _log(id,type,data);
}
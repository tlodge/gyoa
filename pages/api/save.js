import admin from '../../lib/firebase';



export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } }

const allowCors = fn => async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {

      res.status(200).end()
      return
    }
    return await fn(req, res)
  }
  
  const handler = async (req, res) => {
    
    if (req.method === "POST"){
        const firebase = admin.firestore();

        const {id, script} = req.body;
        
        if (id){
            const scriptRef = firebase.collection("scripts").doc(id);
            await scriptRef.set({script, ts:Date.now()});
            console.log("saved it!");
        }else{
            console.log("no id!");
        }
        //const idRef = firebase.collection("ids").doc(id);
        //await idRef.set({ts:Date.now()});
    }
    res.end()
  }
  



export default allowCors(handler)
  
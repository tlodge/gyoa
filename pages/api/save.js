import firebase from '../../lib/firebase';

/*export default async function handler(req, res) {

    console.log("incoming", req.method);
    res.status(200).json({success:true});

    if (req.method === "OPTIONS"){
        res.status({success:true});
        return;
    }
    if (req.method !== 'POST') {
        //res.status(405).send({ message: 'Only POST requests allowed' })
        ///return
    }
    const {id, script} = req.body;
    console.log("seen post", id, script);
    res.status(200).json({ success: true})
    if (id && script){
        const docRef = firebase.collection("scripts").doc(id);
        await docRef.set({...script, ts:Date.now()});
        res.status(200).json({ success: true})
    }else{
        res.status(405).send({message: "Malformed request"})
    }
}*/

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
        const {id="", script} = req.body;
        const docRef = firebase.collection("scripts").doc(id);
        await docRef.set({...script, ts:Date.now()});
    }
    res.end()
  }
  
  module.exports = allowCors(handler)
  
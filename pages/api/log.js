import admin from '../../lib/firebase';

export default async (req, res) => {
  const firebase = admin.firestore();
  const { id, type, data} = req.body;
  const ts = Date.now();
  const log = {ts,id,type,data}
  
  if (data && id && type){
    const scriptRef = firebase.collection("logs").doc()
    await scriptRef.set(log);
  }
  res.status(200).json({success:true});
}
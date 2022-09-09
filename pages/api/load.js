// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import admin from '../../lib/firebase';



export default async (req, res) => {
  const firebase = admin.firestore();
  const { id=""} = req.query;
  const script = await firebase.collection("scripts").doc(`${id}`).get();
  
  if (!script.empty){
    res.status(200).json(script.data())
  }else{
    res.status(200).json({ success: false})
  }
}

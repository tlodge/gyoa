import admin from '../../lib/firebase';



export default async (req, res) => {
  const firebase = admin.firestore();
  const { id=""} = req.query;
  const variants = [];

  const story = await firebase.collection("scripts").doc(`${id}`).get();
 

  if (!story.empty){
    variants.push({label: `listen to ${id}`, id, ts:story.data().ts});

    const explore = await firebase.collection("scripts").doc(`${id}-explore`).get();

    if (!explore.empty){
        variants.push({label: `explore ${id}`, id:`${id}-explore`, ts:explore.data().ts});
    }

    res.status(200).json(variants);

  }else{
    res.status(200).json({ success: false})
  }
}

import admin from '../../lib/firebase';



export default async (req, res) => {
  const firebase = admin.firestore();
  const { id=""} = req.query;
  const variants = [];

  if (id.trim()==""){
    res.status(200).json([]);
    return;
  }


    try  {
        const story = await firebase.collection("scripts").doc(`${id}`).get();
        if (!story.empty){
            const storydata = story.data();
            if (storydata){
                console.log("ok found story", id);
                variants.push({icon:"story.svg", label: `listen to`, id, ts:storydata.ts});
                console.log(variants);
            }
            const explore = await firebase.collection("scripts").doc(`${id}-explore`).get();
            if (!explore.empty){
                const exploredata = explore.data();
                if (exploredata){
                    variants.push({icon:"explore.svg", label: `explore`, id:`${id}-explore`, ts:exploredata.ts});
                }
            }
            res.status(200).json(variants);
        }else{
            console.log("could not find that stiry");
            res.status(200).json([])
        }
    }catch(err){
        console.log("hmm error", err);
        res.status(200).json([]);
    }
}

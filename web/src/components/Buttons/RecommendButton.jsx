import React, {useState, useContext, useEffect} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';
import {FeatureFlags, AuthContext} from '../../App';
import {db} from '../../firebase';

const RecommendButton = ({post}) => {
  const [recommended, setRecommended] = useState(false);
  const [recommendationID, setRecommendationID] = useState(undefined);
  // don't toggle when seting the current value
  const [firstRender, setFirstRender] = useState(true);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  const onClick = () => {
    setRecommended(!recommended);
  };

  // set the initial state of the recommendation
  useEffect(() => {
    if (user && !featureFlags.has('disable-cloud-firestore')) {
      db.collection(`users/$user.uid}/recommendations`)
        .where('recommendedResourceType', '==', 'post')
        .where('recommendedResourceID', '==', post.id)
        .get()
        .then((qs) => {
          if (!qs.empty) {
            qs.forEach((recommendation) => {
              setRecommendationID(recommendation.id);
            });
            setRecommended(true);
          }
          setFirstRender(false);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  // update the status of the recommendation
  useEffect(() => {
    if (!featureFlags.has('disable-cloud-firestore')) {
      if (user && !firstRender) {
        const recommendationCollection = db.collection(
          `users/${user.uid}/recommendations`
        );
        if (recommended) {
          recommendationCollection
            .add({
              resourceType: 'recommendation',
              recommendedResourceType: 'post',
              recommendedResourceID: post.id,
              recommendedResourceData: post,
            })
            .then((docRef) => {
              setRecommended(true);
              setRecommendationID(docRef.id);
            })
            .catch((err) => console.log(err));
        } else {
          recommendationCollection
            .doc(recommendationID)
            .delete()
            .then(() => setRecommendationID(undefined))
            .catch((err) => console.log(err));
        }
      }
    }
  }, [recommended]);

  return (
    <div className="button-container">
      <button className="action-button" href="/" onClick={onClick}>
        {recommended ? <RecommendIconSelected /> : <RecommendIconUnselected />}
        <span className="action-button-text">Recommend</span>
      </button>
    </div>
  );
};

export default RecommendButton;

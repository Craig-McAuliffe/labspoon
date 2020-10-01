import React, {useState, useContext, useEffect} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';
import {FeatureFlags, AuthContext} from '../../App';
import {db} from '../../firebase';

const RecommendButton = ({post}) => {
  const [recommendationID, setRecommendationID] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);

  const onClick = () => {
    if (!user) return;
    const recommendationCollection = db.collection(
      `users/${user.uid}/recommendations`
    );
    if (recommendationID === undefined) {
      recommendationCollection
        .add({
          resourceType: 'recommendation',
          recommendedResourceType: 'post',
          recommendedResourceID: post.id,
          recommendedResourceData: post,
        })
        .then((docRef) => {
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
  };

  // set the initial state of the recommendation
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    db.collection(`users/${user.uid}/recommendations`)
      .where('recommendedResourceType', '==', 'post')
      .where('recommendedResourceID', '==', post.id)
      .get()
      .then((qs) => {
        if (!qs.empty) {
          qs.forEach((recommendation) => {
            setRecommendationID(recommendation.id);
          });
        }
      })
      .catch((err) => console.log(err))
      .then(() => setLoading(false));
  }, [featureFlags, post.id, user]);

  return (
    <div className="button-container">
      <button className="action-button" href="/" onClick={onClick}>
        {recommendationID ? (
          <RecommendIconSelected />
        ) : (
          <RecommendIconUnselected />
        )}
        <span className="action-button-text">
          Recommend {loading ? '(loading...)' : ''}
        </span>
      </button>
    </div>
  );
};

export default RecommendButton;

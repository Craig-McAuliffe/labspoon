import React, {useState, useContext, useEffect, useRef} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';
import {FeatureFlags, AuthContext} from '../../App';
import {db} from '../../firebase';

const RecommendButton = ({
  bookmarkedResource,
  bookmarkedResourceType,
  bookmarkedResourceID,
  bookmarkedByCollection,
}) => {
  const [recommendationID, setRecommendationID] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [signUpPrompt, setSignUpPrompt] = useState(false);
  const featureFlags = useContext(FeatureFlags);
  const {user} = useContext(AuthContext);
  const signUpPromptRef = useRef();
  const locationPathName = useLocation().pathname;
  const onClick = () => {
    if (!user) {
      setSignUpPrompt(true);
      return;
    }
    const recommendationCollection = db.collection(
      `users/${user.uid}/recommendations`
    );
    if (recommendationID === undefined) {
      recommendationCollection
        .add({
          resourceType: 'recommendation',
          recommendedResourceType: bookmarkedResourceType,
          recommendedResourceID: bookmarkedResourceID,
          recommendedResourceData: bookmarkedResource,
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

  // Handle click on or outside signup prompt
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (signUpPromptRef.current) {
        if (
          !signUpPromptRef.current.contains(e.target) &&
          signUpPrompt === true
        )
          setSignUpPrompt(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
  });

  // set the initial state of the recommendation
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    db.collection(`users/${user.uid}/recommendations`)
      .where('recommendedResourceType', '==', bookmarkedResourceType)
      .where('recommendedResourceID', '==', bookmarkedResourceID)
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
  }, [featureFlags, bookmarkedResourceID, user]);

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
      {signUpPrompt ? (
        <div className="sign-up-prompt-center" ref={signUpPromptRef}>
          <Link
            to={{
              pathname: '/signup',
              state: {returnLocation: locationPathName},
            }}
          >
            Sign up to recommend this.
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default RecommendButton;

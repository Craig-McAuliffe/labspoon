import React, {useState, useContext, useEffect} from 'react';
import {
  RecommendIconUnselected,
  RecommendIconSelected,
} from '../../assets/PostActionIcons';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import firebase from 'firebase';
import {
  RECOMMENDATION,
  resourceTypeToCollection,
} from '../../helpers/resourceTypeDefinitions';
import {SignUpPopoverOverride} from '../Popovers/Popover';
import {userToUserRef} from '../../helpers/users';
import './Buttons.css';

const RecommendButton = ({
  recommendedResource,
  recommendedResourceType,
  recommendedResourceID,
  recommendedByCollection,
  setRecommendedCount,
}) => {
  const [isRecommended, setIsRecommended] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const {user, authLoaded, userProfile} = useContext(AuthContext);
  const onClick = async () => {
    if (submitting) return;
    setSubmitting(true);
    if (!user || !userProfile) {
      setSubmitting(false);
      return;
    }
    if (isRecommended === undefined) {
      setSubmitting(false);
      return;
    }
    const userRecommendationsCollection = db.collection(
      `users/${user.uid}/recommendations`
    );
    const recommendedResourceDoc = db.doc(
      `${resourceTypeToCollection(
        recommendedResourceType
      )}/${recommendedResourceID}`
    );
    if (isRecommended === false) {
      const batch = db.batch();
      batch.set(userRecommendationsCollection.doc(recommendedResourceID), {
        recommendedResourceType: recommendedResourceType,
        recommendedResourceID: recommendedResourceID,
        recommendedResourceData: recommendedResource,
        timestamp: new Date(),
      });
      batch.set(
        recommendedByCollection.doc(user.uid),
        userToUserRef(userProfile, user.uid)
      );
      batch.update(recommendedResourceDoc, {
        recommendedCount: firebase.firestore.FieldValue.increment(1),
      });
      batch
        .commit()
        .then(() => {
          setRecommendedCount((currentCount) => currentCount + 1);
          setSubmitting(false);
          setIsRecommended(true);
        })
        .catch((err) => {
          setSubmitting(false);
          console.error(err);
        });
    } else {
      await removeRecommendation(
        userRecommendationsCollection,
        recommendedResourceID,
        recommendedByCollection,
        recommendedResourceDoc,
        user.uid,
        setSubmitting,
        setIsRecommended,
        setRecommendedCount
      );
    }
  };

  // set the initial state of the recommendation
  useEffect(() => {
    if (!user && authLoaded === false) return;
    if (!user && authLoaded === true) {
      setLoading(false);
      return;
    }
    if (loading === false) return;
    recommendedByCollection
      .doc(user.uid)
      .get()
      .then((recommendedByDS) => {
        if (recommendedByDS.exists) {
          setIsRecommended(true);
        } else {
          setIsRecommended(false);
        }
        setLoading(false);
      })
      .catch((err) => console.error(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedResourceID, user]);

  if (
    !recommendedResource ||
    !recommendedResourceType ||
    !recommendedResourceID ||
    !recommendedByCollection
  )
    return null;
  if (!user)
    return (
      <SignUpPopoverOverride
        text="Sign up to recommend this."
        actionTaken={RECOMMENDATION}
        active={!!user}
      >
        <RecommendButtonContent
          onRecommend={onClick}
          isRecommended={isRecommended}
          loading={loading}
        />
      </SignUpPopoverOverride>
    );
  return (
    <RecommendButtonContent
      onRecommend={onClick}
      isRecommended={isRecommended}
      loading={loading}
    />
  );
};

const RecommendButtonContent = ({onRecommend, isRecommended, loading}) => (
  <div className="button-container">
    <button className="action-button" href="/" onClick={onRecommend}>
      {isRecommended ? <RecommendIconSelected /> : <RecommendIconUnselected />}
      <span className="action-button-text">
        Recommend {loading ? '(loading...)' : ''}
      </span>
    </button>
  </div>
);

export async function removeRecommendation(
  userRecommendationsCollection,
  recommendedResourceID,
  recommendedByCollection,
  recommendedResourceDoc,
  userID,
  setSubmitting,
  setIsRecommended,
  setRecommendedCount
) {
  const batch = db.batch();
  batch.delete(userRecommendationsCollection.doc(recommendedResourceID));
  batch.delete(recommendedByCollection.doc(userID));
  batch.update(recommendedResourceDoc, {
    recommendedCount: firebase.firestore.FieldValue.increment(-1),
  });
  return batch
    .commit()
    .then(() => {
      if (setRecommendedCount)
        setRecommendedCount((currentCount) => currentCount - 1);
      if (setIsRecommended) setIsRecommended(false);
      if (setSubmitting) setSubmitting(false);
    })
    .catch((err) => {
      console.error(err);
      if (setSubmitting) setSubmitting(false);
    });
}

export default RecommendButton;

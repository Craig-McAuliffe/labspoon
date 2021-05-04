import React, {useState, useContext, useEffect} from 'react';
import {RecommendIconUnselected} from '../../assets/PostActionIcons';
import {AuthContext} from '../../App';
import {db} from '../../firebase';
import firebase from 'firebase';
import {
  POST,
  RECOMMENDATION,
  resourceTypeToCollection,
} from '../../helpers/resourceTypeDefinitions';
import {SignUpPopoverOverride} from '../Popovers/Popover';
import {userToUserRef} from '../../helpers/users';
import {getPostListItemFromPost} from '../../helpers/posts';
import './Buttons.css';

const RecommendButton = ({
  recommendedResource,
  recommendedResourceType,
  recommendedResourceID,
  recommendedByCollection,
  backgroundShade,
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
      let resourceData;
      switch (recommendedResourceType) {
        case POST:
          resourceData = getPostListItemFromPost(recommendedResource);
        default:
          resourceData = getPostListItemFromPost(recommendedResource);
      }
      const batch = db.batch();
      batch.set(userRecommendationsCollection.doc(recommendedResourceID), {
        recommendedResourceType: recommendedResourceType,
        recommendedResourceID: recommendedResourceID,
        recommendedResourceData: resourceData,
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
        setIsRecommended
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
          backgroundShade={backgroundShade}
        />
      </SignUpPopoverOverride>
    );
  return (
    <RecommendButtonContent
      onRecommend={onClick}
      isRecommended={isRecommended}
      loading={loading}
      backgroundShade={backgroundShade}
    />
  );
};

const RecommendButtonContent = ({
  onRecommend,
  isRecommended,
  loading,
  backgroundShade,
}) => (
  <div className="button-container">
    <button
      className={`action-button-${backgroundShade ? backgroundShade : 'light'}${
        isRecommended ? '-selected' : '-unselected'
      }`}
      href="/"
      onClick={loading ? () => {} : onRecommend}
    >
      <RecommendIconUnselected />
      <span>Recommend</span>
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
  setIsRecommended
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
      if (setIsRecommended) setIsRecommended(false);
      if (setSubmitting) setSubmitting(false);
    })
    .catch((err) => {
      console.error(err);
      if (setSubmitting) setSubmitting(false);
    });
}

export default RecommendButton;

import React from 'react';

import PostList from "../../components/Posts/PostList/PostList";

function FeedPage() {
    return (
        <div>
            <p>You're authenticated and this is where the feed will be.</p>
            <PostList />            
        </div>
    );
}

export default FeedPage;
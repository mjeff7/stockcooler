// @flow

import React from 'react';

import { Input } from './input';
import { CloseButton } from './closeButton';
import { List } from './list';

export type CommentType = { id: mixed, comment: string };

export const Comment =
  ({comment, onClose}:
    {comment: string,
     onClose: () => void}
  ) =>
  <div className="comment">
    <span>{comment}</span>
    <CloseButton onClose={onClose}/>
  </div>;

export const CommentsPanel =
  ({comments, addComment, removeComment}: {
    comments: Array<CommentType>,
    addComment: string => void,
    removeComment: mixed => void}
  ) =>
  <div className="commentsPanel">
    <Input
      className="commentsPanel-input"
      onEnter={addComment} placeholder="Comment..."
    />
    <List>
      {comments.map(({id, comment}) =>
        <Comment
          key={id}
          comment={comment}
          onClose={() => removeComment(id)}/>)}
    </List>
  </div>;

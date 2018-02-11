// @flow

import { CloseButton } from './closeButton';
import { Input } from './input';
import { List } from './list';
import React from 'react';

export type CommentType = { id: mixed, comment: string };

type CommentProps = {
  comment: string,
  onClose: () => void
};

export const Comment = ({comment, onClose}: CommentProps) =>
  <div className="comment">
    <span>{comment}</span>
    <CloseButton onClose={onClose}/>
  </div>;

type CommentsPanelProps = {
  comments: Array<CommentType>,
  addComment: string => void,
  removeComment: mixed => void
};

export const CommentsPanel = (
  {comments, addComment, removeComment}: CommentsPanelProps
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

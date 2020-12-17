import React, {useMemo, useCallback, useState} from 'react';
import {useField} from 'formik';
import * as Yup from 'yup';
import {createEditor, Transforms, Node, Element as SlateElement} from 'slate';
import {Slate, Editable, withReact} from 'slate-react';
import {withHistory} from 'slate-history';

export default function HeaderAndBodyArticleInput({label, ...props}) {
  const [field, , helpers] = useField(props);
  const [value, setValue] = useState(JSON.parse(field.value));
  const editor = useMemo(
    () => withLayout(withHistory(withReact(createEditor()))),
    []
  );
  const renderElement = useCallback((props) => <Element {...props} />, []);

  field.onChange = (content) => {
    setValue(content);
    const json = JSON.stringify(content);
    helpers.setValue(json);
  };

  field.value = value;

  return (
    <Slate editor={editor} {...field} {...props}>
      <Editable renderElement={renderElement} autoFocus spellCheck />
    </Slate>
  );
}

const Element = ({attributes, children, element}) => {
  switch (element.type) {
    case 'title':
      return <h2 {...attributes}>{children}</h2>;
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    default:
      return null;
  }
};

export const initialValue = [
  {
    type: 'title',
    children: [{text: 'Title goes here'}],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Body goes here',
      },
    ],
  },
];

const withLayout = (editor) => {
  const {normalizeNode} = editor;

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length < 1) {
        const title = {type: 'title', children: [{text: 'Title goes here'}]};
        Transforms.insertNodes(editor, title, {at: path.concat(0)});
      }

      if (editor.children.length < 2) {
        const paragraph = {
          type: 'paragraph',
          children: [{text: 'Body goes here'}],
        };
        Transforms.insertNodes(editor, paragraph, {at: path.concat(1)});
      }

      for (const [child, childPath] of Node.children(editor, path)) {
        const type = childPath[0] === 0 ? 'title' : 'paragraph';

        if (SlateElement.isElement(child) && child.type !== type) {
          const newProperties = {type};
          Transforms.setNodes(editor, newProperties, {at: childPath});
        }
      }
    }

    return normalizeNode([node, path]);
  };

  return editor;
};

export const yupArticleValidation = Yup.array().test(
  'isArticle',
  // eslint-disable-next-line no-template-curly-in-string
  '${path} is not an article',
  (value) => {
    if (value.length !== 2) return false;

    // Check title is not empty
    if (value[0].type !== 'title') return false;
    if (value[0].children.length !== 1) return false;
    if (value[0].children[0].text.length === 0) return false;

    // Check body is not empty
    if (value[1].type !== 'paragraph') return false;
    if (value[1].children.length !== 1) return false;
    if (value[1].children[0].text.length === 0) return false;

    return true;
  }
);

// assumes input is properly validated
export function splitTitle(jsonString) {
  const article = JSON.parse(jsonString);
  const title = article[0].children[0].text;
  return title, JSON.stringify(article.slice(1));
}

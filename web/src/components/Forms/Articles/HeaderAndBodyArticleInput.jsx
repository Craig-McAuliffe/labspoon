import React, {useMemo, useCallback} from 'react';
import {useField} from 'formik';
import * as Yup from 'yup';
import {createEditor, Transforms, Node, Element as SlateElement} from 'slate';
import {Slate, Editable, withReact} from 'slate-react';
import {withHistory} from 'slate-history';
import InputError from '../InputError';

import './HeaderAndBodyArticleInput.css';

export default function HeaderAndBodyArticleInput({
  label,
  customPlaceholderText,
  containerRef,
  shouldAutoFocus,
  minHeight = 100,
  ...props
}) {
  const [field, meta, helpers] = useField(props);
  const editor = useMemo(
    () => withLayoutNoTitle(withHistory(withReact(createEditor()))),
    []
  );
  const renderElement = useCallback((props) => <Element {...props} />, []);

  field.onChange = (content) => {
    helpers.setValue(content);
    if (content[0] && content[0].children[0].text === '') return;
    if (!meta.touched) helpers.setTouched(true);
  };

  return (
    <>
      {label && (
        <label htmlFor={props.name} className="form-input-label">
          <h4>{label}</h4>
        </label>
      )}
      <div
        className="editor-container-no-title"
        ref={containerRef}
        style={{minHeight: minHeight}}
      >
        <Slate editor={editor} {...field} {...props}>
          <Editable
            renderElement={renderElement}
            autoFocus={shouldAutoFocus}
            spellCheck
            placeholder={customPlaceholderText}
          />
        </Slate>
      </div>
      {meta.error && meta.touched ? <InputError error={meta.error} /> : <></>}
    </>
  );
}

const Element = ({attributes, children, element}) => {
  switch (element.type) {
    case 'paragraph':
      return <p {...attributes}>{children}</p>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const initialValueNoTitle = [
  {
    type: 'paragraph',
    children: [
      {
        text: '',
      },
    ],
  },
];

const withLayoutNoTitle = (editor) => {
  const {normalizeNode} = editor;

  editor.normalizeNode = ([node, path]) => {
    if (path.length === 0) {
      if (editor.children.length < 1) {
        const paragraph = {
          type: 'paragraph',
          children: [{text: ''}],
        };

        Transforms.insertNodes(editor, paragraph, {at: path.concat(0)});
      }
      for (const [child, childPath] of Node.children(editor, path)) {
        const type = 'paragraph';

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

export const yupRichBodyOnlyValidation = (
  characterLimit = 800,
  paragraphLimit = 10
) =>
  Yup.array()
    .test(
      'isEmptyBody',
      // eslint-disable-next-line no-template-curly-in-string
      'You must write something!',
      (value) => {
        // Check body is not empty
        if (!value) return false;
        if (!value[0]) return false;
        if (value[0].type !== 'paragraph') return false;
        if (value[0].children === undefined) return false;
        if (value[0].children[0].text === undefined) return false;
        if (value[0].children[0].text.length === 0) return false;

        return true;
      }
    )
    .test(
      'isTooLong',
      // eslint-disable-next-line no-template-curly-in-string
      `Too long. It must have fewer than ${characterLimit} characters.`,
      (value) => {
        if (value[0].children === undefined) return false;
        if (value[0].children[0].text === undefined) return false;
        if (
          value.reduce((accumulator, section) => {
            if (!section.children[0].text) return accumulator;
            return accumulator + section.children[0].text.length;
          }, 0) > characterLimit
        )
          return false;
        return true;
      }
    )
    .test(
      'isTooLong',
      // eslint-disable-next-line no-template-curly-in-string
      `Too many paragraphs. Max ${paragraphLimit}.`,
      (value) => {
        if (value === undefined) return false;
        if (value.length > paragraphLimit) return false;
        return true;
      }
    );

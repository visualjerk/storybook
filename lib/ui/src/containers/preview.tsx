import { PREVIEW_URL } from 'global';
import React from 'react';
import memoize from 'memoizerific';

import { Consumer, Combo } from '@storybook/api';

import { Story } from '@storybook/api/dist/lib/stories';
import { Preview } from '../components/preview/preview';

const mergeRefs = memoize(1)(refs => ({
  ...refs,
  'storybook-preview-iframe': { id: 'storybook-preview-iframe', url: PREVIEW_URL || 'iframe.html' },
}));

const nonAlphanumSpace = /[^a-z0-9 ]/gi;
const doubleSpace = /\s\s/gi;
const replacer = match => ` ${match} `;
const addExtraWhiteSpace = input =>
  input.replace(nonAlphanumSpace, replacer).replace(doubleSpace, ' ');

const getDescription = (storiesHash, storyId) => {
  const storyInfo = storiesHash[storyId];
  return storyInfo ? addExtraWhiteSpace(`${storyInfo.kind} - ${storyInfo.name}`) : '';
};

const mapper = ({ api, state }: Combo) => {
  const { layout, location, customQueryParams, storiesHash, storyId } = state;
  const { parameters } = storiesHash[storyId] || {};

  return {
    api,
    frames: mergeRefs(state.refs),
    story: api.getData(storyId) as Story | undefined,
    getElements: api.getElements,
    options: layout,
    description: getDescription(storiesHash, storyId),
    ...api.getUrlState(),
    queryParams: customQueryParams,
    docsOnly: parameters && parameters.docsOnly,
    location,
    parameters,
  };
};

const PreviewConnected = React.memo(props => (
  <Consumer filter={mapper}>
    {(fromState: ReturnType<typeof mapper>) => {
      return (
        <Preview {...props} {...fromState} customCanvas={fromState.api.renderPreview} withLoader />
      );
    }}
  </Consumer>
));
PreviewConnected.displayName = 'PreviewConnected';

export default PreviewConnected;

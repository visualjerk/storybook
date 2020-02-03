import React, { Fragment, PureComponent, FunctionComponent, useEffect } from 'react';
import memoize from 'memoizerific';
import { styled } from '@storybook/theming';
import { Consumer, API } from '@storybook/api';
import { SET_CURRENT_STORY } from '@storybook/core-events';
import addons, { types } from '@storybook/addons';
import merge from '@storybook/api/dist/lib/merge';
import { Loader } from '@storybook/components';

import { Helmet } from 'react-helmet-async';

import { InceptionRef } from '@storybook/api/dist/modules/refs';
import { StoriesHash, Story } from '@storybook/api/dist/lib/stories';
import { Toolbar } from './toolbar';

import * as S from './components';

import { ZoomProvider, ZoomConsumer } from './zoom';

import { IFrame } from './iframe';
import { ViewMode, ActualPreviewProps, Wrapper, PreviewProps } from './preview-types';
import { getTools } from './getTools';

export const DesktopOnly = styled.span({
  // Hides full screen icon at mobile breakpoint defined in app.js
  '@media (max-width: 599px)': {
    display: 'none',
  },
});

export const stringifyQueryParams = (queryParams: Record<string, any>): string =>
  Object.entries(queryParams).reduce((acc, [k, v]) => {
    return `${acc}&${k}=${v}`;
  }, '');

const renderIframe = (
  viewMode: ViewMode,
  currentUrl: string,
  queryParams: {},
  scale,
  frames: Record<string, InceptionRef & { data: StoriesHash }>,
  storyId = ''
) => (
  <Fragment key="iframe">
    {Object.entries(frames).map(([id, { url }]) => (
      <IFrame
        key={id}
        id={id}
        isActive={url === currentUrl}
        data-is-storybook
        title={id || 'preview'}
        src={`${url}?id=${storyId}&viewMode=${viewMode}${stringifyQueryParams(queryParams)}`}
        allowFullScreen
      />
    ))}
  </Fragment>
);

export const getElementList = memoize(10)((getFn, type, base) =>
  base.concat(Object.values(getFn(type)))
);

const ActualPreview: FunctionComponent<ActualPreviewProps> = ({
  wrappers,
  viewMode = 'story',
  storyId,
  active,
  scale,
  queryParams,
  customCanvas,
  currentUrl,
  frames,
}: ActualPreviewProps) => {
  const base = customCanvas
    ? customCanvas(viewMode, currentUrl, scale, queryParams, frames, storyId)
    : renderIframe(viewMode, currentUrl, scale, queryParams, frames, storyId);
  return wrappers.reduceRight(
    (acc, wrapper, index) => wrapper.render({ index, children: acc, storyId, active }),
    base
  );
};

const FramesWrapper = styled.div<{ scale: number }>(({ theme, scale = 1 }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  background: theme.background.content,
  width: `${scale * 100}%`,
  height: `${scale * 100}%`,
  transform: `scale(${1 / scale})`,
  transformOrigin: 'top left',
  transition: 'none',
}));

const defaultWrappers: Wrapper[] = [
  {
    render: p => (
      <ZoomConsumer>
        {({ value }: { value: number }) => (
          <FramesWrapper id="storybook-preview-wrapper" hidden={!p.active} scale={value}>
            {p.children}
          </FramesWrapper>
        )}
      </ZoomConsumer>
    ),
  },
];

const getUrl = story => {
  return (story && story.ref && story.ref.url) || `iframe.html`;
};

const getDocumentTitle = description => {
  return description ? `${description} ⋅ Storybook` : 'Storybook';
};

const mapper = ({ state }) => ({
  loading: !state.storiesConfigured,
});

const EmitOnChannel: FunctionComponent<{ viewMode: ViewMode; story: Story; api: API }> = ({
  api,
  viewMode,
  story,
}) => {
  useEffect(() => {
    api.emit(SET_CURRENT_STORY, { storyId: story.knownAs || story.id, viewMode });
  }, [story, viewMode]);
  return null;
};

class Preview extends PureComponent<PreviewProps> {
  render() {
    const {
      path,
      location,
      viewMode = 'story',
      storyId,
      queryParams,
      getElements,
      api,

      docsOnly = false,
      customCanvas,
      options,
      description,
      parameters,
      frames = {},
      story,
      withLoader,
    } = this.props;

    const currentUrl = getUrl(story);
    const toolbarHeight = options.isToolshown ? 40 : 0;
    const wrappers = getElementList(getElements, types.PREVIEW, defaultWrappers);
    let panels = getElementList(getElements, types.TAB, [
      {
        route: p => `/story/${p.storyId}`,
        match: p => p.viewMode && p.viewMode.match(/^(story|docs)$/),
        render: p => {
          const props = {
            viewMode,
            active: p.active,
            wrappers,
            story,
            storyId,
            scale: 1,
            queryParams,
            customCanvas,
          };

          return (
            <>
              {withLoader && (
                <Consumer filter={mapper}>
                  {(state: ReturnType<typeof mapper>) =>
                    state.loading ? <Loader role="progressbar" /> : null
                  }
                </Consumer>
              )}
              <ActualPreview {...props} frames={frames} currentUrl={currentUrl} />
            </>
          );
        },

        title: 'Canvas',
        id: 'canvas',
      },
    ]);

    const { previewTabs } = addons.getConfig();
    const parametersTabs = parameters ? parameters.previewTabs : undefined;

    if (previewTabs || parametersTabs) {
      // deep merge global and local settings
      const tabs = merge(previewTabs, parametersTabs);
      const arrTabs = Object.keys(tabs).map((key, index) => ({
        index,
        ...(typeof tabs[key] === 'string' ? { title: tabs[key] } : tabs[key]),
        id: key,
      }));
      panels = panels
        .filter(panel => {
          const t = arrTabs.find(tab => tab.id === panel.id);
          return t === undefined || t.id === 'canvas' || !t.hidden;
        })
        .map((panel, index) => ({ ...panel, index }))
        .sort((p1, p2) => {
          const tab_1 = arrTabs.find(tab => tab.id === p1.id);
          const index_1 = tab_1 ? tab_1.index : arrTabs.length + p1.index;
          const tab_2 = arrTabs.find(tab => tab.id === p2.id);
          const index_2 = tab_2 ? tab_2.index : arrTabs.length + p2.index;
          return index_1 - index_2;
        })
        .map(panel => {
          const t = arrTabs.find(tab => tab.id === panel.id);
          if (t) {
            return {
              ...panel,
              title: t.title || panel.title,
              disabled: t.disabled,
              hidden: t.hidden,
            };
          }
          return panel;
        });
    }
    const { left, right } = getTools(
      getElements,
      queryParams,
      panels,
      api,
      docsOnly,
      options,
      storyId,
      viewMode,
      location,
      path,
      currentUrl
    );

    return (
      <ZoomProvider>
        <Fragment>
          {story ? <EmitOnChannel viewMode={viewMode} story={story} api={api} /> : null}
          {viewMode === 'story' && (
            <Helmet key="description">
              <title>{getDocumentTitle(description)}</title>
            </Helmet>
          )}
          {(left || right) && (
            <Toolbar key="toolbar" shown={options.isToolshown} border>
              <Fragment key="left">{left}</Fragment>
              <Fragment key="right">{right}</Fragment>
            </Toolbar>
          )}
          <S.FrameWrap key="frame" offset={toolbarHeight}>
            {panels.map(p => (
              <Fragment key={p.id || p.key}>
                {p.render({ active: p.match({ storyId, viewMode, location, path }) })}
              </Fragment>
            ))}
          </S.FrameWrap>
        </Fragment>
      </ZoomProvider>
    );
  }
}

export { Preview };

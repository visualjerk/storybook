import window from 'global';
import React, { Fragment } from 'react';
import memoize from 'memoizerific';
import copy from 'copy-to-clipboard';
import { API, State } from '@storybook/api';
import { types } from '@storybook/addons';
import { Icons, IconButton, TabButton, TabBar, Separator } from '@storybook/components';
import { ZoomConsumer, Zoom } from './zoom';
import { PreviewProps, Panel } from './preview-types';
import { getElementList, DesktopOnly, stringifyQueryParams } from './preview';
import * as S from './components';

export const getTools = memoize(10)(
  (
    getElements: PreviewProps['getElements'],
    queryParams: PreviewProps['queryParams'],
    panels: Panel[],
    api: API,
    docsOnly: boolean,
    options: PreviewProps['options'],
    storyId: PreviewProps['storyId'],
    viewMode: State['viewMode'],
    location: State['location'],
    path: string,
    currentUrl: string
  ) => {
    const nonHiddenPanels = panels.filter(p => p.hidden !== true);
    const tools = getElementList(getElements, types.TOOL, [
      nonHiddenPanels.length > 1 ||
      (viewMode && nonHiddenPanels.length === 1 && nonHiddenPanels[0].id !== viewMode)
        ? {
            render: () => (
              <Fragment>
                <TabBar key="tabs">
                  {nonHiddenPanels.map((t, index) => {
                    const to = t.route({ storyId, viewMode, path, location });
                    const isActive = path === to;
                    return (
                      <S.UnstyledLink key={t.id || `l${index}`} to={to}>
                        <TabButton active={isActive}>{t.title}</TabButton>
                      </S.UnstyledLink>
                    );
                  })}
                </TabBar>
                <Separator />
              </Fragment>
            ),
          }
        : null,
      {
        match: p => p.viewMode === 'story',
        render: () => (
          <Fragment>
            <ZoomConsumer>
              {({ set, value }) => (
                <Zoom key="zoom" current={value} set={v => set(value * v)} reset={() => set(1)} />
              )}
            </ZoomConsumer>
            <Separator />
          </Fragment>
        ),
      },
    ]);
    const extraTools = getElementList(getElements, types.TOOLEXTRA, [
      {
        match: p => p.viewMode === 'story',
        render: () => (
          <DesktopOnly>
            <IconButton
              key="full"
              onClick={() => api.toggleFullscreen()}
              title={options.isFullscreen ? 'Exit full screen' : 'Go full screen'}
            >
              <Icons icon={options.isFullscreen ? 'close' : 'expand'} />
            </IconButton>
          </DesktopOnly>
        ),
      },
      {
        match: p => p.viewMode === 'story',
        render: () => (
          <IconButton
            key="opener"
            href={`${currentUrl}?id=${storyId}${stringifyQueryParams(queryParams)}`}
            target="_blank"
            title="Open canvas in new tab"
          >
            <Icons icon="share" />
          </IconButton>
        ),
      },
      {
        match: p => p.viewMode === 'story',
        render: () => (
          <IconButton
            key="copy"
            onClick={() =>
              copy(
                `${window.location.origin}${
                  window.location.pathname
                }${currentUrl}?id=${storyId}${stringifyQueryParams(queryParams)}`
              )
            }
            title="Copy canvas link"
          >
            <Icons icon="copy" />
          </IconButton>
        ),
      },
    ]);
    const filter = item =>
      item &&
      (!item.match ||
        item.match({
          storyId,
          viewMode: docsOnly && viewMode === 'story' ? 'docs' : viewMode,
          location,
          path,
        }));
    const displayItems = list =>
      list.reduce(
        (acc, item, index) =>
          item ? (
            <Fragment key={item.id || item.key || `f-${index}`}>
              {acc}
              {item.render() || item}
            </Fragment>
          ) : (
            acc
          ),
        null
      );
    const left = displayItems(tools.filter(filter));
    const right = displayItems(extraTools.filter(filter));
    return { left, right };
  }
);

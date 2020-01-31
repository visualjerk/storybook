import { types } from '@storybook/addons';
import { API, State } from '@storybook/api';
import { InceptionRef } from '@storybook/api/dist/modules/refs';
import { StoriesHash, Story } from '@storybook/api/dist/lib/stories';

export type Noop = () => void;

export type ViewMode = State['viewMode'];

export type PreviewStory = Story;

export type CustomCanvas = (
  viewMode: ViewMode,
  currentUrl: string,
  scale: number,
  queryParams: Record<string, any>,
  frames: Record<string, InceptionRef & { data: StoriesHash }>,
  storyId?: string
) => JSX.Element;

export type PreviewElement = {
  id: string;
  type: types;
  title: string;
  route: ({ storyId: string }) => string;
  match: ({ viewMode: ViewMode }) => boolean;
  render: Noop;
};

export interface PreviewPropsBase {
  customCanvas?: CustomCanvas;
  frames?: Record<string, InceptionRef & { data: StoriesHash }>;
  queryParams: Record<string, any>;
  storyId?: string;
  story?: PreviewStory;
  docsOnly?: boolean;
  viewMode?: ViewMode;
}
export interface PreviewProps extends PreviewPropsBase {
  description?: string;
  api: API;
  story?: PreviewStory;
  path: string;
  location: State['location'];
  getElements: API['getElements'];
  options: {
    isFullscreen: boolean;
    isToolshown: boolean;
  };
  withLoader: boolean;
  parameters: {
    previewTabs: Record<
      string,
      null | Partial<{ title: string; hidden: boolean; disabled: boolean }>
    >;
  } & Record<string, any>;
}
export interface Wrapper {
  render: (child: {
    index: number;
    children: React.ReactNode;
    storyId?: string;
    active: boolean;
  }) => JSX.Element;
}
export interface ListItem {
  id: string;
  key: string | number;
  render: () => React.ReactNode;
}

export interface ActualPreviewProps extends PreviewPropsBase {
  wrappers: Wrapper[];
  active: boolean;
  scale: number;
  frames: Record<string, InceptionRef & { data: StoriesHash }>;
  currentUrl: string;
}

export interface RouteParameter {
  storyId?: string;
  viewMode: ViewMode;
  location: State['location'];
  path: string;
}

export interface Panel {
  match: (p: RouteParameter) => boolean;
  route: (p: RouteParameter) => string;
  id: string;
  title: string;
  viewMode: ViewMode;
  hidden?: boolean;
}

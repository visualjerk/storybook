import React, { FunctionComponent, Fragment } from 'react';

import { styled } from '@storybook/theming';
import { ScrollArea } from '@storybook/components';
import { State } from '@storybook/api';

import SidebarHeading, { SidebarHeadingProps } from './SidebarHeading';
import SidebarStories from './SidebarStories';

const Heading = styled(SidebarHeading)<SidebarHeadingProps>({
  padding: '20px 20px 12px',
});

const Stories = styled(({ className, ...rest }) => (
  <SidebarStories className={className} {...rest} />
))(({ loading }) => (loading ? { marginTop: 8, overflow: 'hidden' } : { overflow: 'hidden' }));

const Container = styled.nav({
  position: 'absolute',
  zIndex: 1,
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
});

const CustomScrollArea = styled(ScrollArea)({
  '.simplebar-track.simplebar-vertical': {
    right: 4,
  },
});

export interface SidebarProps {
  stories: State['StoriesHash'];
  menu: any[];
  storyId?: string;
  menuHighlighted?: boolean;
  loading?: boolean;
  refs: State['refs'];
}

const Sidebar: FunctionComponent<SidebarProps> = ({
  storyId,
  stories,
  refs,
  menu,
  menuHighlighted = false,
  loading = false,
}) => (
  <Container className="container sidebar-container">
    <CustomScrollArea vertical>
      <Heading className="sidebar-header" menuHighlighted={menuHighlighted} menu={menu} />
      <Stories stories={stories} storyId={storyId} loading={loading} />
      {Object.values(refs).map(item => (
        <Fragment key={item.id}>
          <Stories stories={item.data} storyId={storyId} loading={!Object.keys(item.data).length} />
        </Fragment>
      ))}
    </CustomScrollArea>
  </Container>
);

export default Sidebar;

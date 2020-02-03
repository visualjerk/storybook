import { document } from 'global';
import React, { Component, CSSProperties } from 'react';

import { styled } from '@storybook/theming';

interface IFrameProps {
  id: string;
  isActive: boolean;
  title: string;
  src: string;
  allowFullScreen: boolean;
}

interface StyledIFrameProps {
  scrolling: string;
  id: string;
  title: string;
  src: string;
  startedActive: boolean;
  allowFullScreen: boolean;
}

const StyledIframe = styled.iframe(
  {
    position: 'absolute',
    display: 'block',
    boxSizing: 'content-box',
    height: '100%',
    width: '100%',
    border: '0 none',
    transition: 'all .3s, background-position 0s',
    backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px',
  },
  ({ startedActive }: StyledIFrameProps) => ({
    visibility: startedActive ? 'visible' : 'hidden',
  })
);

export class IFrame extends Component<IFrameProps, {}> {
  iframe: HTMLIFrameElement | null;

  componentDidMount() {
    const { id } = this.props;
    this.iframe = (document as Document).getElementById(id) as HTMLIFrameElement;
  }

  shouldComponentUpdate({ isActive }: IFrameProps) {
    const { isActive: wasActive } = this.props;

    if (isActive !== wasActive) {
      this.setIframeStyle({
        visibility: isActive ? 'visible' : 'hidden',
      });
    }

    // this component renders an iframe, which gets updates via post-messages
    // never update this component, it will cause the iframe to refresh
    return false;
  }

  setIframeStyle(style: CSSProperties) {
    try {
      return this.iframe !== null && Object.assign(this.iframe.style, style);
    } catch (e) {
      return false;
    }
  }

  render() {
    const { id, title, src, allowFullScreen, isActive, ...rest } = this.props;
    return (
      <StyledIframe
        scrolling="yes"
        id={id}
        title={title}
        src={src}
        startedActive={isActive}
        allowFullScreen={allowFullScreen}
        {...rest}
      />
    );
  }
}

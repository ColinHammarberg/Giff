/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';

const CustomLightTooltip = withStyles(() => ({
  tooltip: {
    backgroundColor: 'rgba(244, 20, 155, 1)',
    color: '#000000',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    fontSize: 15,
    padding: '16px',
    fontWeight: 400,
    fontFamily: 'Staatliches',
    lineHeight: '20px',
    margin: '8px 0',
    zIndex: '2001',
  },
}))(Tooltip);

const LightTooltip = (props) => {
  const title = props.title;
  const children = props.children;
  if (!title) {
    return children;
  }
  if (typeof title === 'string') {
    const allProps = { ...props };
    allProps.title = <>{title}</>;
    return <CustomLightTooltip {...allProps}>{children}</CustomLightTooltip>;
  }

  return <CustomLightTooltip {...props}>{children}</CustomLightTooltip>;
};

export default LightTooltip;

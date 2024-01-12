import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import './Tabs.scss';
import LightTooltip from '../overall/LightToolTip';

const convertString = (str, className = 'tabs') => {
  const value = `${className} ${str}`;
  return value?.replace(/\s/g, '-').toLowerCase();
};

const getTabs = memoizeOne((tabs, activeIndex) => {
  return tabs.map((label, i) => {
    return { label, active: i === activeIndex };
  });
});

export const useTabs = (initialTabs, defaultActiveIndex = 0) => {
  const [tabs, setTabs] = React.useState(initialTabs);
  const [activeTab, setActiveTab] = React.useState(defaultActiveIndex);
  const changeTab = React.useCallback((index) => {
    setActiveTab(index);
  }, []);
  return {
    tabs: getTabs(tabs, activeTab),
    changeTab,
    activeTab,
    setTabs,
    setActiveTab,
  };
};

const Tabs = ({ tabs, onChange, variant, className, disabled }) => {
  return (
    <ul className={`tabs ${variant} `}>
      {tabs?.map((tab, i) => (
        <LightTooltip
          disableHoverListener={!disabled[i]}
          title="There is no example email available for this gif."
        >
          <li
            key={i}
            className={`tab-item ${tab.active ? 'active' : ''} ${
              disabled[i] ? 'disabled' : ''
            } ${className} ${!tab.label ? 'tab-item-hidden' : ''}`}
          >
            <div
              className="tab-wrapper"
              data-id={convertString(tab.label, variant)}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!disabled[i]) {
                  onChange(i);
                }
              }}
            >
              <span className="tab-label">{tab.label}</span>
            </div>
          </li>
        </LightTooltip>
      ))}
    </ul>
  );
};


Tabs.propTypes = {
  tabs: PropTypes.instanceOf(Array),
  onChange: PropTypes.func,
  variant: PropTypes.string,
};

Tabs.defaultProps = {
  variant: 'dark',
};

export default Tabs;

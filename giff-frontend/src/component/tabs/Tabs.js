import React from 'react';
import PropTypes from 'prop-types';
import memoizeOne from 'memoize-one';
import './Tabs.scss';
import LightTooltip from '../overall/LightToolTip';

const getTabs = memoizeOne((tabs, activeIndex) => {
  return tabs.map((label, i) => {
    return { label, active: i === activeIndex };
  });
});

export const useTabs = (initialTabs) => {
  const [tabs, setTabs] = React.useState(initialTabs);
  const [activeTab, setActiveTab] = React.useState(0);
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

const Tabs = ({ tabs, onChange, variant, className, disabled, gifLibrary, selectedGif }) => {
  return (
    <ul className={`tabs ${variant} `}>
      {tabs?.map((tab, i) => (
        <LightTooltip
        disableHoverListener={!disabled[i]}
        title={
          i === 1 && selectedGif?.selectedColor
            ? "Selected color already selected"
            : (gifLibrary
                ? "Currently cutting frames is not available in edit mode."
                : "There is no example email available for this gif.")
        }
        >
          <li
            key={i}
            className={`tab-item ${tab.active ? 'active' : ''} ${
              disabled[i] ? 'disabled' : ''
            } ${className} ${!tab.label ? 'tab-item-hidden' : ''}`}
            onClick={(event) => {
              if (!disabled[i]) {
                event.preventDefault();
                event.stopPropagation();
                onChange(i);
              }
            }}
          >
            <div className="tab-wrapper">
              <span className="tab-label">{tab.label.label}</span>
              {tab.label.icon}
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

import React, { useState } from 'react';
import { IconButton, Popover, Checkbox, List, ListItem } from "@mui/material";
import filterIcon from '../../resources/filter.png';
import './Filter.scss';
import Tag from '../overall/Tag';
import LightTooltip from '../overall/LightToolTip';

function Filter({ tags, onTagSelectionChange }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);

    React.useEffect(() => {
        onTagSelectionChange(selectedTags);
    }, [selectedTags, onTagSelectionChange]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagChange = (tag) => {
        setSelectedTags(prevSelectedTags => {
            if (prevSelectedTags.some(t => t.value === tag.value)) {
                return prevSelectedTags.filter(t => t.value !== tag.value);
            } else {
                return [...prevSelectedTags, tag];
            }
        });
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className="filter">
            <LightTooltip title="Filter on tags">
                <IconButton onClick={handleClick}>
                <img src={filterIcon} alt="Filter" />
                </IconButton>
            </LightTooltip>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                className="filterPopover"
            >
                <List>
                    {tags?.map((tag, index) => (
                        <ListItem key={index}>
                            <Tag label={tag.value} color={tag.color} />
                            <Checkbox
                                checked={selectedTags.some(t => t.value === tag.value)}
                                onChange={() => handleTagChange(tag)}
                            />
                        </ListItem>
                    ))}
                </List>
            </Popover>
        </div>
    );
}

export default Filter;

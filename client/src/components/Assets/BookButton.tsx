import React, { useState, useRef } from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';
import BusinessIcon from '@material-ui/icons/Business';

import { OurButton } from '../../styles/MaterialComponents';

import BookButtonStyles from './BookButton.styles';

// Types
type Props = {
  onClick: (withParking: boolean) => void;
  parkingQuota: number;
  parkingAvailable: number;
  buttonsLoading: boolean;
};

// Component
const BookButton: React.FC<Props> = (props) => {
  // Local state
  const [open, setOpen] = useState(false);

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  // Render
  return (
    <>
      {props.parkingQuota > 0 ? (
        <BookButtonStyles>
          <ButtonGroup variant="contained" color="primary" ref={anchorRef}>
            <OurButton
              onClick={() => setOpen((prevOpen) => !prevOpen)}
              size="small"
              variant="contained"
              color="secondary"
              disabled={props.buttonsLoading}
              endIcon={<ArrowDropDownIcon />}
            >
              Book
            </OurButton>
          </ButtonGroup>

          <Popper open={open} anchorEl={anchorRef.current} disablePortal className="popper">
            <Paper square elevation={2}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList disablePadding>
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.onClick(false);
                    }}
                  >
                    <BusinessIcon className="icon" /> Office only
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpen(false);
                      props.onClick(true);
                    }}
                    disabled={props.parkingAvailable <= 0}
                  >
                    <EmojiTransportationIcon className="icon" /> + Parking
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Popper>
        </BookButtonStyles>
      ) : (
        <OurButton
          size="small"
          variant="contained"
          color="secondary"
          disabled={props.buttonsLoading}
          onClick={() => props.onClick(false)}
        >
          Book
        </OurButton>
      )}
    </>
  );
};

export default BookButton;

import React from 'react';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { ArrowDropDown, Block } from '@material-ui/icons';
import EmojiTransportationIcon from '@material-ui/icons/EmojiTransportation';
import BusinessIcon from '@material-ui/icons/Business';

import { OurButton } from '../../styles/MaterialComponents';

type Props = {
  onClick: (args: { withParking: boolean }) => void;
  availableCarPark: number;
  buttonsLoading: boolean;
};

const BookButton: React.FC<Props> = (props) => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    setOpen(false);
    props.onClick({ withParking: index === 1 });
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  return (
    <>
      {props.availableCarPark ? (
        <>
          <ButtonGroup
            variant="contained"
            color="primary"
            ref={anchorRef}
            aria-label="split button"
          >
            <OurButton
              onClick={handleToggle}
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="select merge strategy"
              aria-haspopup="menu"
              size="small"
              variant="contained"
              color="secondary"
              disabled={props.buttonsLoading}
            >
              Book
              <ArrowDropDown />
            </OurButton>
          </ButtonGroup>
          <Popper
            style={{ zIndex: 1 }}
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper elevation={5}>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" disablePadding>
                      <MenuItem
                        selected={0 === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, 0)}
                      >
                        <BusinessIcon style={{ marginRight: '1rem' }} /> Office only
                      </MenuItem>
                      <MenuItem
                        selected={1 === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, 1)}
                      >
                        <EmojiTransportationIcon style={{ marginRight: '1rem' }} /> + Parking
                      </MenuItem>
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </>
      ) : (
        <OurButton
          size="small"
          variant="contained"
          color="secondary"
          disabled={props.buttonsLoading}
          onClick={() => props.onClick({ withParking: false })}
        >
          Book
        </OurButton>
      )}
    </>
  );
};

export default BookButton;

import styled from 'styled-components';

export default styled.div`
  .ie-banner {
    background: #fff4e5;
    color: #663c00;
    overflow: hidden;
    padding: 0;
    position: relative;
    z-index: 2;
    max-height: 0px;
    transition: 1s;
    transform: translate3d(0, 0, 0);
  }

  .ie-banner--open {
    max-height: 220px;
  }

  .ie-banner__close__a {
    height: 20px;
    width: 20px;
    margin-left: 1rem;
    display: flex;
    align-items: center;
  }

  .ie-banner__p {
    font-size: 14px;
    line-height: 18px;
    margin: 0;
  }

  .container {
    padding: 1rem 1.4rem;
    display: flex;
    align-items: center;

    > .button-container {
      ${(props) => props.theme.breakpoints.down('sm')} {
        margin-right: 8%; 
      }
      display: flex;
      align-items: flex-end;
    }
  }
`;

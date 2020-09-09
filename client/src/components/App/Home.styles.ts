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
    position: absolute;
    top: 20px;
    right: 20px;
    height: 20px;
    width: 20px;
  }

  .ie-banner__p {
    font-size: 14px;
    line-height: 18px;
    margin: 1rem 0 2rem 0.5rem;
  }
`;

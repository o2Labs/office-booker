import styled from 'styled-components';

export default styled.div`
  position: fixed;

  z-index: 999;

  top: 2.5rem;
  right: -5rem;
  left: auto;

  width: 20rem;

  transform: rotate(45deg);

  background: red;
  box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.3);

  text-align: center;
  font-size: 1.6rem;
  line-height: 4rem;
  color: #f0f0f0;
  font-weight: bold;

  > p {
    margin: 0;
  }
`;

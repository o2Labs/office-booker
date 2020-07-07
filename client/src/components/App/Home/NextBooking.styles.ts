import styled from 'styled-components';

export default styled.div`
  background: #b5ddec;

  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2.4rem 2rem 3rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 3.4rem 3rem 4rem;
  }

  text-align: center;

  > h2 {
    margin: 0 0 1.4rem;

    color: #0019a5;
    font-size: 1.8rem;
    font-weight: 400;
  }

  > h3 {
    margin: 0 0 2rem;

    font-weight: 500;

    ${(props) => props.theme.breakpoints.up('xs')} {
      font-size: 2.6rem;
      line-height: 2.6rem;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      font-size: 3rem;
      line-height: 3rem;
    }

    > span {
      font-size: 2rem;
      font-weight: 400;
    }
  }

  > .upcoming-header {
    padding-top: 2rem;

    > button {
      font-weight: bold;
    }
  }
`;

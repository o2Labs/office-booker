import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    padding: 2rem 2rem 3rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 6rem 5rem 5rem;
  }

  text-align: center;

  > .card {
    ${(props) => props.theme.breakpoints.up('xs')} {
      display: block;

      padding: 3rem;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      display: inline-block;

      padding: 6rem;
    }

    text-align: center;

    > h2,
    > h3,
    > h4,
    > h5,
    > p {
      margin: 0;
    }

    > h2 {
      ${(props) => props.theme.breakpoints.up('xs')} {
        font-size: 3.6rem;
        line-height: 4.6rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        font-size: 7rem;
        line-height: 8rem;
      }

      color: ${(props) => props.theme.palette.primary.main};
    }

    > h3 {
      ${(props) => props.theme.breakpoints.up('xs')} {
        margin-top: 1.4rem;

        font-size: 2.6rem;
        line-height: 3.6rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        margin-top: 2rem;

        font-size: 5rem;
        line-height: 6rem;
      }
    }

    > .breaker {
      ${(props) => props.theme.breakpoints.up('xs')} {
        width: 10rem;

        margin: 2rem auto;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        width: 20rem;

        margin: 4rem auto 3.8rem;
      }

      height: 0.8rem;

      background-color: ${(props) => props.theme.palette.secondary.main};
    }

    > h4 {
      ${(props) => props.theme.breakpoints.up('xs')} {
        font-size: 2.6rem;
        line-height: 3.6rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        font-size: 5rem;
        line-height: 6rem;
      }

      word-wrap: break-word;
    }

    > h5 {
      ${(props) => props.theme.breakpoints.up('xs')} {
        font-size: 1.8rem;
        line-height: 2.8rem;
      }

      ${(props) => props.theme.breakpoints.up('sm')} {
        font-size: 3rem;
        line-height: 4rem;
      }

      color: #a0a0a0;
      font-style: italic;
    }

    > .parking {
      color: ${(props) => props.theme.palette.secondary.main};

      font-size: 3.4rem;
      svg {
        font-size: 3.4rem;
      }
    }
  }

  > .message {
    font-size: 2.5rem;
  }

  > .button {
    ${(props) => props.theme.breakpoints.up('xs')} {
      margin-top: 3rem;
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      margin-top: 5rem;
    }
  }
`;

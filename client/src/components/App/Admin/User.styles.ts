import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.only('xs')} {
    padding: 0 2rem 2rem;
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    padding: 0 3rem 3rem;
  }

  > h3 {
    margin: 0 0 1.4rem;

    color: ${(props) => props.theme.palette.primary.main};
    font-size: 1.8rem;
    font-weight: 500;
  }

  > .form-container {
    padding: 2rem 3rem 3rem;

    > h4 {
      margin: 0 0 1.6rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 700;
    }

    > h5 {
      margin: 0 0 2.4rem;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 1.6rem;
      font-weight: 500;
    }

    > form {
      > .field {
        margin-bottom: 2.4rem;

        .input {
          ${(props) => props.theme.breakpoints.only('xs')} {
            width: 100%;
          }

          ${(props) => props.theme.breakpoints.up('sm')} {
            min-width: 25rem;
          }
        }
      }
    }

    > .user-bookings {
      margin-top: 3rem;
      color: ${(props) => props.theme.palette.primary.main};

      > ul {
        margin: 0;

        &:not(:last-child) {
          margin-bottom: 2.2rem;
        }

        > li {
          color: ${(props) => props.theme.palette.secondary.main};
          font-size: 1.4rem;
          font-weight: 400;
        }
      }
    }
  }

  > .help {
    margin-top: 3rem;

    > h3 {
      margin: 0 0 1.4rem;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 1.8rem;
      font-weight: 400;
    }

    > h4 {
      margin: 0 0 1.4rem;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 1.4rem;
      font-weight: 700;
    }

    p {
      margin: 0 0 2rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.4rem;
      font-weight: 400;

      > a {
        color: ${(props) => props.theme.palette.primary.main};
      }
    }

    > ul {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 2.2rem;
      }

      > li {
        color: ${(props) => props.theme.palette.secondary.main};
        font-size: 1.4rem;
        font-weight: 400;
      }
    }
  }
`;

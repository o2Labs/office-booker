import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
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
      margin: 0 0 2.4rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 700;
    }

    > form {
      > .field {
        margin-bottom: 2.4rem;

        &.bump {
          margin-left: 0.6rem;
        }

        &.short {
          margin-bottom: 1.6rem;
        }

        > p {
          margin: 0;
        }

        > fieldset {
          padding-left: 0.6rem;

          > legend {
            margin-bottom: 0.6rem;

            font-size: 1.4rem;
          }
        }

        > .input {
          min-width: 25rem;
        }
      }
    }
  }
`;

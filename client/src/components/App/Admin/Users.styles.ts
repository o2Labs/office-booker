import styled from 'styled-components';

export default styled.div`
  ${(props) => props.theme.breakpoints.up('xs')} {
    margin: 0 2rem 2.4rem;
    .MuiPaper-root {
      padding: 2rem 2rem 2.4rem;
    }
  }

  ${(props) => props.theme.breakpoints.up('sm')} {
    margin: 0 3rem 4rem;
    .MuiPaper-root {
      padding: 3rem 3rem 4rem;
    }
  }

  margin: 0 3rem;

  p,
  label {
    color: ${(props) => props.theme.palette.secondary.main};
    font-size: 1.6rem;
    font-weight: 400;

    margin: 0;

    > a {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }

  .breadcrumb-text {
    margin: 0;
  }

  .breadcrumb-text.previous {
    color: #000000de;
  }

  .filters {
    margin-bottom: 2rem;
    display: flex;

    ${(props) => props.theme.breakpoints.up('xs')} {
      flex-direction: column;

      .search-user {
        .MuiFormControl-root {
          width: 100%;
        }
      }

      .filter-roles {
        margin-top: 3rem;
      }
    }

    ${(props) => props.theme.breakpoints.up('sm')} {
      flex-direction: row;
      justify-content: space-between;

      .search-user {
        margin-right: 4rem;

        .MuiFormControl-root {
          min-width: 30rem;
        }
      }

      .filter-roles {
        margin: 0rem;
      }
    }

    .search-user {
      display: flex;
      align-items: center;
      form {
        width: 100%;
      }
    }

    .filter-roles {
      .MuiSelect-select {
        min-width: 12rem;
      }
    }
  }

  .edit-user {
    form {
      .user-email-tt {
        font-size: 2.5rem;
        margin: 2rem 0;
      }

      h4 {
        margin-bottom: 2rem;
        color: #000000de;
      }

      .MuiFormControl-root {
        min-width: 25rem;

        margin-right: 1rem;
      }

      input {
        font-size: 2.5rem;
      }

      .buttons {
        margin-top: 2rem;

        button {
          margin-right: 1rem;
        }
      }

      .role-container {
        display: flex;
        flex-direction: column;

        margin-bottom: 2rem;

        .MuiFormControl-root {
          margin-bottom: 1.5rem;
        }

        .chips-select {
          .MuiSelect-select {
            overflow: scroll;
          }
        }
      }
    }
  }

  .docs {
    margin-top: 1em;

    > p,
    ul > li {
      color: ${(props) => props.theme.palette.secondary.main};
    }
  }

  .listing-container {
    overflow: scroll;
  }

  .load-more-container {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }
`;

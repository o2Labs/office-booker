import styled from 'styled-components';

export default styled.div`
  padding: 3rem;

  .redirect {
    > h2 {
      margin: 0 0 1.4rem;

      color: ${(props) => props.theme.palette.primary.main};
      font-size: 2.4rem;
      font-weight: 400;
    }

    p {
      margin: 0 0 2rem;

      color: ${(props) => props.theme.palette.secondary.main};
      font-size: 1.6rem;
      font-weight: 400;
    }
  }

  .form-label {
    margin: 1 0 1.4rem;

    color: #0019a5;
    font-size: 1.8rem;
    font-weight: 400;
  }

  .select-container {
    margin-bottom: 4rem;

    .MuiFormControl-root {
      width: 30%;
      min-width: 20rem;
    }
  }

  .btn-container {
    display: flex;
    justify-content: left;
    margin: 1rem 0;
  }
`;

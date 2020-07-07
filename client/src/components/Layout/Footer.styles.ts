import styled from 'styled-components';

export default styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;

  background: #48acde;

  padding: 0.8rem 3rem;

  > .link {
    flex: 0 0 auto;

    margin: 0.4rem 0;

    &:not(:first-of-type) {
      margin-left: 1rem;
      padding-left: 1rem;

      border-left: 1px solid rgb(255, 255, 255, 0.4);
    }

    > button {
      color: white;
      font-size: 1.3rem;
    }

    > a {
      color: white;
      font-size: 1.3rem;
      vertical-align: middle;
      line-height: normal;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

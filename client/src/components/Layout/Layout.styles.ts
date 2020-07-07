import styled from 'styled-components';

import squaresBg from '../../assets/images/squares-small.png';

export default styled.div`
  display: flex;
  flex-direction: column;

  min-height: 100vh;

  > header {
    flex: 0 0 auto;
  }

  > main {
    flex: 1 1 auto;

    background: url(${squaresBg});
  }

  > footer {
    flex: 0 0 auto;
  }
`;

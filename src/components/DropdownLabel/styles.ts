import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h6 {
    color: ${({ theme }) => theme.colors.gray[12]};
    font-size: 1.6rem;
    font-family: sans-serif;
  }

  span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.4rem;
    align-self: flex-start !important;
  }
`;

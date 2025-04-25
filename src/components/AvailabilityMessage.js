import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 20px auto;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  background: linear-gradient(to bottom, #ffffff, #f9faff);
  transition: all 0.4s ease;
  border: 1px solid rgba(82, 132, 255, 0.1);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  
  &:hover {
    box-shadow: 0 15px 35px rgba(82, 132, 255, 0.15);
    transform: translateY(-3px);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #3b82f6, #5284ff);
  }
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
`;

const DomainName = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 20px 0;
  background: linear-gradient(90deg, #3b82f6, #5284ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const AvailabilityIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px rgba(74, 222, 128, 0.25);
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const MessageText = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 24px;
  max-width: 500px;
  
  strong {
    color: #1f2937;
  }
`;

const InfoBox = styled.div`
  background-color: rgba(82, 132, 255, 0.08);
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 16px;
  width: 100%;
  max-width: 500px;
  border-left: 4px solid #5284ff;
  
  p {
    margin: 0;
    font-size: 15px;
    color: #4b5563;
    line-height: 1.5;
  }
  
  strong {
    color: #1f2937;
  }
`;

const AvailabilityMessage = ({ result }) => {
  if (!result || !result.available) return null;
  
  const { name } = result;
  
  return (
    <Container>
      <MessageContent>
        <AvailabilityIcon>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </AvailabilityIcon>
        
        <DomainName>{name}</DomainName>
        
        <MessageText>
          The domain <strong>{name}</strong> is available on the Taraxa network.
        </MessageText>
        
        <InfoBox>
          <p>
            <strong>Note:</strong> Domain registration is currently disabled. The registration functionality will be available in a future update.
          </p>
        </InfoBox>
      </MessageContent>
    </Container>
  );
};

export default AvailabilityMessage;

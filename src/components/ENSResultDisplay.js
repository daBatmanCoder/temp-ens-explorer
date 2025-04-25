import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 20px auto;
  padding: 28px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  background: #1a1a1a;
  transition: all 0.4s ease;
  border: 1px solid rgba(0, 234, 144, 0.2);
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: 0 15px 35px rgba(0, 234, 144, 0.15);
    transform: translateY(-3px);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 6px;
    background: linear-gradient(90deg, #00EA90, #00c070);
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  position: relative;
`;

const DomainName = styled.h2`
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  background: linear-gradient(90deg, #00EA90, #00c070);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #00EA90, #00c070);
    border-radius: 3px;
  }
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  margin-left: 16px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #00EA90;
    background-color: rgba(0, 234, 144, 0.2);
  }
`;

const InfoSection = styled.div`
  margin-bottom: 28px;
  padding: 20px;
  background-color: #212121;
  border-radius: 16px;
  border: 1px solid #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 234, 144, 0.3);
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: #b3b3b3;
  font-size: 15px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #00EA90;
  }
`;

const InfoValue = styled.div`
  color: #000000;
  font-size: 15px;
  word-break: break-all;
  font-family: ${props => props.monospace ? '"Roboto Mono", monospace' : 'inherit'};
  background-color: ${props => props.monospace ? 'rgba(0, 234, 144, 0.1)' : 'transparent'};
  padding: ${props => props.monospace ? '8px 12px' : '0'};
  border-radius: ${props => props.monospace ? '8px' : '0'};
  border: ${props => props.monospace ? '1px solid rgba(0, 234, 144, 0.2)' : 'none'};
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #00EA90;
  }
`;

const ExternalLink = styled.a`
  color: #00EA90;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  
  &:hover {
    color: #00c070;
    text-decoration: underline;
  }
  
  svg {
    margin-left: 6px;
    opacity: 0.7;
  }
`;

const CopyIndicator = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  
  &.visible {
    opacity: 1;
    top: -40px;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #1f2937;
  }
`;

const AddressContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const AddressCopyButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #00EA90;
    background-color: rgba(0, 234, 144, 0.1);
  }
`;

const ENSResultDisplay = ({ result }) => {
  const [copiedField, setCopiedField] = useState(null);
  
  if (!result) return null;
  
  // If domain is available, this component doesn't show anything
  // The AvailabilityDisplay component will handle that case
  if (result.available) return null;
  
  const { name, owner, resolverAddress, address } = result;
  
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const renderOwnershipInfo = () => {
    return (
      <ContentWrapper id="owner-details">
        <SectionHeader>Ownership Information</SectionHeader>
        <RecordGrid>
          <RecordLabel>Owner</RecordLabel>
          <RecordValue monospace>{ensData?.owner || 'Not set'}</RecordValue>
          
          <RecordLabel>Manager</RecordLabel>
          <RecordValue monospace>{ensData?.manager || 'Not set'}</RecordValue>
          
          {ensData?.registrant && (
            <>
              <RecordLabel>Registrant</RecordLabel>
              <RecordValue monospace>{ensData.registrant}</RecordValue>
            </>
          )}
          
          <RecordLabel>Expiration Date</RecordLabel>
          <RecordValue>
            {ensData?.expiryDate 
              ? formatExpiry(ensData.expiryDate)
              : ensData?.isSubdomain 
                ? 'N/A (Subdomain)' 
                : 'Not available'
            }
          </RecordValue>
        </RecordGrid>
      </ContentWrapper>
    );
  };
  
  return (
    <Container>
      <Header>
        <DomainName>{name}</DomainName>
        <CopyButton 
          onClick={() => copyToClipboard(name, 'domain')} 
          title="Copy domain name"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5V7C16 8.10457 16.8954 9 18 9H20C21.1046 9 22 9.89543 22 11V17C22 18.1046 21.1046 19 20 19H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <CopyIndicator className={copiedField === 'domain' ? 'visible' : ''}>
            Copied!
          </CopyIndicator>
        </CopyButton>
      </Header>
      
      <InfoSection>
        <SectionTitle>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Ownership Information
        </SectionTitle>
        <InfoGrid>
          <InfoLabel>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Owner
          </InfoLabel>
          <AddressContainer>
            <InfoValue monospace>
              <ExternalLink 
                href={`https://explorer.taraxa.io/address/${owner}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {shortenAddress(owner)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ExternalLink>
            </InfoValue>
            <AddressCopyButton 
              onClick={() => copyToClipboard(owner, 'owner')} 
              title="Copy owner address"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5V7C16 8.10457 16.8954 9 18 9H20C21.1046 9 22 9.89543 22 11V17C22 18.1046 21.1046 19 20 19H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CopyIndicator className={copiedField === 'owner' ? 'visible' : ''}>
                Copied!
              </CopyIndicator>
            </AddressCopyButton>
          </AddressContainer>
          
          <InfoLabel>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Resolver
          </InfoLabel>
          <AddressContainer>
            <InfoValue monospace>
              <ExternalLink 
                href={`https://explorer.taraxa.io/address/${resolverAddress}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {shortenAddress(resolverAddress)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </ExternalLink>
            </InfoValue>
            <AddressCopyButton 
              onClick={() => copyToClipboard(resolverAddress, 'resolver')} 
              title="Copy resolver address"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V17M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M16 5V7C16 8.10457 16.8954 9 18 9H20C21.1046 9 22 9.89543 22 11V17C22 18.1046 21.1046 19 20 19H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <CopyIndicator className={copiedField === 'resolver' ? 'visible' : ''}>
                Copied!
              </CopyIndicator>
            </AddressCopyButton>
          </AddressContainer>
        </InfoGrid>
      </InfoSection>
    </Container>
  );
};

export default ENSResultDisplay;

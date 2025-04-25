import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  margin: 20px auto;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background-color: #1a1a1a;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #333;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tab = styled.button`
  padding: 12px 20px;
  background-color: ${props => props.active ? '#00EA90' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-radius: 12px 12px 0 0;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background-color: ${props => props.active ? '#00EA90' : 'rgba(0, 234, 144, 0.1)'};
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${props => props.active ? '#00EA90' : 'transparent'};
    border-radius: 3px 3px 0 0;
  }
`;

const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RecordItem = styled.div`
  padding: 16px;
  border-radius: 12px;
  background-color: #212121;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    border-color: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const RecordKey = styled.div`
  font-weight: bold;
  color: white;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RecordValue = styled.div`
  font-size: 14px;
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
  color: #00EA90;
  ${props => props.monospace && `
    font-family: 'Roboto Mono', monospace;
  `}
`;

const NoRecords = styled.div`
  color: #999;
  font-style: italic;
  padding: 24px 0;
  text-align: center;
  background-color: #1e1e1e;
  border-radius: 12px;
  border: 1px dashed #333;
`;

const TabBadge = styled.span`
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : '#00EA90'};
  color: ${props => props.active ? 'white' : 'white'};
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
  font-weight: bold;
`;

const CopyButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 234, 144, 0.1);
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    background-color: rgba(0, 234, 144, 0.2);
  }
`;

const DomainInfoTabs = ({ result }) => {
  const [activeTab, setActiveTab] = React.useState('text');
  const [copiedField, setCopiedField] = React.useState(null);
  
  if (!result || result.available) return null;
  
  // Extract data from result
  const textRecords = result.textRecords || {};
  const address = result.address;
  const ownerAddress = result.owner;
  
  // Count records for badges
  const textRecordsCount = Object.keys(textRecords).length;
  const hasAddress = !!ownerAddress;
  
  // Helper functions
  const formatTwitter = (handle) => {
    if (!handle) return handle;
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  const formatUrl = (url) => {
    if (!url) return url;
    return url.startsWith('http') ? url : `https://${url}`;
  };
  
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <Container>
      <TabsContainer>
        <Tab 
          active={activeTab === 'text'} 
          onClick={() => setActiveTab('text')}
        >
          Text Records
          {textRecordsCount > 0 && <TabBadge active={activeTab === 'text'}>{textRecordsCount}</TabBadge>}
        </Tab>
        <Tab 
          active={activeTab === 'addresses'} 
          onClick={() => setActiveTab('addresses')}
        >
          Addresses
          {hasAddress && <TabBadge active={activeTab === 'addresses'}>1</TabBadge>}
        </Tab>
      </TabsContainer>
      
      <TabContent active={activeTab === 'text'}>
        {textRecordsCount > 0 ? (
          <RecordsList>
            {textRecords.name && (
              <RecordItem>
                <RecordKey>Name</RecordKey>
                <RecordValue>{textRecords.name}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords.email && (
              <RecordItem>
                <RecordKey>Email</RecordKey>
                <RecordValue>
                  <a href={`mailto:${textRecords.email}`}>{textRecords.email}</a>
                </RecordValue>
              </RecordItem>
            )}
            
            {textRecords.url && (
              <RecordItem>
                <RecordKey>Website</RecordKey>
                <RecordValue>
                  <a href={formatUrl(textRecords.url)} target="_blank" rel="noopener noreferrer">
                    {textRecords.url}
                  </a>
                </RecordValue>
              </RecordItem>
            )}
            
            {textRecords['com.twitter'] && (
              <RecordItem>
                <RecordKey>Twitter</RecordKey>
                <RecordValue>
                  <a 
                    href={`https://twitter.com/${textRecords['com.twitter'].replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {formatTwitter(textRecords['com.twitter'])}
                  </a>
                </RecordValue>
              </RecordItem>
            )}
            
            {textRecords['com.github'] && (
              <RecordItem>
                <RecordKey>GitHub</RecordKey>
                <RecordValue>
                  <a 
                    href={`https://github.com/${textRecords['com.github']}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {textRecords['com.github']}
                  </a>
                </RecordValue>
              </RecordItem>
            )}
            
            {textRecords['com.discord'] && (
              <RecordItem>
                <RecordKey>Discord</RecordKey>
                <RecordValue>{textRecords['com.discord']}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords['com.reddit'] && (
              <RecordItem>
                <RecordKey>Reddit</RecordKey>
                <RecordValue>
                  <a 
                    href={`https://reddit.com/user/${textRecords['com.reddit']}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    u/{textRecords['com.reddit']}
                  </a>
                </RecordValue>
              </RecordItem>
            )}
            
            {textRecords.description && (
              <RecordItem>
                <RecordKey>Description</RecordKey>
                <RecordValue>{textRecords.description}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords.notice && (
              <RecordItem>
                <RecordKey>Notice</RecordKey>
                <RecordValue>{textRecords.notice}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords.keywords && (
              <RecordItem>
                <RecordKey>Keywords</RecordKey>
                <RecordValue>{textRecords.keywords}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords.location && (
              <RecordItem>
                <RecordKey>Location</RecordKey>
                <RecordValue>{textRecords.location}</RecordValue>
              </RecordItem>
            )}
            
            {textRecords.avatar && (
              <RecordItem>
                <RecordKey>Avatar</RecordKey>
                <RecordValue>
                  {textRecords.avatar.startsWith('http') ? (
                    <img 
                      src={textRecords.avatar} 
                      alt="Avatar" 
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', marginTop: '8px' }} 
                    />
                  ) : (
                    textRecords.avatar
                  )}
                </RecordValue>
              </RecordItem>
            )}
            
            {/* Display any other text records not explicitly handled above */}
            {Object.entries(textRecords).map(([key, value]) => {
              if (!['name', 'email', 'url', 'com.twitter', 'com.github', 'com.discord', 'com.reddit', 
                   'description', 'notice', 'keywords', 'location', 'avatar'].includes(key)) {
                return (
                  <RecordItem key={key}>
                    <RecordKey>{key}</RecordKey>
                    <RecordValue>{value}</RecordValue>
                  </RecordItem>
                );
              }
              return null;
            })}
          </RecordsList>
        ) : (
          <NoRecords>No text records found for this domain</NoRecords>
        )}
      </TabContent>
      
      <TabContent active={activeTab === 'addresses'}>
        {ownerAddress ? (
          <RecordsList>
            <RecordItem>
              <RecordKey>ETH Address</RecordKey>
              <RecordValue monospace>
                {ownerAddress}
                <CopyButton 
                  onClick={() => copyToClipboard(ownerAddress, 'address')}
                  title="Copy address to clipboard"
                  style={{ top: '12px', transform: 'none' }}
                >
                  {copiedField === 'address' ? '✓' : '📋'}
                </CopyButton>
              </RecordValue>
            </RecordItem>
          </RecordsList>
        ) : (
          <NoRecords>No address records found for this domain</NoRecords>
        )}
      </TabContent>
    </Container>
  );
};

export default DomainInfoTabs;

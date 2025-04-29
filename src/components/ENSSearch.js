import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 40px;
  position: relative;
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  position: relative;
  
  @media (min-width: 640px) {
    flex-direction: row;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 18px 24px;
  padding-left: 54px;
  border: 2px solid #2a2a2a;
  border-radius: 16px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #1e1e1e;
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  
  &:focus {
    outline: none;
    border-color: #00EA90;
    box-shadow: 0 8px 20px rgba(0, 234, 144, 0.15);
    transform: translateY(-2px);
  }
  
  &::placeholder {
    color: #777;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #00EA90;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const SearchButton = styled.button`
  padding: 18px 32px;
  background: linear-gradient(135deg, #00EA90 0%, #00c070 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 20px rgba(0, 234, 144, 0.3);
    background: linear-gradient(135deg, #00ffA0 0%, #00d080 100%);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 4px 8px rgba(0, 234, 144, 0.2);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #465673 0%, #2c3e66 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  svg {
    margin-right: 10px;
  }
`;

const ErrorMessage = styled.div`
  color: #f8c0c0;
  padding: 16px;
  background-color: rgba(41, 35, 46, 0.7);
  border-radius: 12px;
  margin-top: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-left: 4px solid #805ad5;
  
  svg {
    margin-right: 12px;
    flex-shrink: 0;
  }
`;

const LoadingSpinner = styled.div`
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 10px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const SearchTips = styled.div`
  margin-top: 16px;
  font-size: 14px;
  color: #b3b3b3;
  padding: 12px 16px;
  background-color: #1e1e1e;
  border-radius: 12px;
  line-height: 1.5;
  border: 1px solid #2a2a2a;
  
  strong {
    color: #00EA90;
  }
`;

const RetryButton = styled.button`
  margin-left: 16px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
`;

const ENSSearch = ({ onSearch, loading, error }) => {
  const [inputValue, setInputValue] = useState('');
  const [showTips, setShowTips] = useState(false);

  // Show tips when input is focused and empty
  const handleFocus = () => {
    if (!inputValue.trim()) {
      setShowTips(true);
    }
  };

  const handleBlur = () => {
    // Small delay to allow clicking on tips
    setTimeout(() => setShowTips(false), 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
      setShowTips(false);
    }
  };

  const handleRetry = () => {
    if (inputValue.trim()) {
      // Force a new search with the current input
      onSearch(inputValue.trim());
    }
  };

  // Example domains for the Taraxa network
  const exampleDomains = ['vitalik', 'satoshi', 'taraxa'];
  const [exampleDomain, setExampleDomain] = useState(exampleDomains[0]);

  // Rotate example domains every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setExampleDomain(prevDomain => {
        const currentIndex = exampleDomains.indexOf(prevDomain);
        const nextIndex = (currentIndex + 1) % exampleDomains.length;
        return exampleDomains[nextIndex];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <SearchContainer>
      <SearchForm onSubmit={handleSubmit}>
        <InputWrapper>
          <SearchIcon>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder={`Search for a name (e.g., ${exampleDomain})`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={loading}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </InputWrapper>
        <SearchButton type="submit" disabled={loading || !inputValue.trim()}>
          {loading ? (
            <>
              <LoadingSpinner />
              Searching...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Search
            </>
          )}
        </SearchButton>
      </SearchForm>
      
      {showTips && (
        <SearchTips>
          <strong>Search Tips:</strong>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Enter a name without any suffix to search with <strong>.tara</strong> automatically added</li>
            <li>You can also search for full names like <strong>example.tara</strong></li>
            <li>Search is not case-sensitive</li>
          </ul>
        </SearchTips>
      )}
      
      {error && (
        <ErrorMessage>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#805ad5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
          <RetryButton onClick={handleRetry}>
            Try Again
          </RetryButton>
        </ErrorMessage>
      )}
    </SearchContainer>
  );
};

export default ENSSearch;

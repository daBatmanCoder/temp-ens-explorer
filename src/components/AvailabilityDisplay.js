import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from '../utils/config';
import { 
  generateSecret, 
  makeCommitment, 
  submitCommitment, 
  registerDomain, 
  getRegistrationPrice,
  getMinimumRegistrationPrice,
  decodeTransactionError
} from '../utils/web3';

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 20px auto;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background-color: white;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const Title = styled.h3`
  font-size: 20px;
  margin-bottom: 20px;
  color: #5284ff;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  font-weight: 700;
`;

const AvailableMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9f0 0%, #e6f7e6 100%);
  border-radius: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const AvailableIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
`;

const AvailableText = styled.p`
  font-size: 22px;
  font-weight: bold;
  color: #4caf50;
  margin-bottom: 12px;
`;

const AvailableDescription = styled.p`
  color: #4b5563;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
  font-size: 16px;
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  max-width: 300px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.3);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #a5d6a7 0%, #c8e6c9 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const RetryButton = styled(RegisterButton)`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  margin-top: 16px;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
  }
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin-top: 16px;
`;

const DomainName = styled.span`
  font-weight: 700;
  color: #1f2937;
`;

const RegistrationSteps = styled.div`
  margin-top: 24px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const StepTitle = styled.h4`
  font-size: 18px;
  margin-bottom: 16px;
  color: #1f2937;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#5284ff' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepLabel = styled.div`
  font-weight: 600;
  color: ${props => props.active ? '#5284ff' : '#1f2937'};
  margin-bottom: 4px;
`;

const StepDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const PriceInfo = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #f0f7ff;
  border-radius: 12px;
  border-left: 4px solid #5284ff;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px dashed #cbd5e1;
    font-weight: bold;
  }
`;

const PriceLabel = styled.div`
  color: #4b5563;
`;

const PriceValue = styled.div`
  font-family: "Roboto Mono", monospace;
  color: #1f2937;
`;

const InputGroup = styled.div`
  margin-top: 16px;
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4b5563;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #5284ff;
    box-shadow: 0 0 0 3px rgba(82, 132, 255, 0.15);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 14px;
  margin-top: 8px;
  padding: 12px;
  background-color: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  margin-top: 24px;
  padding: 16px;
  background-color: #f0f9f0;
  border-radius: 12px;
  border-left: 4px solid #4caf50;
  color: #1f2937;
  animation: fadeIn 0.5s ease-out;
`;

const CountdownTimer = styled.div`
  margin: 20px 0;
  padding: 16px;
  background-color: #f0f7ff;
  border-radius: 12px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #5284ff;
  
  span {
    font-size: 24px;
    margin: 0 4px;
  }
`;

const TransactionStatus = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  background-color: ${props => props.success ? '#f0f9f0' : props.error ? '#fef2f2' : '#f0f7ff'};
  color: ${props => props.success ? '#4caf50' : props.error ? '#ef4444' : '#5284ff'};
  border-left: 4px solid ${props => props.success ? '#4caf50' : props.error ? '#ef4444' : '#5284ff'};
  width: 100%;
  max-width: 500px;
`;

const DebugInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  font-family: monospace;
  font-size: 12px;
  color: #64748b;
  max-width: 500px;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const AvailabilityDisplay = ({ result }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [registrationDuration, setRegistrationDuration] = useState(1); // in years
  const [registrationPrice, setRegistrationPrice] = useState(null);
  const [contractPrice, setContractPrice] = useState(null);
  const [commitmentHash, setCommitmentHash] = useState(null);
  const [commitmentTimestamp, setCommitmentTimestamp] = useState(null);
  const [registrationError, setRegistrationError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [secret] = useState(generateSecret()); // Generate a random secret
  const [countdown, setCountdown] = useState(60);
  const [commitTxHash, setCommitTxHash] = useState(null);
  const [registerTxHash, setRegisterTxHash] = useState(null);
  const [commitTxStatus, setCommitTxStatus] = useState(null);
  const [registerTxStatus, setRegisterTxStatus] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Check if wallet is connected
    const checkWalletConnection = () => {
      const isConnected = localStorage.getItem('walletConnected') === 'true';
      setIsWalletConnected(isConnected);
    };

    checkWalletConnection();
    window.addEventListener('wallet_connected', checkWalletConnection);
    window.addEventListener('wallet_disconnected', checkWalletConnection);

    return () => {
      window.removeEventListener('wallet_connected', checkWalletConnection);
      window.removeEventListener('wallet_disconnected', checkWalletConnection);
    };
  }, []);

  useEffect(() => {
    // Calculate registration price based on name length and duration
    const calculatePrice = async () => {
      if (!result || !result.name) return;

      try {
        // First try to get price from contract
        const durationInSeconds = registrationDuration * 31536000;
        const label = result.name.split('.')[0];
        
        try {
          const contractPriceData = await getRegistrationPrice(label, durationInSeconds);
          setContractPrice(contractPriceData);
          
          // Use contract price for display
          setRegistrationPrice({
            basePrice: parseFloat(contractPriceData.base),
            duration: registrationDuration,
            total: parseFloat(contractPriceData.total)
          });
          
          return;
        } catch (error) {
          console.warn('Could not get price from contract, using fallback price:', error);
        }
        
        // Fallback to simplified pricing model if contract call fails
        const nameLength = label.length;
        let basePrice;

        if (nameLength >= 5) {
          basePrice = 5; // $5 USD for 5+ letter names
        } else if (nameLength === 4) {
          basePrice = 160; // $160 USD for 4 letter names
        } else if (nameLength === 3) {
          basePrice = 640; // $640 USD for 3 letter names
        } else {
          basePrice = 0; // Not available for registration
        }

        // Convert to TARA (simplified conversion for demo)
        const taraPrice = basePrice * 0.0003; // Approximate conversion
        
        // Get minimum price as fallback
        const minPrice = getMinimumRegistrationPrice(durationInSeconds);
        
        // Use the higher of the two prices
        const finalBasePrice = Math.max(taraPrice, parseFloat(minPrice.base));
        
        setRegistrationPrice({
          basePrice: finalBasePrice,
          duration: registrationDuration,
          total: finalBasePrice * registrationDuration
        });
      } catch (error) {
        console.error('Error calculating price:', error);
        setRegistrationError('Error calculating registration price');
      }
    };

    calculatePrice();
  }, [result, registrationDuration]);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (currentStep === 1 && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && currentStep === 1) {
      setCurrentStep(2);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, currentStep]);

  // Debug mode toggle with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+D to toggle debug mode
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!result || !result.available) return null;
  
  const { name } = result;

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 10) {
      setRegistrationDuration(value);
    }
  };

  const handleMakeCommitment = async () => {
    if (!isWalletConnected) {
      setRegistrationError('Please connect your wallet first');
      return;
    }

    setIsCommitting(true);
    setRegistrationError(null);
    setCommitTxStatus('pending');
    setDebugInfo(null);

    try {
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }
      
      // Duration in seconds (1 year = 31536000 seconds)
      const durationInSeconds = registrationDuration * 31536000;
      
      // Make commitment
      const hash = await makeCommitment(
        name.split('.')[0], // label
        walletAddress, // owner
        durationInSeconds, // duration
        secret, // secret
        NETWORK_CONFIG.contracts.resolver, // resolver
        [], // data
        false, // reverseRecord
        0 // fuses
      );
      
      // Debug info
      if (debugMode) {
        setDebugInfo({
          action: 'makeCommitment',
          parameters: {
            name: name.split('.')[0],
            owner: walletAddress,
            duration: durationInSeconds.toString(),
            secret: secret,
            resolver: NETWORK_CONFIG.contracts.resolver,
            data: [],
            reverseRecord: false,
            fuses: 0
          },
          result: hash
        });
      }
      
      // Submit commitment
      const txHash = await submitCommitment(hash);
      setCommitTxHash(txHash);
      
      setCommitmentHash(hash);
      setCommitmentTimestamp(Date.now());
      setCurrentStep(1);
      setCountdown(60);
      setCommitTxStatus('success');
      
    } catch (error) {
      console.error('Error making commitment:', error);
      setRegistrationError('Error making commitment: ' + (error.message || 'Unknown error'));
      setCommitTxStatus('error');
      
      if (debugMode) {
        setDebugInfo({
          action: 'makeCommitment',
          error: error.message,
          stack: error.stack
        });
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const handleRegisterDomain = async () => {
    if (!commitmentHash || !commitmentTimestamp) {
      setRegistrationError('Please make a commitment first');
      return;
    }

    // Check if enough time has passed since commitment (60 seconds)
    const timeSinceCommitment = Date.now() - commitmentTimestamp;
    if (timeSinceCommitment < 60000) {
      const remainingSeconds = Math.ceil((60000 - timeSinceCommitment) / 1000);
      setRegistrationError(`Please wait ${remainingSeconds} more seconds before registering`);
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);
    setRegisterTxStatus('pending');
    setDebugInfo(null);

    try {
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('Wallet address not found');
      }
      
      // Duration in seconds (1 year = 31536000 seconds)
      const durationInSeconds = registrationDuration * 31536000;
      
      // Register domain
      const txHash = await registerDomain(
        name.split('.')[0], // label
        walletAddress, // owner
        durationInSeconds, // duration
        secret, // secret
        NETWORK_CONFIG.contracts.resolver, // resolver
        [], // data
        false, // reverseRecord
        0 // fuses
      );
      
      setRegisterTxHash(txHash);
      setCurrentStep(3);
      setRegistrationSuccess(true);
      setRegisterTxStatus('success');
      
    } catch (error) {
      console.error('Error registering domain:', error);
      setRegistrationError('Error registering domain: ' + (error.message || 'Unknown error'));
      setRegisterTxStatus('error');
      
      // If there's a transaction hash in the error, try to decode it
      const txHash = error.transactionHash || 
                    (error.transaction && error.transaction.hash) || 
                    null;
      
      if (txHash) {
        setRegisterTxHash(txHash);
        
        // Try to get more details about the failed transaction
        try {
          const errorDetails = await decodeTransactionError(txHash);
          
          if (debugMode) {
            setDebugInfo({
              action: 'registerDomain',
              error: error.message,
              transactionHash: txHash,
              errorDetails: errorDetails
            });
          }
        } catch (decodeError) {
          console.error('Error decoding transaction error:', decodeError);
          
          if (debugMode) {
            setDebugInfo({
              action: 'registerDomain',
              error: error.message,
              transactionHash: txHash,
              decodeError: decodeError.message
            });
          }
        }
      } else if (debugMode) {
        setDebugInfo({
          action: 'registerDomain',
          error: error.message,
          stack: error.stack
        });
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRetryCommitment = () => {
    setCommitTxStatus(null);
    setRegistrationError(null);
    setDebugInfo(null);
    handleMakeCommitment();
  };

  const handleRetryRegistration = () => {
    setRegisterTxStatus(null);
    setRegistrationError(null);
    setDebugInfo(null);
    handleRegisterDomain();
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  return (
    <Container>
      <Title>Domain Registration</Title>
      
      <AvailableMessage>
        <AvailableIcon>✓</AvailableIcon>
        <AvailableText>Available!</AvailableText>
        <AvailableDescription>
          Good news! <DomainName>{name}</DomainName> is available for registration on the Taraxa network.
        </AvailableDescription>
        
        {!registrationSuccess && (
          <>
            <InputGroup>
              <InputLabel htmlFor="duration">Registration Duration (years)</InputLabel>
              <Input
                id="duration"
                type="number"
                min="1"
                max="10"
                value={registrationDuration}
                onChange={handleDurationChange}
                disabled={currentStep > 0}
              />
            </InputGroup>
            
            {registrationPrice && (
              <PriceInfo>
                <PriceRow>
                  <PriceLabel>Base Price (per year)</PriceLabel>
                  <PriceValue>{registrationPrice.basePrice.toFixed(6)} TARA</PriceValue>
                </PriceRow>
                <PriceRow>
                  <PriceLabel>Duration</PriceLabel>
                  <PriceValue>{registrationDuration} year{registrationDuration > 1 ? 's' : ''}</PriceValue>
                </PriceRow>
                <PriceRow>
                  <PriceLabel>Total</PriceLabel>
                  <PriceValue>{registrationPrice.total.toFixed(6)} TARA</PriceValue>
                </PriceRow>
                {debugMode && contractPrice && (
                  <PriceRow>
                    <PriceLabel>Contract Price (with 20% buffer)</PriceLabel>
                    <PriceValue>
                      {(parseFloat(contractPrice.total) * 1.2).toFixed(6)} TARA
                    </PriceValue>
                  </PriceRow>
                )}
              </PriceInfo>
            )}
            
            {currentStep === 0 && (
              <>
                <RegisterButton 
                  onClick={handleMakeCommitment} 
                  disabled={!isWalletConnected || isCommitting}
                >
                  {isCommitting ? 'Committing...' : 'Start Registration'}
                </RegisterButton>
                
                {commitTxStatus === 'error' && (
                  <RetryButton onClick={handleRetryCommitment}>
                    Retry Commitment
                  </RetryButton>
                )}
                
                {commitTxStatus === 'pending' && (
                  <TransactionStatus>
                    Transaction pending... Please wait for confirmation.
                  </TransactionStatus>
                )}
                
                {commitTxHash && commitTxStatus === 'success' && (
                  <TransactionStatus success>
                    Commitment successful! Transaction hash: {commitTxHash.substring(0, 10)}...
                  </TransactionStatus>
                )}
              </>
            )}
            
            {currentStep === 1 && (
              <CountdownTimer>
                Please wait: <span>{countdown}</span> seconds
              </CountdownTimer>
            )}
            
            {currentStep === 2 && (
              <>
                <RegisterButton 
                  onClick={handleRegisterDomain} 
                  disabled={!isWalletConnected || isRegistering}
                >
                  {isRegistering ? 'Registering...' : 'Complete Registration'}
                </RegisterButton>
                
                {registerTxStatus === 'error' && (
                  <RetryButton onClick={handleRetryRegistration}>
                    Retry Registration
                  </RetryButton>
                )}
                
                {registerTxStatus === 'pending' && (
                  <TransactionStatus>
                    Transaction pending... Please wait for confirmation.
                  </TransactionStatus>
                )}
                
                {registerTxHash && registerTxStatus === 'error' && (
                  <TransactionStatus error>
                    Registration failed. Transaction hash: {registerTxHash.substring(0, 10)}...
                  </TransactionStatus>
                )}
              </>
            )}
            
            {registrationError && (
              <ErrorMessage>{registrationError}</ErrorMessage>
            )}
            
            {debugMode && debugInfo && (
              <DebugInfo>
                <div>DEBUG INFO:</div>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </DebugInfo>
            )}
            
            <InfoText>
              {!isWalletConnected 
                ? 'Please connect your wallet to register this domain.' 
                : 'Registration requires a two-step process to prevent front-running.'}
            </InfoText>
            
            {debugMode && (
              <InfoText style={{ color: '#f59e0b', cursor: 'pointer' }} onClick={toggleDebugMode}>
                Debug Mode Active (Ctrl+Shift+D to toggle)
              </InfoText>
            )}
          </>
        )}
        
        {registrationSuccess && (
          <>
            <SuccessMessage>
              Congratulations! You have successfully registered <DomainName>{name}</DomainName>.
              You can now set up records for this domain.
            </SuccessMessage>
            
            {registerTxHash && (
              <TransactionStatus success>
                Registration successful! Transaction hash: {registerTxHash.substring(0, 10)}...
              </TransactionStatus>
            )}
          </>
        )}
      </AvailableMessage>
      
      <RegistrationSteps>
        <StepTitle>Registration Process</StepTitle>
        <StepsList>
          <Step>
            <StepNumber active={currentStep >= 0}>1</StepNumber>
            <StepContent>
              <StepLabel active={currentStep >= 0}>Commit</StepLabel>
              <StepDescription>
                Submit a commitment to register the name. This prevents front-running.
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber active={currentStep >= 1}>2</StepNumber>
            <StepContent>
              <StepLabel active={currentStep >= 1}>Wait</StepLabel>
              <StepDescription>
                Wait at least 60 seconds after your commitment is confirmed.
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber active={currentStep >= 2}>3</StepNumber>
            <StepContent>
              <StepLabel active={currentStep >= 2}>Register</StepLabel>
              <StepDescription>
                Complete the registration by revealing your commitment and paying the registration fee.
              </StepDescription>
            </StepContent>
          </Step>
          
          <Step>
            <StepNumber active={currentStep >= 3}>4</StepNumber>
            <StepContent>
              <StepLabel active={currentStep >= 3}>Manage</StepLabel>
              <StepDescription>
                Set up records for your new domain, such as addresses and text records.
              </StepDescription>
            </StepContent>
          </Step>
        </StepsList>
      </RegistrationSteps>
    </Container>
  );
};

export default AvailabilityDisplay;

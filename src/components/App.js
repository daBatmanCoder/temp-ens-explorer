import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useENSSearch } from '../hooks/useENSSearch';
import ENSSearch from '../components/ENSSearch';
import ENSResultDisplay from '../components/ENSResultDisplay';
import DomainInfoTabs from '../components/DomainInfoTabs';
import AvailabilityMessage from '../components/AvailabilityMessage';

// Dynamically import components that use browser-only features
const WalletConnect = dynamic(
  () => import('../components/WalletConnect'),
  { ssr: false }
);

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background: #121212;
  color: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
`;

const TopRightWalletContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 300px;
  z-index: 100;
  
  @media (max-width: 768px) {
    position: static;
    width: 100%;
    margin-bottom: 20px;
  }
`;

const Header = styled.header`
  width: 100%;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00EA90;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  align-self: flex-start;
  
  svg {
    margin-right: 12px;
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
  background: linear-gradient(90deg, #00EA90, #00c070);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #ffffff;
  max-width: 600px;
  line-height: 1.5;
  text-align: center;
`;

const MainContent = styled.main`
  width: 100%;
  max-width: 800px;
  animation: slideUp 0.6s ease-out;
  position: relative;
  z-index: 1;
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const NetworkBadge = styled.div`
  background-color: #00EA90;
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  
  &:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #ffffff;
    border-radius: 50%;
    margin-right: 8px;
  }
`;

const Footer = styled.footer`
  margin-top: 60px;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
  width: 100%;
  max-width: 800px;
  padding: 20px;
  border-top: 1px solid rgba(0, 234, 144, 0.1);
  position: relative;
  z-index: 1;
`;

const AnimationCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const App = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    searchResult, 
    loading, 
    error, 
    searchName 
  } = useENSSearch();
  
  const canvasRef = useRef(null);
  const [searchAttempts, setSearchAttempts] = useState(0);
  
  // Handler for search with auto-retry for failed searches
  const handleSearch = (name) => {
    setSearchTerm(name);
    searchName(name);
    
    // Track search attempts for potential auto-retry
    setSearchAttempts(prev => prev + 1);
  };
  
  // Auto-retry mechanism for failed searches
  useEffect(() => {
    let retryTimeout;
    
    if (error && searchTerm && searchAttempts < 3) {
      // Auto-retry after 3 seconds with increasing delay
      const retryDelay = 3000 + (searchAttempts * 1000);
      
      console.log(`Will auto-retry search in ${retryDelay/1000} seconds...`);
      
      retryTimeout = setTimeout(() => {
        console.log('Auto-retrying search...');
        searchName(searchTerm);
        setSearchAttempts(prev => prev + 1);
      }, retryDelay);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [error, searchTerm, searchAttempts, searchName]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particles array
    const particlesArray = [];
    const numberOfParticles = 50;
    
    // Handle resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
    
    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = '#00EA90';
        this.history = [];
        this.maxLength = Math.floor(Math.random() * 10) + 5;
      }
      
      update() {
        this.history.push({x: this.x, y: this.y});
        if (this.history.length > this.maxLength) {
          this.history.shift();
        }
        
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) {
          this.speedX = -this.speedX;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY = -this.speedY;
        }
      }
      
      draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw trail
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size / 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.history.length; i++) {
          const alpha = i / this.history.length * 0.6;
          ctx.strokeStyle = `rgba(0, 234, 144, ${alpha})`;
          
          if (i === 0) {
            ctx.moveTo(this.history[i].x, this.history[i].y);
          } else {
            ctx.lineTo(this.history[i].x, this.history[i].y);
          }
        }
        ctx.stroke();
      }
    }
    
    // Initialize particles
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    
    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(18, 18, 18, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      requestAnimationFrame(animate);
    }
    
    init();
    animate();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <AppContainer>
      <AnimationCanvas ref={canvasRef} />
      
      <TopRightWalletContainer>
        <WalletConnect />
      </TopRightWalletContainer>
      
      <Header>
        <Logo>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#00EA90"/>
            <path d="M22.5333 16.4267C22.5333 14.9067 21.8133 13.6 20.64 12.8267L16.3733 10.24C16.2667 10.1867 16.1333 10.1333 16 10.1333C15.8667 10.1333 15.7333 10.1867 15.6267 10.24L11.36 12.8267C10.1867 13.6 9.46667 14.9067 9.46667 16.4267V21.3333C9.46667 21.6 9.68 21.8133 9.94667 21.8133H12.2667C12.5333 21.8133 12.7467 21.6 12.7467 21.3333V16.32C12.7467 15.7867 13.0133 15.3067 13.44 15.04L16 13.44L18.56 15.04C18.9867 15.3067 19.2533 15.7867 19.2533 16.32V21.3333C19.2533 21.6 19.4667 21.8133 19.7333 21.8133H22.0533C22.32 21.8133 22.5333 21.6 22.5333 21.3333V16.4267Z" fill="white"/>
          </svg>
          Taraxa ENS Explorer
        </Logo>
        
        <HeaderContent>
          <Title>Explore Taraxa ENS Domains</Title>
          <Subtitle>
            Search for ENS domains on the Taraxa network and view ownership information, text records, addresses, and public keys.
          </Subtitle>
          <NetworkBadge>Taraxa Mainnet</NetworkBadge>
        </HeaderContent>
      </Header>

      <MainContent>
        <ENSSearch 
          onSearch={handleSearch} 
          loading={loading} 
          error={error} 
        />
        
        <ENSResultDisplay result={searchResult} />
        
        {searchResult && !searchResult.available && (
          <DomainInfoTabs result={searchResult} />
        )}
        
        {searchResult && searchResult.available && (
          <AvailabilityMessage result={searchResult} />
        )}
      </MainContent>
      
      <Footer>
        <p>© {new Date().getFullYear()} Taraxa ENS Explorer • Built for the Taraxa Network</p>
      </Footer>
    </AppContainer>
  );
};

export default App;

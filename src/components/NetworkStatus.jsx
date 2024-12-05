import React, { useEffect, useState } from 'react';
import { Connection } from '@solana/web3.js';
import './NetworkStatus.css';

const connection = new Connection('https://api.mainnet-beta.solana.com');

function NetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState('');
  const [tps, setTps] = useState(0);

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const health = await connection.getHealth();
        if (health === 'ok') {
          setNetworkStatus('connected');
        } else {
          setNetworkStatus('congested');
        }
      } catch (error) {
        setNetworkStatus('disconnected');
      }
    };

    const getTPS = async () => {
      try {
        const samples = await connection.getRecentPerformanceSamples(1);
        if (samples.length > 0) {
          setTps(samples[0].numTransactions / samples[0].samplePeriodSecs);
        }
      } catch (error) {
        console.error('Error fetching TPS:', error);
      }
    };

    checkNetworkStatus();
    getTPS();
    const interval = setInterval(() => {
      checkNetworkStatus();
      getTPS();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="network-status-container">
      <div className={`network-indicator ${networkStatus}`}></div>
      <div className="tps-indicator">
        <div className="tps-label">TPS: {tps.toFixed(2)}</div>
        <div className="tps-bars">
          {[...Array(Math.min(10, Math.ceil(tps / 500))).keys()].map((_, index) => (
            <div key={index} className="tps-bar"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NetworkStatus;

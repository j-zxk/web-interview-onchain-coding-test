import React from 'react';
import { Wallet } from 'lucide-react';
import logo from '../../assets/logo.png';

export const DefaultWalletIcon: React.FC = () => <Wallet size={24} />;

export const DefaultCurrencyIcon: React.FC = () => (
  <img className="w-full h-full" src={logo} />
);

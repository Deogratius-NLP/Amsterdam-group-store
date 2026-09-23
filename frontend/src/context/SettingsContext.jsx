import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { settingsService } from '../services/settingsService';
import {
  AMSTERDAM_WHATSAPP_NUMBER,
  AMSTERDAM_WHATSAPP_DISPLAY,
  AMSTERDAM_WHATSAPP_LINK
} from '../utils/constants';

const SettingsContext = createContext({
  whatsappNumber: AMSTERDAM_WHATSAPP_NUMBER,
  whatsappDisplay: AMSTERDAM_WHATSAPP_DISPLAY,
  whatsappLink: AMSTERDAM_WHATSAPP_LINK,
  isLoading: false,
  refreshSettings: () => {}
});

export const SettingsProvider = ({ children }) => {
  const [whatsappNumber, setWhatsappNumber] = useState(AMSTERDAM_WHATSAPP_NUMBER);
  const [whatsappDisplay, setWhatsappDisplay] = useState(AMSTERDAM_WHATSAPP_DISPLAY);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await settingsService.getPublicSettings();
      if (data && data.whatsapp_number) {
        setWhatsappNumber(data.whatsapp_number);
        setWhatsappDisplay(data.whatsapp_display || data.whatsapp_number);
      }
    } catch (err) {
      // Gracefully maintain fallback constants if offline or backend starting up
      console.warn('Using default system constants for settings:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <SettingsContext.Provider
      value={{
        whatsappNumber,
        whatsappDisplay,
        whatsappLink,
        isLoading,
        refreshSettings: fetchSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

import React, { useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css';
import axios from 'axios';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerDetails, setProviderDetails] = useState({});

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get('https://api.apis.guru/v2/providers.json');
        setProviders(response.data.data);
      } catch (error) {
        console.error('Error fetching Providers:', error);
      }
    };
    fetchProviders();
  }, []);

  const fetchProviderDetails = async (providerName) => {
    if (providerName) {
      try {
        const response = await axios.get(`https://api.apis.guru/v2/${providerName}.json`);
        const fetchedData = response.data.apis;
        return fetchedData && Object.keys(fetchedData).length > 0 ? fetchedData : {};
      } catch (error) {
        console.error('Error fetching Provider Details:', error);
        return {};
      }
    }
    return {};
  };

  const memoizedProviderDetails = useMemo(() => {
    if (selectedProvider) {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const details = await fetchProviderDetails(selectedProvider);
          resolve(details);
        }, 200); // 2-second delay
      });
    }
    return Promise.resolve({});
  }, [selectedProvider]);

  useEffect(() => {
    memoizedProviderDetails.then(details => setProviderDetails(details));
  }, [memoizedProviderDetails]);

  return (
    <>
      <div className="centered-button-container">
        <button onClick={toggleSidebar} className="explore-btn">
          Explore Web API's
        </button>
      </div>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''} scrollable-dropdown`}>
        <div className="sidebar-header">
          <h4>Select Provider</h4>
        </div>
        <div className="accordion" id="accordionExample">
          {providers.map((provider, index) => (
            <div className="accordion-item" key={index} onClick={() => setSelectedProvider(provider)}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className={`accordion-button ${selectedProvider === provider ? '' : 'collapsed'}`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={selectedProvider === provider}
                  aria-controls={`collapse${index}`}
                >
                  {provider}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${selectedProvider === provider ? 'show' : ''}`}
                aria-labelledby={`heading${index}`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  {selectedProvider === provider && Object.keys(providerDetails).length > 0 ? (
                    <ul className="custom-bullet-list">
                      {Object.keys(providerDetails).map((key) => (
                        <li key={key} style={{
                          backgroundImage: `url(${providerDetails[key].info['x-logo'].url})`
                        }}>
                          {providerDetails[key].info.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No additional information available</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}
    </>
  );
};

export default App;

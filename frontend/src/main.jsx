import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { ApolloProvider } from '@apollo/client/react';
import './index.css'
import App from './App.jsx'

// Create HTTP link
const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
});

// Initialize Apollo Client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)

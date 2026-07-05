/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded config based on the provisioned project
const firebaseConfig = {
  apiKey: "AIzaSyDlSJKjnOAN3u82ECvSof9MkUV2rDZPrAk",
  authDomain: "gen-lang-client-0287265037.firebaseapp.com",
  projectId: "gen-lang-client-0287265037",
  storageBucket: "gen-lang-client-0287265037.firebasestorage.app",
  messagingSenderId: "167488110742",
  appId: "1:167488110742:web:7672d70f8ddd80500c82b7"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard scopes for basic profile access
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
